'use client';

import { useEffect, type ReactNode } from 'react';
import { textosResultado } from '@/content/quiz';
import { primeiroNome } from '../motor';
import type { PropsTela } from '../tipos';

/**
 * Tela 'oferta': cabeçalho com o nome, o lembrete do e-mail (é por ele que o
 * plano chega ao app) e os blocos de venda da home, renderizados no servidor
 * (`BlocoOfertaQuiz`) e recebidos prontos em `oferta`.
 */
export function TelaOferta({ respostas: r, oferta }: PropsTela & { oferta: ReactNode }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const t = textosResultado.oferta;
  const nome = primeiroNome(r);
  const titulo = nome ? `${nome}, ${t.titulo[0].toLowerCase()}${t.titulo.slice(1)}` : t.titulo;
  const email = typeof r.email === 'string' ? r.email.trim() : '';

  return (
    <div className="qr-oferta">
      <div className="v2 qr">
        <section className="v2-sec v2-sec--preto qr-sec qr-oferta__topo">
          <div className="qr-col">
            <p className="qr-olho qr-olho--escuro">O seu Plano Capa Zero está pronto</p>
            <h1 className="v2-h2 qr-titulo">{titulo}</h1>
            {email && (
              <div className="qr-email" role="note">
                <p className="qr-email__linha">
                  {t.lembreteEmail} <b className="qr-email__endereco">{email}</b>
                </p>
                <p className="qr-email__porque">
                  É com esse e-mail que você entra no app, e o seu plano já chega montado lá dentro.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
      {oferta}
    </div>
  );
}
