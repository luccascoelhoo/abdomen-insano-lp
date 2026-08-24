import Image from 'next/image';
import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { inspira } from '@/content/desafio';

export function Inspira() {
  return (
    <section className="sec sec--dark">
      <div className="wrap inspira">
        <div className="inspira__texto">
          <MaskTitle
            className="inspira__frase"
            linhas={[
              'Não importa',
              'se você está',
              <em key="destaque">{inspira.citacaoDestaque}</em>,
            ]}
          />
          <Reveal className="inspira__corpo" delay={260}>
            <p>{inspira.corpo}</p>
          </Reveal>
        </div>
        <Reveal className="inspira__foto" delay={200}>
          <Image
            src="/img/igor-inspira.jpg"
            alt="Igor Correa em pose confiante"
            width={935}
            height={1400}
            sizes="(min-width: 940px) 34vw, 90vw"
          />
        </Reveal>
      </div>
    </section>
  );
}
