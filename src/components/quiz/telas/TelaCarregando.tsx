'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { depoimentosV2 } from '@/content/lp-v2';
import type { PropsTela, TelaCarregando as TelaCarregandoT } from '../tipos';
import { IconeCheck } from './comum';

/**
 * Tempo de cada etapa do checklist (e o encurtado para quem pede menos
 * movimento). Eram 900 ms (~5 s no total): no teste do time de 19/11 a espera
 * pareceu longa demais pra quem já queria ver o plano. Agora são ~2,7 s.
 */
const ETAPA_MS = 450;
const ETAPA_MS_REDUZIDO = 250;
/** Pausa no 100% antes de seguir, para a pessoa ver que terminou. */
const PAUSA_FINAL_MS = 400;

const RAIO = 52;
const VOLTA = 2 * Math.PI * RAIO;

/**
 * "Montando o seu plano": checklist que vai marcando, anel até 100% e, embaixo,
 * uma faixa passando com antes/depois REAIS de alunos. No fim avança sozinha.
 */
export function TelaCarregando({ tela, avancar }: PropsTela<TelaCarregandoT>) {
  const total = tela.etapas.length;
  const [estado, setEstado] = useState({ feitas: 0, pct: 0 });

  useEffect(() => {
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const etapa = reduzido ? ETAPA_MS_REDUZIDO : ETAPA_MS;
    const duracao = etapa * total;
    const inicio = Date.now();
    const id = window.setInterval(() => {
      const t = Date.now() - inicio;
      setEstado({
        feitas: Math.min(total, Math.floor(t / etapa)),
        pct: Math.min(100, Math.round((t / duracao) * 100)),
      });
      if (t >= duracao + PAUSA_FINAL_MS) {
        window.clearInterval(id);
        avancar();
      }
    }, 80);
    return () => window.clearInterval(id);
  }, [avancar, total]);

  const casos = depoimentosV2.casos;
  return (
    <section className="q-carregando">
      <h1 className="q-titulo q-titulo--centro">{tela.titulo}</h1>

      <div
        className="q-anel"
        role="progressbar"
        aria-label="Progresso da montagem do plano"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={estado.pct}
      >
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle className="q-anel__fundo" cx="60" cy="60" r={RAIO} />
          <circle
            className="q-anel__frente"
            cx="60"
            cy="60"
            r={RAIO}
            strokeDasharray={VOLTA}
            strokeDashoffset={VOLTA * (1 - estado.pct / 100)}
          />
        </svg>
        <span className="q-anel__pct">{estado.pct}%</span>
      </div>

      <ul className="q-etapas">
        {tela.etapas.map((e, i) => {
          const cls = i < estado.feitas ? 'is-feita' : i === estado.feitas ? 'is-agora' : '';
          return (
            <li key={e} className={`q-etapa ${cls}`}>
              <span className="q-etapa__icone" aria-hidden="true">
                {i < estado.feitas && <IconeCheck />}
              </span>
              <span>{e}</span>
              {i < estado.feitas && <span className="q-sr"> (concluído)</span>}
            </li>
          );
        })}
      </ul>

      <div className="q-casos">
        <p className="q-casos__titulo">Alunos do desafio</p>
        <div className="q-casos__janela">
          <ul className="q-casos__faixa">
            {[...casos, ...casos].map((c, i) => {
              const copia = i >= casos.length;
              return (
                <li key={i} className="q-casos__item" aria-hidden={copia || undefined}>
                  <Image src={c.src} alt={copia ? '' : c.alt} width={1000} height={1000} sizes="128px" />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
