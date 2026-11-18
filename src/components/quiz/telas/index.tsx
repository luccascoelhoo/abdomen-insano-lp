import type { ComponentType } from 'react';
import type { Tela } from '../tipos';
import { TelaAbertura } from './TelaAbertura';
import { TelaCards } from './TelaCards';
import { TelaLista } from './TelaLista';
import { TelaMulti } from './TelaMulti';
import { TelaNumero } from './TelaNumero';
import { TelaNascimento } from './TelaNascimento';
import { TelaDataEvento } from './TelaDataEvento';
import { TelaInfo } from './TelaInfo';
import { TelaCapa } from './TelaCapa';
import { TelaCarregando } from './TelaCarregando';
import { TelaNome } from './TelaNome';
import { TelaEmail } from './TelaEmail';
import { TelaDiagnostico } from './TelaDiagnostico';
import { TelaProjecao } from './TelaProjecao';
import { TelaPlano } from './TelaPlano';
import { TelaDesconto } from './TelaDesconto';
import { TelaOferta } from './TelaOferta';

/** Registro: um componente por `k` de tela. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TELAS: Record<Tela['k'], ComponentType<any>> = {
  abertura: TelaAbertura,
  cards: TelaCards,
  lista: TelaLista,
  multi: TelaMulti,
  numero: TelaNumero,
  nascimento: TelaNascimento,
  dataEvento: TelaDataEvento,
  info: TelaInfo,
  capa: TelaCapa,
  carregando: TelaCarregando,
  nome: TelaNome,
  email: TelaEmail,
  diagnostico: TelaDiagnostico,
  projecao: TelaProjecao,
  plano: TelaPlano,
  desconto: TelaDesconto,
  oferta: TelaOferta,
};
