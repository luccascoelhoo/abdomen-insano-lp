import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { suporte } from '@/content/desafio';

export function Suporte() {
  return (
    <section className="sec suporte">
      <div className="wrap">
        <MaskTitle className="d3" linhas={[suporte.titulo]} />
        <Reveal as="p" className="lead" delay={140}>
          {suporte.lead}
        </Reveal>

        <Reveal as="div" delay={200}>
          {suporte.linkUrl ? (
            <a
              className="link-suporte"
              href={suporte.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {suporte.linkTexto}
            </a>
          ) : (
            <a className="link-suporte link-suporte--email" href={`mailto:${suporte.emailContato}`}>
              {suporte.emailTexto} <span>{suporte.emailContato}</span>
            </a>
          )}
        </Reveal>
      </div>
    </section>
  );
}
