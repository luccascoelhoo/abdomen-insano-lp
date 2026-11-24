'use client';

import { useState } from 'react';
import { TEMA, TEXTO } from '@/lib/painel/tema';

/** Copia o e-mail sem abrir a gaveta da linha (o clique não chega no `summary`). */
export function CopiarEmail({ email }: { email: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(email);
          setOk(true);
          setTimeout(() => setOk(false), 1400);
        } catch {
          setOk(false);
        }
      }}
      className="shrink-0 rounded-[6px] px-1.5 py-0.5 text-[11px] hover:bg-[#2a2a2a]"
      style={{ color: ok ? TEMA.positivo : TEXTO.t3 }}
      aria-label={`Copiar ${email}`}
      title="Copiar e-mail"
    >
      {ok ? 'copiado' : 'copiar'}
    </button>
  );
}
