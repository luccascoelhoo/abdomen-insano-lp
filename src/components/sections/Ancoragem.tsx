import { MaskTitle } from '@/components/ui/MaskTitle';
import { Reveal } from '@/components/ui/Reveal';
import { ancoragem } from '@/content/desafio';

/**
 * Bloco de ancoragem de preço — bloco "racional" do modelo Mateus Dias
 * cruzado com a tese Ícaro de "mostrar o que a pessoa perde ao não comprar".
 *
 * Fica entre Bonus e Oferta: depois de mostrar tudo que vai receber (peso
 * emocional/lógico), joga uma tabela com o custo real das alternativas do
 * mercado fitness. Quando a Oferta chega logo em seguida com R$42, o preço
 * parece pechincha absoluta.
 */
export function Ancoragem() {
  return (
    <section className="sec sec--dark ancoragem">
      <div className="wrap">
        <MaskTitle
          as="h2"
          className="d2 ancoragem__titulo"
          linhas={ancoragem.tituloLinhas}
        />
        <Reveal as="p" className="lead" delay={180}>
          {ancoragem.lead}
        </Reveal>

        <div className="ancoragem__tabela">
          {ancoragem.linhas.map((linha, i) => (
            <Reveal
              key={linha.rotulo}
              className="ancoragem__linha"
              delay={220 + i * 90}
            >
              <span className="ancoragem__rotulo">{linha.rotulo}</span>
              <span className="ancoragem__valor">{linha.valor}</span>
              <span className="ancoragem__obs">{linha.obs}</span>
            </Reveal>
          ))}

          <Reveal className="ancoragem__linha ancoragem__linha--nossa" delay={620}>
            <span className="ancoragem__rotulo">{ancoragem.vsRotulo}</span>
            <span className="ancoragem__valor">{ancoragem.vsValor}</span>
            <span className="ancoragem__obs">{ancoragem.vsObs}</span>
          </Reveal>
        </div>

        <Reveal as="p" className="ancoragem__remate" delay={780}>
          {ancoragem.remate}
        </Reveal>
      </div>
    </section>
  );
}
