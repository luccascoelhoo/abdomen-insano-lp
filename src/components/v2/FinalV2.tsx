import Image from 'next/image';
import { FaqItem } from '@/components/ui/FaqItem';
import { rodape, suporte } from '@/content/desafio';
import { faqV2, rodapeV2, suporteV2 } from '@/content/lp-v2';
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

/** [13] Suporte — o mesmo link da página atual (WhatsApp, se configurado; senão a página do Flameer). */
export function SuporteV2() {
  return (
    <section className="v2-sec v2-sec--fim v2-suporte">
      <div className="v2-col v2-centro">
        <p>{suporteV2.texto}</p>
        <a className="v2-botao-contorno" href={suporte.linkUrl} target="_blank" rel="noopener noreferrer">
          {suporte.linkTexto}
        </a>
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
