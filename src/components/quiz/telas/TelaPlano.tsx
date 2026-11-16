'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { Rico } from '@/components/v2/Rico';
import { textosResultado } from '@/content/quiz';
import { solucaoV2 } from '@/content/lp-v2';
import type { PropsTela, Respostas } from '../tipos';

const LOCAL: Record<string, string> = {
  full_gym: 'Treino montado pra **academia completa**',
  basic_gym: 'Treino adaptado à **academia básica** (prédio, condomínio)',
  home: 'Treino adaptado pra fazer **em casa**',
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

const lista = (v: unknown): string[] => (Array.isArray(v) ? v : []);

/** Corte: refeições, bebida e hábitos. No máximo 2 linhas. */
function linhasCorte(r: Respostas): string[] {
  const linhas: string[] = [];
  const refeicoes = typeof r.refeicoes === 'string' ? r.refeicoes : '';
  linhas.push(
    refeicoes
      ? `Plano alimentar em **${refeicoes} refeições por dia**, calculado pro seu peso e a sua rotina`
      : 'Calculado a partir do seu peso, da sua rotina e **do que você gosta de comer**',
  );
  if (r.alcool === 'fds') linhas.push('**Cabe a cerveja do fim de semana**, com o Guia Fim de Semana Sem Culpa');
  else if (lista(r.habitos).includes('belisca')) linhas.push('**Estratégia pro beliscar da noite**');
  else if (r.alcool === 'semana') linhas.push('**Guia Fim de Semana Sem Culpa** pra beber com os amigos sem jogar a semana fora');
  return linhas;
}

/** Escultura: local, frequência e tempo de treino. */
function linhasEscultura(r: Respostas): string[] {
  const linhas: string[] = [];
  const local = LOCAL[String(r.local)];
  if (local) linhas.push(local);
  const freq = FREQUENCIA[String(r.frequencia)];
  const tempo = TEMPO[String(r.tempoTreino)];
  if (freq && tempo) linhas.push(`Encaixado em **${freq}**, com treinos de **${tempo}**`);
  else if (freq) linhas.push(`Encaixado em **${freq}**`);
  else if (tempo) linhas.push(`Treinos de **${tempo}**`);
  if (!linhas.length) linhas.push('Carga, séries e intensidade **sobem semana a semana**');
  return linhas;
}

const linhasDados = (): string[] => ['Você registra cada série no app e **vê a evolução semana a semana**'];

/** Tela 'plano': as 3 engrenagens do Método Capa Zero, ajustadas às respostas. */
export function TelaPlano({ respostas: r, avancar }: PropsTela) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const porEngrenagem: Record<string, string[]> = {
    Corte: linhasCorte(r),
    Escultura: linhasEscultura(r),
    Dados: linhasDados(),
  };

  return (
    <div className="v2 qr">
      <section className="v2-sec v2-sec--claro qr-sec">
        <div className="qr-col">
          <p className="qr-olho">Método Capa Zero · 42 dias</p>
          <h1 className="v2-h2 qr-titulo">{textosResultado.plano.titulo}</h1>
          <p className="v2-sub qr-sub">{textosResultado.plano.sub}</p>

          <ol className="v2-engrenagens qr-engrenagens">
            {solucaoV2.engrenagens.map((e) => (
              <li key={e.titulo} className="v2-engrenagem">
                <div className="v2-engrenagem__img">
                  <Image src={e.imagem.src} alt={e.imagem.alt} width={e.imagem.width} height={e.imagem.height} sizes="120px" />
                </div>
                <div>
                  <p className="v2-engrenagem__rotulo">{e.rotulo}</p>
                  <h2 className="v2-h3">{e.titulo}</h2>
                  <p>
                    <Rico texto={e.texto} />
                  </p>
                  <ul className="qr-pra-voce" aria-label={`${e.titulo}: ajustes pra você`}>
                    {(porEngrenagem[e.titulo] ?? []).map((l) => (
                      <li key={l}>
                        <Rico texto={l} />
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>

          <button type="button" className="qr-botao" onClick={avancar}>
            Quero começar
          </button>
        </div>
      </section>
    </div>
  );
}
