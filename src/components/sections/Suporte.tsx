import { Reveal } from '@/components/ui/Reveal';
import { suporte } from '@/content/desafio';

/**
 * Ícone WhatsApp em silhueta, usado como marca d'água à direita do card
 * de suporte — dá sinal visual do canal sem depender do texto.
 */
function IconeWpp() {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M27.2 4.7A15.9 15.9 0 0 0 16 0C7.2 0 0 7.2 0 16c0 2.8.7 5.5 2.1 7.9L0 32l8.4-2.2A16 16 0 0 0 16 32c8.8 0 16-7.2 16-16 0-4.3-1.7-8.3-4.8-11.3zM16 29.3c-2.4 0-4.7-.6-6.7-1.9l-.5-.3-5 1.3 1.3-4.9-.3-.5A13.2 13.2 0 0 1 2.7 16C2.7 8.7 8.7 2.7 16 2.7c3.6 0 6.9 1.4 9.4 3.9 2.5 2.5 3.9 5.9 3.9 9.4 0 7.3-6 13.3-13.3 13.3zm7.3-9.9c-.4-.2-2.4-1.2-2.7-1.3-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.3 1.6-.2.3-.5.3-.9.1-.4-.2-1.7-.6-3.2-2-1.2-1.1-2-2.4-2.2-2.8-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.4-.6.1-.2.1-.5 0-.7-.1-.2-.9-2.2-1.3-3-.3-.8-.7-.7-.9-.7h-.8c-.3 0-.7.1-1.1.5-.4.4-1.4 1.4-1.4 3.4 0 2 1.5 3.9 1.7 4.2.2.3 2.9 4.4 7 6.2 1 .4 1.7.7 2.3.9.9.3 1.8.2 2.4.2.7-.1 2.4-1 2.7-1.9.3-.9.3-1.7.2-1.9-.1-.2-.4-.3-.8-.5z" />
    </svg>
  );
}

export function Suporte() {
  const href = suporte.linkUrl || `mailto:${suporte.emailContato}`;

  return (
    <section className="sec suporte">
      <div className="wrap">
        <Reveal className="suporte-card">
          <div className="suporte-card__conteudo">
            <p className="suporte-card__texto">
              {suporte.leadAntes}
              <span>{suporte.leadDestaque}</span>
            </p>

            <a
              className="suporte-card__cta"
              href={href}
              target={suporte.linkUrl ? '_blank' : undefined}
              rel={suporte.linkUrl ? 'noopener noreferrer' : undefined}
            >
              {suporte.linkTexto}
            </a>
          </div>

          <div className="suporte-card__marca" aria-hidden="true">
            <IconeWpp />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
