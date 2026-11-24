import { supabaseAdmin, supabaseConfigured } from '@/lib/supabase';
import { type Degraus, type LinhaTela } from './funil';
import { respostasDaLinha, type RespostasDoQuiz } from './respostas';
import { faixaDe, notaPorRegras, notaPorSemelhanca, perfilDoComprador, type Faixa, type NotaPorRegras, type PerfilComprador } from './score';

/**
 * Leitura do painel do quiz. Só servidor, pela service role: as tabelas do quiz
 * não têm policy nem grant para o navegador.
 *
 * Toda leitura exclui a jornada de teste (`teste = true` no lead ou no evento).
 */

export const PERIODOS = [
  { dias: 1, rotulo: 'Hoje' },
  { dias: 7, rotulo: '7 dias' },
  { dias: 30, rotulo: '30 dias' },
  { dias: 365, rotulo: 'Tudo' },
] as const;

export const diasDoPeriodo = (v: string | undefined): number => {
  const n = Number(v);
  return PERIODOS.some((p) => p.dias === n) ? n : 7;
};

/** "Hoje" é desde a meia-noite de Brasília, não as últimas 24 h. */
export function desde(dias: number, agora = new Date()): Date {
  if (dias !== 1) return new Date(agora.getTime() - dias * 86_400_000);
  const dia = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(agora);
  return new Date(`${dia}T00:00:00-03:00`);
}

export class ErroDoPainel extends Error {}

function banco() {
  if (!supabaseConfigured()) throw new ErroDoPainel('Supabase não configurado neste ambiente.');
  return supabaseAdmin();
}

/**
 * Lê TODAS as linhas, de página em página.
 *
 * O Supabase corta qualquer consulta no `max_rows` do projeto (1000 por
 * padrão) sem erro nenhum, seja qual for o `.limit()` pedido. Lendo de uma vez,
 * a compra número 1001 sumia e o comprador aparecia como "deixou o e-mail e não
 * comprou", justo a lista que o time usa para ir atrás. Só para quando uma
 * página volta vazia, e não quando volta menor que 1000: se o teto do projeto
 * for menor, parar na página curta seria truncar de novo.
 *
 * Passou do teto, o painel recusa o número em vez de mostrar metade dele.
 */
type Pagina<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>;
async function lerTudo<T>(rotulo: string, pagina: (de: number, ate: number) => Pagina<T>, teto = 200_000): Promise<T[]> {
  const PASSO = 1000;
  const todas: T[] = [];
  for (let de = 0; ; de += PASSO) {
    const { data, error } = await pagina(de, de + PASSO - 1);
    if (error) throw new ErroDoPainel(`${rotulo}: ${error.message}`);
    if (!data || data.length === 0) return todas;
    todas.push(...data);
    if (todas.length > teto) throw new ErroDoPainel(`${rotulo}: mais de ${teto} linhas; esta leitura precisa ser agregada no banco`);
  }
}

/* ------------------------------------------------------------------ funil */

export async function lerFunil(dias: number): Promise<{ degraus: Degraus; telas: LinhaTela[] }> {
  const db = banco();
  const p = { p_desde: desde(dias).toISOString() };
  const [d, t] = await Promise.all([db.rpc('quiz_painel_degraus', p), db.rpc('quiz_painel_telas', p)]);
  if (d.error) throw new ErroDoPainel(`degraus: ${d.error.message}`);
  if (t.error) throw new ErroDoPainel(`telas: ${t.error.message}`);
  // Resposta fora do formato vira erro na tela, nunca "0" nem "NaN" com cara de número.
  const linha = ((d.data ?? []) as Record<string, unknown>[])[0];
  if (!linha) throw new ErroDoPainel('degraus: o banco não devolveu linha');
  const degraus = {} as Degraus;
  for (const k of ['abriram', 'viram_email', 'leads', 'viram_oferta', 'clicaram', 'compraram'] as const) {
    const v = Number(linha[k]);
    if (!Number.isFinite(v)) throw new ErroDoPainel(`degraus: campo ${k} ausente ou inválido`);
    degraus[k] = v;
  }
  const telas = (t.data ?? []) as LinhaTela[];
  if (telas.some((x) => typeof x.tela !== 'string' || !Number.isFinite(Number(x.sessoes)))) {
    throw new ErroDoPainel('telas: resposta fora do formato');
  }
  return { degraus, telas };
}

/* ------------------------------------------------------------------ leads */

type LinhaLead = {
  email: string;
  nome: string | null;
  sessao: string | null;
  aceite_email: boolean;
  aceite_email_confirmado_em: string | null;
  plano_enviado_em: string | null;
  consumido_em: string | null;
  criado_em: string;
  app: Record<string, unknown> | null;
  extras: Record<string, unknown> | null;
  utm: Record<string, string> | null;
};

export type Jornada = { telasVistas: number; ultimaTela: string | null; viuOferta: boolean; clicouComprar: boolean };

export type LeadDoPainel = {
  email: string;
  nome: string;
  criadoEm: string;
  aceiteEmail: boolean;
  confirmouEmail: boolean;
  recebeuPlano: boolean;
  noApp: boolean;
  utm: Record<string, string>;
  respostas: RespostasDoQuiz;
  jornada: Jornada | null;
  comprou: boolean;
  regras: NotaPorRegras;
  semelhanca: number | null;
  /** A nota que decide a faixa: semelhança quando há compradores suficientes, regras antes disso. */
  nota: number;
  faixa: Faixa;
};

export type BaseDeLeads = { leads: LeadDoPainel[]; perfil: PerfilComprador };

async function jornadas(sessoes: string[]): Promise<Map<string, Jornada>> {
  const db = banco();
  type Acumulado = { vistas: Set<string>; maior: number; ultimaTela: string | null; clicou: boolean };
  const acc = new Map<string, Acumulado>();
  // Em lotes: a lista de sessões vai na URL da consulta.
  for (let i = 0; i < sessoes.length; i += 150) {
    const lote = sessoes.slice(i, i + 150);
    const eventos = await lerTudo('jornadas', (de, ate) =>
      db.from('quiz_eventos').select('sessao,evento,indice,tela').in('sessao', lote).order('id').range(de, ate),
    );
    for (const e of eventos as { sessao: string; evento: string; indice: number; tela: string }[]) {
      const a = acc.get(e.sessao) ?? { vistas: new Set<string>(), maior: -1, ultimaTela: null, clicou: false };
      if (e.evento === 'checkout') a.clicou = true;
      if (e.evento === 'view') {
        a.vistas.add(e.tela);
        if (e.indice > a.maior) {
          a.maior = e.indice;
          a.ultimaTela = e.tela;
        }
      }
      acc.set(e.sessao, a);
    }
  }
  return new Map(
    [...acc].map(([sessao, a]) => [
      sessao,
      { telasVistas: a.vistas.size, ultimaTela: a.ultimaTela, viuOferta: a.vistas.has('oferta'), clicouComprar: a.clicou },
    ]),
  );
}

/**
 * Última compra aprovada de cada e-mail (minúsculas → ms). O lead só conta como
 * comprador se comprou DEPOIS de responder: cliente antigo que refaz o quiz não
 * é venda do quiz, e no perfil de semelhança ensinaria o perfil errado.
 */
async function compradores(): Promise<Map<string, number>> {
  const db = banco();
  const compras = await lerTudo('compras', (de, ate) =>
    db.from('compras').select('email,criado_em').eq('status', 'aprovada').order('id').range(de, ate),
  );
  const ultima = new Map<string, number>();
  for (const c of compras as { email: string | null; criado_em: string }[]) {
    const e = (c.email ?? '').trim().toLowerCase();
    const t = new Date(c.criado_em).getTime();
    if (e && t > (ultima.get(e) ?? -Infinity)) ultima.set(e, t);
  }
  return ultima;
}

export async function lerLeads(): Promise<BaseDeLeads> {
  const db = banco();
  const linhas = (await lerTudo('leads', (de, ate) =>
    db
      .from('quiz_respostas')
      .select('email,nome,sessao,aceite_email,aceite_email_confirmado_em,plano_enviado_em,consumido_em,criado_em,app,extras,utm')
      .eq('teste', false)
      .order('criado_em', { ascending: false })
      .order('email')
      .range(de, ate),
  )) as LinhaLead[];

  const [mapaJornadas, quemComprou] = await Promise.all([
    jornadas([...new Set(linhas.map((l) => l.sessao).filter((s): s is string => !!s))]),
    compradores(),
  ]);

  const base = linhas.map((l) => ({ l, respostas: respostasDaLinha(l), comprou: (quemComprou.get(l.email) ?? -Infinity) >= new Date(l.criado_em).getTime() }));
  const perfil = perfilDoComprador(
    base.map((b) => b.respostas),
    base.filter((b) => b.comprou).map((b) => b.respostas),
  );

  const leads = base.map(({ l, respostas, comprou }): LeadDoPainel => {
    const jornada = l.sessao ? (mapaJornadas.get(l.sessao) ?? null) : null;
    const regras = notaPorRegras({
      respostas,
      aceiteEmail: l.aceite_email,
      viuOferta: jornada?.viuOferta ?? false,
      clicouComprar: jornada?.clicouComprar ?? false,
    });
    const semelhanca = notaPorSemelhanca(respostas, perfil);
    const nota = perfil.confianca === 'ok' && semelhanca !== null ? semelhanca : regras.nota;
    return {
      email: l.email,
      nome: l.nome ?? '',
      criadoEm: l.criado_em,
      aceiteEmail: l.aceite_email,
      confirmouEmail: !!l.aceite_email_confirmado_em,
      recebeuPlano: !!l.plano_enviado_em,
      noApp: !!l.consumido_em,
      utm: l.utm ?? {},
      respostas,
      jornada,
      comprou,
      regras,
      semelhanca,
      nota,
      faixa: faixaDe(nota),
    };
  });
  return { leads, perfil };
}

/* ---------------------------------------------------------------- medição */

export type SaudeDaMedicao = {
  ultimoEventoDoQuiz: string | null;
  ultimoLead: string | null;
  eventosDoQuiz24h: number;
  servidor: { evento: string; total: number; falhas: number; ultimo: string | null; doQuiz: number }[];
};

/**
 * "A medição está viva?" em três perguntas: o quiz está gravando tela, está
 * gravando lead, e o servidor está mandando os eventos para a Meta. Lê a
 * última semana de `eventos_capi`, que é onde a rota do servidor registra cada
 * envio e o resultado (`enviado:1` = aceito pela Meta).
 */
export async function lerMedicao(agora = new Date()): Promise<SaudeDaMedicao> {
  const db = banco();
  const semana = new Date(agora.getTime() - 7 * 86_400_000).toISOString();
  const dia = new Date(agora.getTime() - 86_400_000).toISOString();
  const [ev, ev24, lead, envios] = await Promise.all([
    db.from('quiz_eventos').select('criado_em').eq('teste', false).order('criado_em', { ascending: false }).limit(1),
    db.from('quiz_eventos').select('id', { count: 'exact', head: true }).eq('teste', false).gte('criado_em', dia),
    db.from('quiz_respostas').select('criado_em').eq('teste', false).order('criado_em', { ascending: false }).limit(1),
    lerTudo('envios ao servidor', (de, ate) =>
      db.from('eventos_capi').select('evento,resultado,caminho,criado_em').gte('criado_em', semana).order('criado_em', { ascending: false }).order('id').range(de, ate),
    ),
  ]);
  for (const r of [ev, ev24, lead]) if (r.error) throw new ErroDoPainel(`medição: ${r.error.message}`);
  if (ev24.count === null) throw new ErroDoPainel('medição: o banco não devolveu a contagem das últimas 24 h');

  const porEvento = new Map<string, { evento: string; total: number; falhas: number; ultimo: string | null; doQuiz: number }>();
  for (const c of envios as { evento: string; resultado: string | null; caminho: string | null; criado_em: string }[]) {
    const e = porEvento.get(c.evento) ?? { evento: c.evento, total: 0, falhas: 0, ultimo: null, doQuiz: 0 };
    e.total += 1;
    if (!(c.resultado ?? '').startsWith('enviado')) e.falhas += 1;
    if (!e.ultimo) e.ultimo = c.criado_em;
    if ((c.caminho ?? '').includes('quiz')) e.doQuiz += 1;
    porEvento.set(c.evento, e);
  }
  return {
    ultimoEventoDoQuiz: (ev.data?.[0] as { criado_em: string } | undefined)?.criado_em ?? null,
    ultimoLead: (lead.data?.[0] as { criado_em: string } | undefined)?.criado_em ?? null,
    eventosDoQuiz24h: ev24.count,
    servidor: [...porEvento.values()].sort((a, b) => b.total - a.total),
  };
}
