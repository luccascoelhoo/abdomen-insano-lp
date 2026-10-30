import Image from 'next/image';
import { Responsaveis } from '@/components/v3/Blocos';
import { solucaoV2 } from '@/content/lp-v2';
import { Rico } from './Rico';

/** [4] Mecanismo da solução — o Método Capa Zero e as 3 engrenagens. */
export function SolucaoV2() {
  return (
    <section className="v2-sec v2-sec--claro">
      <div className="v2-col">
        <h2 className="v2-h2 v2-centro">
          {solucaoV2.tituloAntes}{' '}
          <span className="v2-acento">
            <Rico texto={solucaoV2.tituloDestaque} />
          </span>{' '}
          {solucaoV2.tituloDepois}
        </h2>
        <p className="v2-sub v2-centro">
          <Rico texto={solucaoV2.sub} />
        </p>

        <ol className="v2-engrenagens">
          {solucaoV2.engrenagens.map((e) => (
            <li key={e.titulo} className="v2-engrenagem">
              <div className="v2-engrenagem__img">
                <Image src={e.imagem.src} alt={e.imagem.alt} width={e.imagem.width} height={e.imagem.height} sizes="112px" />
              </div>
              <div>
                <p className="v2-engrenagem__rotulo">{e.rotulo}</p>
                <h3 className="v2-h3">{e.titulo}</h3>
                <p>
                  <Rico texto={e.texto} />
                </p>
              </div>
            </li>
          ))}
        </ol>
        <Responsaveis solto />
      </div>
    </section>
  );
}
