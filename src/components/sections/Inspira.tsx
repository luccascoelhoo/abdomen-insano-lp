import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { inspira } from '@/content/desafio';

export function Inspira() {
  return (
    <section className="sec sec--dark">
      <div className="wrap inspira">
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
    </section>
  );
}
