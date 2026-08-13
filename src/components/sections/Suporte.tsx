import { Reveal } from '@/components/ui/Reveal';
import { suporte } from '@/content/desafio';

export function Suporte() {
  return (
    <section className="sec sec--alt support">
      <div className="wrap">
        <Reveal as="p" className="eyebrow eyebrow--center">
          {suporte.eyebrow}
        </Reveal>
        <Reveal as="h2" className="h2">
          {suporte.titulo}
        </Reveal>
        <Reveal as="p" className="lead">
          {suporte.lead}
        </Reveal>

        {/*
          Sem link configurado, nada é renderizado — melhor não ter botão do que
          ter um botão morto, que é o que está no ar hoje (href="#").
          Defina NEXT_PUBLIC_WHATSAPP_URL para ligar.
        */}
        {suporte.linkUrl ? (
          <Reveal as="div">
            <a
              className="support-link"
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
