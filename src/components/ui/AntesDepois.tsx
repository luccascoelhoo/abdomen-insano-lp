import Image from 'next/image';
import type { ReactNode } from 'react';
import './AntesDepois.css';

type Props = {
  /** Montagem com o ANTES na metade esquerda e o DEPOIS na direita. */
  src: string;
  alt: string;
  /** Largura / altura da montagem inteira (padrão '1 / 1', como as dos alunos). */
  proporcao?: string;
  rotuloAntes?: string;
  rotuloDepois?: string;
  /** Linha sob o cartão (ex.: "Aluno do Desafio Abdômen Insano"). */
  legenda?: ReactNode;
  /** Desenha a divisória e a seta no meio (montagem sem a divisória gravada). */
  divisoria?: boolean;
  /** Só para o primeiro cartão visível sem rolar. */
  prioridade?: boolean;
  sizes?: string;
};

/**
 * Antes e depois FIXO, pensado para o celular: a foto inteira, sem arraste (o
 * toque não disputa com a rolagem), com "ANTES" e "DEPOIS" nos cantos de baixo,
 * longe dos rostos. Sem JavaScript no navegador. Neutro de cor: serve em fundo
 * claro e escuro.
 */
export function AntesDepois({
  src,
  alt,
  proporcao = '1 / 1',
  rotuloAntes = 'ANTES',
  rotuloDepois = 'DEPOIS',
  legenda,
  divisoria = false,
  prioridade = false,
  sizes = '(max-width: 560px) 100vw, 520px',
}: Props) {
  return (
    <figure className="antes-depois">
      <div className="antes-depois__caixa" style={{ aspectRatio: proporcao }}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={prioridade} />
        {divisoria && (
          <>
            <span className="antes-depois__linha" aria-hidden="true" />
            <span className="antes-depois__seta" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" focusable="false">
                <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </>
        )}
        <span className="antes-depois__rotulo antes-depois__rotulo--antes">{rotuloAntes}</span>
        <span className="antes-depois__rotulo antes-depois__rotulo--depois">{rotuloDepois}</span>
      </div>
      {legenda && <figcaption className="antes-depois__legenda">{legenda}</figcaption>}
    </figure>
  );
}
