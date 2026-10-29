/** Ícones da v2 — SVG inline, herdam a cor do texto (`currentColor`). */

export function IconeCheck({ className = 'v2-icone v2-icone--ok' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="M4.5 12.5l5 5L19.5 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconeX({ className = 'v2-icone v2-icone--nao' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

export function IconeProibido({ className = 'v2-icone v2-icone--nao' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M5.6 5.6l12.8 12.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconeChevrons({ className = 'v2-icone' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
      <path d="M6 6l6 6 6-6M6 12l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconeSeta({ direcao, className = 'v2-icone' }: { direcao: 'esq' | 'dir'; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
      <path d={direcao === 'esq' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
