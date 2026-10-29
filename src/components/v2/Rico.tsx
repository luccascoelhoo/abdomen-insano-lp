import { Fragment } from 'react';

/**
 * Texto com a marcação leve da copy da v2 (`content/lp-v2.ts`):
 *   **negrito**  [[destaque]]  ((destaque sublinhado à mão))  ~~riscado~~
 * Sem aninhamento — a copy não precisa e o leitor fica previsível.
 */
const PADRAO = /(\*\*[^*]+\*\*|\[\[[^\]]+\]\]|\(\([^)]+\)\)|~~[^~]+~~)/g;

export function Rico({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(PADRAO).map((parte, i) => {
        if (parte.startsWith('**')) return <b key={i}>{parte.slice(2, -2)}</b>;
        if (parte.startsWith('[[')) return <span key={i} className="v2-acento">{parte.slice(2, -2)}</span>;
        if (parte.startsWith('((')) return <Rabisco key={i}>{parte.slice(2, -2)}</Rabisco>;
        if (parte.startsWith('~~')) return <s key={i}>{parte.slice(2, -2)}</s>;
        return <Fragment key={i}>{parte}</Fragment>;
      })}
    </>
  );
}

/** Destaque com o traço desenhado à mão por baixo, como na página de referência. */
export function Rabisco({ children }: { children: React.ReactNode }) {
  return (
    <span className="v2-rabisco">
      {children}
      <svg className="v2-rabisco__traco" viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true">
        <path d="M3 14 C 45 5, 95 3, 140 7 S 186 15, 197 6" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </span>
  );
}
