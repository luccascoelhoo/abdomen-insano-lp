import { SUPERFICIE } from '@/lib/painel/tema';

/** Enquanto a primeira leitura corre: a forma da tela, nunca zeros com cara de número. */
export default function Carregando() {
  return (
    <div className="space-y-4 sm:space-y-6" aria-busy="true">
      <div className="h-[52px] w-[260px] animate-pulse rounded-[10px]" style={{ background: SUPERFICIE.s1 }} />
      {[220, 300, 260].map((h, i) => (
        <div key={i} className="animate-pulse rounded-[14px] border" style={{ height: h, background: SUPERFICIE.s1, borderColor: SUPERFICIE.linha }} />
      ))}
      <p className="sr-only">Carregando os números do painel</p>
    </div>
  );
}
