'use client';

import { useEffect, useRef } from 'react';
import { usePreco } from '@/components/ui/Precos';
import { NOME_EVENTO, textosCapa, textosResultado, telasQuiz } from '@/content/quiz';
import { oferta } from '@/content/desafio';
import { rastrear } from '@/lib/pixel';
import { ID_FRONT } from '@/lib/produtos';
import {
  TOTAL_TRAVAS,
  ateOEvento,
  chegadaNaMeta,
  nivelDaCapa,
  primeiroNome,
  projecao,
  todasAsTravas,
  type Trava,
} from '../motor';
import type { Projecao, PropsTela, Respostas } from '../tipos';

/** "85,5" — número com vírgula e no máximo uma casa. */
export const kg = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

/** Faixas de IMC da OMS. */
export function categoriaImc(v: number): string {
  if (v < 18.5) return 'Abaixo do peso';
  if (v < 25) return 'Peso normal';
  if (v < 30) return 'Sobrepeso';
  if (v < 35) return 'Obesidade grau I';
  if (v < 40) return 'Obesidade grau II';
  return 'Obesidade grau III';
}

/** Rótulo da opção escolhida, lido do próprio roteiro (`content/quiz.ts`). */
export function rotuloDe(chave: string, v: unknown): string {
  for (const t of telasQuiz) {
    if ('chave' in t && t.chave === chave && 'opcoes' in t) {
      return t.opcoes.find((o) => o.v === v)?.rotulo ?? '';
    }
  }
  return '';
}

export const AREA: Record<string, string> = {
  barriga: 'Barriga',
  flancos: 'Flancos (o pneuzinho)',
  peito: 'Peito',
  todo: 'Corpo todo',
};

export const IMG_ATUAL: Record<string, number> = { fina: 0, media: 1, grossa: 2, 'muito-grossa': 3 };
export const IMG_OBJETIVO: Record<string, number> = { seco: 0, trincado: 1, atletico: 2 };

/**
 * Liga o plano à data da pessoa: estimativa até lá, no mesmo ritmo
 * conservador do gráfico, sempre dita como estimativa.
 */
export function textoEvento(r: Respostas): string | null {
  const nome = NOME_EVENTO[String(r.evento)];
  if (!nome) return null;
  const ate = ateOEvento(r);
  const data = typeof r.dataEvento === 'string' ? r.dataEvento.split('-').reverse().slice(0, 2).join('/') : '';
  const nomeCap = nome[0].toUpperCase() + nome.slice(1);
  if (!ate) return `${nomeCap} está chegando. Quanto antes você começar, mais semanas de plano você leva até lá.`;
  if (ate.semanas < 1) return `${nomeCap} é em poucos dias. Dá pra chegar mais seco e desinchado, e o resultado maior vem nas semanas seguintes.`;
  const s = ate.semanas === 1 ? '1 semana' : `${ate.semanas} semanas`;
  return `Até ${nome} (${data}) são **${s}**. No ritmo do plano, a estimativa é você chegar lá com **cerca de ${kg(ate.peso)} kg**.`;
}

/** Gráfico de linha da projeção (SVG puro, sem biblioteca). */
function GraficoProjecao({ p }: { p: Projecao }) {
  const W = 340;
  const H = 214;
  const x0 = 26;
  const x1 = 314;
  const yTopo = 38;
  const yBase = 162;

  const mostraMeta = p.peso42 > p.pesoMeta;
  const menor = mostraMeta ? p.pesoMeta : p.peso42;
  const vao = Math.max(p.pesoAtual - menor, 1);
  const teto = p.pesoAtual + vao * 0.08;
  const chao = menor - vao * 0.12;

  const x = (s: number) => x0 + ((x1 - x0) * s) / 6;
  const y = (v: number) => yTopo + ((teto - v) / (teto - chao)) * (yBase - yTopo);

  const pontos = p.semanas.map((s) => [x(s.semana), y(s.peso)] as const);
  const linha = pontos.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ');
  const area = `${linha} L${x1} ${yBase} L${x0} ${yBase} Z`;
  const yFim = pontos[pontos.length - 1][1];

  const resumo =
    `Projeção estimada: de ${kg(p.pesoAtual)} kg hoje para ${kg(p.peso42)} kg na semana 6, ` +
    `cerca de ${kg(p.ritmoKg)} kg por semana.` +
    (mostraMeta ? ` A sua meta é ${kg(p.pesoMeta)} kg.` : '');

  return (
    <svg className="qr-grafico" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={resumo}>
      <defs>
        <linearGradient id="qr-grafico-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff6b00" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ff6b00" stopOpacity="0" />
        </linearGradient>
      </defs>

      {p.semanas.map((s) => (
        <line key={s.semana} x1={x(s.semana)} x2={x(s.semana)} y1={yTopo - 8} y2={yBase} className="qr-grafico__grade" />
      ))}
      <line x1={x0} x2={x1} y1={yBase} y2={yBase} className="qr-grafico__eixo" />

      {mostraMeta && (
        <g className="qr-grafico__meta">
          <line x1={x0} x2={x1} y1={y(p.pesoMeta)} y2={y(p.pesoMeta)} />
          <text x={x0 + 2} y={y(p.pesoMeta) - 7}>
            Meta {kg(p.pesoMeta)} kg
          </text>
        </g>
      )}

      <path d={area} fill="url(#qr-grafico-area)" />
      <path d={linha} className="qr-grafico__linha" pathLength={1} />
      {pontos.map(([px, py], i) => (
        <circle
          key={i}
          cx={px}
          cy={py}
          r={i === 0 || i === 6 ? 5.5 : 3.5}
          className={i === 6 ? 'qr-grafico__fim' : 'qr-grafico__ponto'}
        />
      ))}

      <text x={x0 - 6} y={y(p.pesoAtual) - 14} className="qr-grafico__rotulo">
        {kg(p.pesoAtual)} kg
      </text>
      <text x={x1 + 6} y={yFim - 14} textAnchor="end" className="qr-grafico__rotulo qr-grafico__rotulo--fim">
        {kg(p.peso42)} kg
      </text>

      {p.semanas.map((s) => (
        <text key={s.semana} x={x(s.semana)} y={yBase + 20} textAnchor="middle" className="qr-grafico__x">
          {s.semana}
        </text>
      ))}
      <text x={(x0 + x1) / 2} y={yBase + 42} textAnchor="middle" className="qr-grafico__legenda">
        semanas
      </text>
    </svg>
  );
}

export function Projecao42({ r }: { r: Respostas }) {
  const p = projecao(r);
  if (!p) return null;
  const chegada = chegadaNaMeta(r);
  const perde = p.ritmoKg > 0 && p.peso42 < p.pesoAtual;
  return (
    <div className="qr-painel">
      <h2 className="qr-painel__titulo">{textosResultado.diagnostico.projecaoTitulo}</h2>
      {perde ? (
        <>
          <p className="qr-projecao__numeros">
            <span>{kg(p.pesoAtual)} kg</span>
            <span className="qr-projecao__seta" aria-hidden="true">
              →
            </span>
            <span className="qr-projecao__fim">{kg(p.peso42)} kg</span>
          </p>
          <p className="qr-projecao__sub">
            Cerca de <b>−{kg(Math.round((p.pesoAtual - p.peso42) * 10) / 10)} kg</b> estimados em 6 semanas, no ritmo
            de ~{kg(p.ritmoKg)} kg por semana.
          </p>
          <GraficoProjecao p={p} />
          {chegada && (
            <div className="qr-chegada">
              <p className="qr-chegada__rotulo">Você chega nos {kg(p.pesoMeta)} kg em</p>
              <p className="qr-chegada__valor">{chegada.texto}</p>
              <p className="qr-chegada__quando">
                Por volta de {chegada.quando}, no mesmo ritmo, seguindo o plano depois dos 42 dias.
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="qr-projecao__sub">
          O seu peso desejado não é menor que o atual, então o plano não mira a balança: o foco é{' '}
          <b>tirar a capa de gordura e construir o abdômen</b>.
        </p>
      )}
      <p className="qr-nota">{textosResultado.diagnostico.projecaoNota}</p>
    </div>
  );
}

/**
 * Tela 'diagnostico': UMA trava em foco, como a do Cariani (kicker, título,
 * explicação, sinais com contagem e o que o plano faz), no lugar de vários
 * blocos misturados. Os números (IMC, capa, projeção…) ficam na tela seguinte.
 */
export function TelaDiagnostico({ respostas: r, avancar, recomecar }: PropsTela) {
  const valor = usePreco(ID_FRONT);
  const disparado = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Quem chega ao diagnóstico vai ler a oferta: é o ViewContent do quiz. Uma vez só.
  useEffect(() => {
    if (disparado.current) return;
    disparado.current = true;
    // Recarregar a página no diagnóstico não conta outro ViewContent.
    try {
      if (sessionStorage.getItem('ai_quiz_vc')) return;
      sessionStorage.setItem('ai_quiz_vc', '1');
    } catch {}
    rastrear(
      'ViewContent',
      {
        content_ids: [ID_FRONT],
        content_name: 'Desafio Abdômen Insano',
        content_type: 'product',
        value: valor,
        currency: oferta.precoMoeda,
      },
      ID_FRONT,
    );
  }, [valor]);

  const nome = primeiroNome(r);
  const lista = todasAsTravas(r);
  const capa = textosCapa.niveis[nivelDaCapa(r)];
  // Sem nenhuma trava de hábito, a trava é a própria capa de gordura.
  const principal: Trava = lista[0] ?? {
    titulo: `Capa de gordura ${capa.rotulo.toLowerCase()}`,
    texto: capa.texto.replace(/\*\*/g, ''),
    plano: 'O desafio ataca as 2 frentes juntas: alimentação calculada pra tirar a capa e treino de abdômen com sobrecarga progressiva.',
  };
  const planos = [...new Set((lista.length ? lista : [principal]).slice(0, 3).map((t) => t.plano))];

  return (
    <div className="v2 qr">
      <section className="v2-sec v2-sec--claro qr-sec">
        <div className="qr-col">
          <p className="qr-olho">Diagnóstico concluído</p>
          <h1 className="v2-h2 qr-titulo">
            {nome ? `${nome}, encontramos` : 'Encontramos'} a sua principal trava:
          </h1>
          <p className="qr-principal">{principal.titulo}</p>
          <p className="qr-capa">{principal.texto}</p>

          <div className="qr-sinais">
            {lista.length > 0 && (
              <>
                <div className="qr-sinais__topo">
                  <span>Pontos que atrapalham o seu resultado</span>
                  <b>
                    {lista.length} de {TOTAL_TRAVAS}
                  </b>
                </div>
                <div
                  className="qr-sinais__barra"
                  role="img"
                  aria-label={`${lista.length} de ${TOTAL_TRAVAS} pontos encontrados`}
                >
                  <span style={{ width: `${(lista.length / TOTAL_TRAVAS) * 100}%` }} />
                </div>
                <ul className="qr-sinais__lista">
                  {lista.slice(0, 4).map((t) => (
                    <li key={t.titulo}>
                      <span className="qr-sinais__alerta" aria-hidden="true">
                        !
                      </span>
                      <span>
                        <b>{t.titulo}.</b> {t.texto}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="qr-sinais__solucao">
              <p className="qr-sinais__solucao-titulo">O que o plano faz sobre isso</p>
              <ul>
                {planos.map((pl) => (
                  <li key={pl}>
                    <span className="qr-sinais__check" aria-hidden="true">
                      ✓
                    </span>
                    <span>{pl}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button type="button" className="qr-botao" onClick={avancar}>
            Ver os meus resultados
          </button>
          {recomecar && (
            <button type="button" className="qr-refazer" onClick={recomecar}>
              Refazer o quiz
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
