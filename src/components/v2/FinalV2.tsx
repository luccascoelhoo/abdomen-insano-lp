import Image from 'next/image';
import { FaqItem } from '@/components/ui/FaqItem';
import { rodape, suporte } from '@/content/desafio';
import { faqV2, rodapeV2 } from '@/content/lp-v2';
import { faqV3 } from '@/content/lp-v3';

/** [12] Perguntas frequentes — sanfona escura. Reaproveita o `FaqItem` da página atual. */
export function FaqV2() {
  return (
    <section className="v2-sec v2-sec--fim">
      <div className="v2-col">
        <h2 className="v2-h2 v2-centro">{faqV2.titulo}</h2>
        <div className="v2-faq">
          {faqV3.itens.map((f, i) => (
            <FaqItem key={f.pergunta} numero={String(i + 1).padStart(2, '0')} pergunta={f.pergunta} resposta={f.resposta} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Suporte no molde da página antiga: card escuro com o texto à esquerda, o
 * destaque em laranja, o botão verde e o ícone do WhatsApp apagado ao fundo.
 */
export function SuporteV2() {
  return (
    <section className="v2-sec v2-sec--fim v2-suporte">
      <div className="v2-col v2-col--largo">
        <div className="v2-suporte__card">
          <div className="v2-suporte__texto">
            <p>
              {suporte.leadAntes}
              <span className="v2-suporte__destaque">{suporte.leadDestaque}</span>
            </p>
            <a className="v2-suporte__botao" href={suporte.linkUrl} target="_blank" rel="noopener noreferrer">
              {suporte.linkTexto}
            </a>
          </div>
          <svg className="v2-suporte__whats" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.83 9.83 0 0 1 7 2.9 9.83 9.83 0 0 1 2.89 7c0 5.45-4.44 9.88-9.89 9.88m8.41-18.3A11.81 11.81 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9a11.82 11.82 0 0 0-3.48-8.41"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}

/**
 * [14] Rodapé. Os links legais são os mesmos da página atual (`rodape` em
 * desafio.ts). O aviso de "resultados podem variar" fica: a página mostra
 * antes e depois de alunos.
 */
export function RodapeV2() {
  return (
    <footer className="v2-rodape">
      <div className="v2-col v2-centro">
        <Image src="/img/logo-desafio.svg" alt="Desafio Abdômen Insano" width={150} height={84} className="v2-rodape__logo" />
        <nav className="v2-rodape__nav">
          {rodape.navegacao.map((item) => (
            <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">
              {item.rotulo}
            </a>
          ))}
        </nav>
        <p>
          <b>{rodapeV2.responsaveisTitulo}</b>
          <br />
          {rodapeV2.responsaveis}
        </p>
        <p>
          {rodapeV2.empresa}
          <br />
          {rodapeV2.cnpj}
        </p>
        <p className="v2-rodape__aviso">{rodape.aviso}</p>
      </div>
    </footer>
  );
}
