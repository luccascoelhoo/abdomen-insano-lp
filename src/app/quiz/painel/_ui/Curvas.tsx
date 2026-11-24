import { SUPERFICIE, TEMA, TEXTO } from '@/lib/painel/tema';
import type { TelaDoFunil } from '@/lib/painel/funil';

/**
 * As duas curvas do painel em SVG puro: leads por dia e retenção por tela.
 * Sem biblioteca de gráfico: o painel é lido no servidor e chega desenhado.
 */

const W = 720;
const H = 180;
const M = { t: 12, r: 12, b: 26, l: 34 };

function escala(max: number) {
  const topo = Math.max(1, Math.ceil(max * 1.15));
  return { topo, y: (v: number) => M.t + (H - M.t - M.b) * (1 - v / topo) };
}

export function CurvaPorDia({ dias }: { dias: { dia: string; n: number }[] }) {
  const { topo, y } = escala(Math.max(...dias.map((d) => d.n), 0));
  const passo = (W - M.l - M.r) / Math.max(1, dias.length - 1);
  const x = (i: number) => M.l + i * passo;
  const linha = dias.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.n).toFixed(1)}`).join(' ');
  const area = `${linha} L${x(dias.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const rotulos = dias.filter((_, i) => i % Math.ceil(dias.length / 7) === 0 || i === dias.length - 1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Leads por dia">
      <line x1={M.l} x2={W - M.r} y1={y(0)} y2={y(0)} stroke={SUPERFICIE.linha} />
      <line x1={M.l} x2={W - M.r} y1={y(topo)} y2={y(topo)} stroke={SUPERFICIE.linhaFina} strokeDasharray="3 4" />
      <text x={M.l - 6} y={y(topo) + 4} textAnchor="end" fontSize="11" fill={TEXTO.t3}>{topo}</text>
      <text x={M.l - 6} y={y(0) + 4} textAnchor="end" fontSize="11" fill={TEXTO.t3}>0</text>
      <path d={area} fill={TEMA.marcaFraco} />
      <path d={linha} fill="none" stroke={TEMA.marca} strokeWidth="2" strokeLinejoin="round" />
      {dias.map((d, i) => (
        <circle key={d.dia} cx={x(i)} cy={y(d.n)} r={d.n ? 2.5 : 0} fill={TEMA.marcaClaro}>
          <title>{`${d.dia.split('-').reverse().slice(0, 2).join('/')}: ${d.n} lead${d.n === 1 ? '' : 's'}`}</title>
        </circle>
      ))}
      {rotulos.map((d) => (
        <text key={d.dia} x={x(dias.indexOf(d))} y={H - 6} textAnchor="middle" fontSize="11" fill={TEXTO.t3}>
          {d.dia.split('-').reverse().slice(0, 2).join('/')}
        </text>
      ))}
    </svg>
  );
}

/** Retenção tela a tela, em % do pico. A maior queda ganha a cor de atenção. */
export function CurvaRetencao({ curva, base, queda }: { curva: TelaDoFunil[]; base: number; queda: TelaDoFunil | null }) {
  if (curva.length < 2 || base === 0) return null;
  const y = (v: number) => M.t + (H - M.t - M.b) * (1 - v / 100);
  const passo = (W - M.l - M.r) / (curva.length - 1);
  const x = (i: number) => M.l + i * passo;
  const p = (t: TelaDoFunil) => (100 * t.chegaram) / base;
  const linha = curva.map((t, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p(t)).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Retenção por tela">
      {[0, 50, 100].map((v) => (
        <g key={v}>
          <line x1={M.l} x2={W - M.r} y1={y(v)} y2={y(v)} stroke={v ? SUPERFICIE.linhaFina : SUPERFICIE.linha} strokeDasharray={v ? '3 4' : undefined} />
          <text x={M.l - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill={TEXTO.t3}>{v}%</text>
        </g>
      ))}
      <path d={`${linha} L${x(curva.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={TEMA.marcaFraco} />
      <path d={linha} fill="none" stroke={TEMA.marca} strokeWidth="2" strokeLinejoin="round" />
      {curva.map((t, i) => {
        const ehQueda = queda?.id === t.id;
        return (
          <circle key={t.id} cx={x(i)} cy={y(p(t))} r={ehQueda ? 5 : 2.5} fill={ehQueda ? TEMA.atencao : TEMA.marcaClaro}>
            <title>{`${i + 1}. ${t.rotulo}: ${t.chegaram} (${p(t).toFixed(0)}% do pico)${t.daAnterior !== null ? ` · ${t.daAnterior}% da anterior` : ''}`}</title>
          </circle>
        );
      })}
      <text x={M.l} y={H - 6} fontSize="11" fill={TEXTO.t3}>início</text>
      <text x={W - M.r} y={H - 6} textAnchor="end" fontSize="11" fill={TEXTO.t3}>oferta</text>
    </svg>
  );
}
