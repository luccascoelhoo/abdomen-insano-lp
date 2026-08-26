import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { entregaveis, entregaveisSecao } from '@/content/desafio';
import { Layers, Dumbbell, Utensils, Zap, Video } from 'lucide-react';

const icons = [Layers, Dumbbell, Utensils, Zap, Video];

export function Entregaveis() {
  return (
    <section className="sec sec--dark">
      <div className="wrap flex flex-col items-center">
        <div className="max-w-[800px] mx-auto text-center">
          <MaskTitle 
            className="d2 flex flex-col items-center justify-center text-center leading-tight" 
            linhas={entregaveisSecao.tituloLinhas} 
            classesLinha={[undefined, 'text-[#ff6b00]']}
          />
          <Reveal as="p" className="lead mx-auto text-center mt-6 text-[1.1rem] md:text-[1.25rem] text-[#a39f98]" delay={200}>
            {entregaveisSecao.lead}
          </Reveal>
          <Reveal as="p" className="font-bold text-white mt-8 mb-12 tracking-wide text-sm md:text-base uppercase text-center" delay={260}>
            {entregaveisSecao.intro}
          </Reveal>
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6 w-full max-w-[1000px] mx-auto">
          {entregaveis.map((item, i) => {
            const Icon = icons[i] || Zap;
            return (
              <Reveal 
                as="div" 
                key={item} 
                delay={i * 90} 
                className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[300px] flex-shrink-0"
              >
                <div className="flex flex-col items-center justify-center p-6 h-[180px] md:h-[220px] bg-[#1a1310] border border-[#ff6b00]/30 rounded-[20px] transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.25)] hover:border-[#ff6b00]/70 group cursor-default">
                  <Icon 
                    className="w-12 h-12 text-[#ff6b00] mb-5 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]" 
                    strokeWidth={1.5} 
                  />
                  <h3 className="text-[#f1eee7] text-base md:text-[1.1rem] font-semibold text-center leading-snug">
                    {item}
                  </h3>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
