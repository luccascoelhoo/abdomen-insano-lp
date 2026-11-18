import { bonusV2 } from '@/content/lp-v2';
import type { Respostas } from '../tipos';

/**
 * O que a pessoa recebe, em linhas. Só entra o que a página de vendas já
 * promete (`ofertaV2.card`, `bonusV2`); as respostas só ajustam a redação.
 */
export interface ItemPlano {
  titulo: string;
  detalhe?: string;
}

const LOCAL: Record<string, string> = {
  home: 'em casa',
  full_gym: 'na academia',
  basic_gym: 'na academia (básica)',
};

const FREQUENCIA: Record<string, string> = {
  '0-2': 'até 2 dias por semana',
  '3-5': '3 a 5 dias por semana',
  '6+': '6 dias ou mais por semana',
};

const TEMPO: Record<string, string> = {
  '30_45': '30 a 45 minutos',
  '60': 'cerca de 1 hora',
  '90_plus': '1h30 ou mais',
};

const lista = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

/** As três entregas do plano: alimentação, treino e app. */
export function itensDoPlano(r: Respostas): ItemPlano[] {
  const refeicoes = typeof r.refeicoes === 'string' && /^[3-6]$/.test(r.refeicoes) ? r.refeicoes : '';
  const local = LOCAL[String(r.local)];
  const freq = FREQUENCIA[String(r.frequencia)];
  const tempo = TEMPO[String(r.tempoTreino)];

  return [
    {
      titulo: refeicoes
        ? `Plano alimentar de ${refeicoes} refeições por dia, calculado pro seu peso e a sua rotina`
        : 'Plano alimentar individualizado, calculado pro seu peso e a sua rotina',
      detalhe: 'Leva em conta o que você gosta de comer',
    },
    {
      titulo: local ? `Treino de abdômen pra fazer ${local}` : 'Treino de abdômen com sobrecarga progressiva',
      detalhe: freq
        ? `Encaixado em ${freq}${tempo ? `, com treinos de ${tempo}` : ''}`
        : tempo
          ? `Treinos de ${tempo}`
          : 'Carga, séries e intensidade sobem semana a semana',
    },
    {
      titulo: 'App com o registro de cada série e a sua evolução semana a semana',
      detalhe: 'Acesso ao aplicativo (iOS ou Android) e ao Curso Abdômen Insano',
    },
  ];
}

/** Detalhe do Guia Fim de Semana Sem Culpa, conforme o que a pessoa disse sobre bebida e delivery. */
function detalheDoGuia(r: Respostas): string {
  if (r.alcool === 'fds' || r.alcool === 'semana') return 'Pra sair com os amigos e tomar a sua cerveja sem jogar a semana fora';
  if (lista(r.habitos).includes('delivery')) return 'Pra encaixar churrasco, rodízio e delivery sem jogar a semana fora';
  return 'Pra encaixar churrasco e rodízio sem jogar a semana fora';
}

/** Os bônus da página de vendas, com os títulos exatos de `bonusV2` (o Guia vem primeiro, por ser o mais pessoal). */
export function bonusDoPlano(r: Respostas): ItemPlano[] {
  const titulos = bonusV2.itens.map((b) => b.titulo);
  const guia = titulos.find((t) => t.startsWith('Guia'));
  const ordem = guia ? [guia, ...titulos.filter((t) => t !== guia)] : titulos;
  return ordem.map((titulo) => (titulo === guia ? { titulo, detalhe: detalheDoGuia(r) } : { titulo }));
}
