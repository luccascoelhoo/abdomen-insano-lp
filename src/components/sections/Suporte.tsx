import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { suporte } from '@/content/desafio';

export function Suporte() {
  return (
    <section className="sec suporte">
      <div className="wrap">
        <Reveal as="p" className="rotulo">
          {suporte.eyebrow}
        </Reveal>
        <MaskTitle className="d3" linhas={[suporte.titulo]} />
        <Reveal as="p" className="lead" delay={140}>
          {suporte.lead}
        </Reveal>

        {/*
          Sem link configurado, nada é renderizado — melhor não ter botão do que
          ter um botão morto, que é o que está no ar hoje (href="#").
          Defina NEXT_PUBLIC_WHATSAPP_URL para ligar.
        */}
        {suporte.linkUrl ? (
          <Reveal as="div" delay={200}>
            <a
              className="link-suporte"
              href={suporte.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {suporte.linkTexto}
            </a>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
