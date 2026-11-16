import type { ComponentType } from 'react';
import type { Tela } from '../tipos';
import { TelaAbertura } from './TelaAbertura';
import { TelaCards } from './TelaCards';
import { TelaLista } from './TelaLista';
import { TelaMulti } from './TelaMulti';
import { TelaNumero } from './TelaNumero';
import { TelaNascimento } from './TelaNascimento';
import { TelaInfo } from './TelaInfo';
import { TelaCapa } from './TelaCapa';
import { TelaCarregando } from './TelaCarregando';
import { TelaEmail } from './TelaEmail';
import { TelaDiagnostico } from './TelaDiagnostico';
import { TelaPlano } from './TelaPlano';
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
  info: TelaInfo,
  capa: TelaCapa,
  carregando: TelaCarregando,
  email: TelaEmail,
  diagnostico: TelaDiagnostico,
  plano: TelaPlano,
  oferta: TelaOferta,
};
