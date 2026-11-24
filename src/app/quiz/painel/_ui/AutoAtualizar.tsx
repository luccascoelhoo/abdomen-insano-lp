'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { TEMA, TEXTO } from '@/lib/painel/tema';
import { tempoRelativo } from '@/lib/painel/tempo';

const INTERVALO_MS = 60_000;

/**
 * Releitura sozinha a cada minuto, só com a aba visível (aba escondida não
 * gasta leitura do banco). Ao voltar para a aba, relê na hora.
 */
export function AutoAtualizar() {
  const router = useRouter();
  useEffect(() => {
    let id: number | undefined;
    const ligar = () => {
      window.clearInterval(id);
      if (document.visibilityState === 'visible') id = window.setInterval(() => router.refresh(), INTERVALO_MS);
    };
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') router.refresh();
      ligar();
    };
    ligar();
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [router]);
  return null;
}

/**
 * De quando é o número na tela. Número sem hora é afirmação sem data: duas
 * pessoas olhando a mesma aba, uma aberta agora e outra desde a tarde,
 * discutiriam números diferentes achando que são o mesmo. Clicar relê na hora.
 */
export function SeloAtualizacao({ lidoEm }: { lidoEm: string }) {
  const router = useRouter();
  const [agora, setAgora] = useState(() => Date.now());
  const [relendo, iniciar] = useTransition();
  useEffect(() => {
    const id = window.setInterval(() => setAgora(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, []);
  const de = new Date(lidoEm);
  const hora = de.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
  return (
    <button
      type="button"
      onClick={() => iniciar(() => router.refresh())}
      title={`Lido às ${hora} (Brasília). Clique para atualizar agora.`}
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] hover:bg-[#1e1e1e]"
      style={{ color: TEXTO.t3 }}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full${relendo ? ' animate-pulse' : ''}`}
        style={{ background: relendo ? TEMA.atencao : TEMA.positivo }}
        aria-hidden="true"
      />
      {relendo ? 'atualizando…' : `atualizado ${tempoRelativo(de, new Date(Math.max(agora, de.getTime())))}`}
    </button>
  );
}
