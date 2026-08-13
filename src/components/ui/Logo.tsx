import Image from 'next/image';
import { marca } from '@/content/desafio';
import { IMAGENS_PRONTAS } from '@/lib/flags';

/** A logo só aparece sobre fundo preto — o texto dela é branco. */
export function Logo({ altura }: { altura: number }) {
  if (!IMAGENS_PRONTAS) {
    return (
      <span
        style={{
          display: 'inline-block',
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '-0.03em',
          fontSize: altura * 0.52,
          lineHeight: 1,
          color: 'var(--paper)',
        }}
      >
        Abdômen <span style={{ color: 'var(--orange)' }}>Insano</span>
      </span>
    );
  }

  return (
    <Image
      src={marca.logo}
      alt={marca.nome}
      height={altura}
      width={altura * 5}
      style={{ height: altura, width: 'auto' }}
      priority
    />
  );
}
