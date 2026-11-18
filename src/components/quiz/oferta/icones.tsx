/** Ícones do bloco de oferta: SVG inline, herdam a cor (`currentColor`). */

const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, 'aria-hidden': true } as const;

export function IconeCadeado({ className }: { className?: string }) {
  return (
    <svg className={className} {...base}>
      <rect x="5" y="11" width="14" height="9.5" rx="2.2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}

export function IconeEscudo({ className }: { className?: string }) {
  return (
    <svg className={className} {...base}>
      <path d="M12 3l7.5 2.8v5.6c0 4.6-3.1 8.2-7.5 9.6-4.4-1.4-7.5-5-7.5-9.6V5.8L12 3z" strokeLinejoin="round" />
      <path d="M8.6 12.2l2.5 2.5 4.4-4.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconeEnvelope({ className }: { className?: string }) {
  return (
    <svg className={className} {...base}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.4" />
      <path d="M3.8 7.5l8.2 6 8.2-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconeCheckRedondo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="M5.5 12.5l4.2 4.2L18.5 8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
