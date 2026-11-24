'use client';

import { useState } from 'react';
import { SUPERFICIE, TEMA, TEXTO } from '@/lib/painel/tema';

/**
 * Link do quiz para anúncio ou orgânico, com as UTMs no padrão da conta. No
 * anúncio, o mais seguro é deixar a Meta preencher pelos parâmetros dinâmicos
 * (`url_tags`); para orgânico, o link sai pronto.
 */
const BASE = 'https://quiz.abdomeninsano.com.br/';
export const URL_TAGS_META =
  'utm_source=FB&utm_campaign={{campaign.name}}|{{campaign.id}}&utm_medium={{adset.name}}|{{adset.id}}&utm_content={{ad.name}}|{{ad.id}}&utm_term={{placement}}';

export function GeradorDeLink() {
  const [fonte, setFonte] = useState('instagram');
  const [campanha, setCampanha] = useState('bio');
  const [conteudo, setConteudo] = useState('');
  const [copiado, setCopiado] = useState('');
  // Minúsculas e sem espaço: "Instagram Bio" e "instagram-bio" virariam duas origens no painel.
  const limpo = (v: string) => v.trim().toLowerCase().replace(/\s+/g, '-');
  const faltando = !limpo(fonte) || !limpo(campanha);
  const p = new URLSearchParams({ utm_source: limpo(fonte), utm_medium: 'organico', utm_campaign: limpo(campanha) });
  if (limpo(conteudo)) p.set('utm_content', limpo(conteudo));
  const link = `${BASE}?${p.toString()}`;
  const copiar = async (texto: string, qual: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(qual);
      setTimeout(() => setCopiado(''), 1500);
    } catch {
      setCopiado('');
    }
  };
  const campo = (rotulo: string, v: string, set: (s: string) => void) => (
    <label className="grid gap-1 text-[12px]" style={{ color: TEXTO.t3 }}>
      {rotulo}
      <input value={v} onChange={(e) => set(e.target.value)} className="h-[34px] rounded-[8px] border px-2 text-[13px]" style={{ background: SUPERFICIE.s2, borderColor: SUPERFICIE.linha, color: TEXTO.t1 }} />
    </label>
  );
  const botao = (texto: string, qual: string) => (
    <button type="button" onClick={() => copiar(texto, qual)} className="rounded-[8px] px-3 py-1.5 text-[12px] font-semibold" style={{ background: TEMA.marca, color: '#000' }}>
      {copiado === qual ? 'Copiado' : 'Copiar'}
    </button>
  );
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div>
        <h3 className="text-[13px] font-semibold" style={{ color: TEXTO.t2 }}>Anúncio na Meta</h3>
        <p className="mt-1 text-[12px]" style={{ color: TEXTO.t3 }}>URL do site: <code style={{ color: TEXTO.t1 }}>{BASE}</code> e, em Parâmetros de URL, cole:</p>
        <code className="mt-2 block break-all rounded-[8px] border p-2 text-[12px]" style={{ background: SUPERFICIE.s2, borderColor: SUPERFICIE.linha, color: TEXTO.t1 }}>{URL_TAGS_META}</code>
        <div className="mt-2">{botao(URL_TAGS_META, 'meta')}</div>
      </div>
      <div>
        <h3 className="text-[13px] font-semibold" style={{ color: TEXTO.t2 }}>Link orgânico</h3>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {campo('Fonte', fonte, setFonte)}
          {campo('Campanha', campanha, setCampanha)}
          {campo('Conteúdo (opcional)', conteudo, setConteudo)}
        </div>
        <code className="mt-2 block break-all rounded-[8px] border p-2 text-[12px]" style={{ background: SUPERFICIE.s2, borderColor: SUPERFICIE.linha, color: TEXTO.t1 }}>{link}</code>
        {faltando ? (
          <p className="mt-2 text-[12px]" style={{ color: TEMA.atencao }}>Preencha a fonte e a campanha: sem elas, o lead chega como &ldquo;sem origem&rdquo;.</p>
        ) : null}
        <div className="mt-2 flex items-center gap-2">
          {botao(link, 'org')}
          <a
            href={`${link}&teste=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[8px] border px-3 py-1.5 text-[12px]"
            style={{ borderColor: SUPERFICIE.linha, color: TEXTO.t2 }}
            title="Abre com ?teste=1: a sua passagem não entra nos números"
          >
            Abrir para testar
          </a>
        </div>
      </div>
    </div>
  );
}
