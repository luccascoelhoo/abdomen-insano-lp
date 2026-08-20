import Image from 'next/image';
import { IMAGENS_PRONTAS } from '@/lib/flags';

type Props = {
  src?: string;
  alt?: string;
};

export function HeroFoto({ src = '/img/hero-atleta.jpg', alt = 'Resultado do desafio' }: Props) {
  return (
    <div className="herofoto">
      <div className="herofoto__quadro">
        {IMAGENS_PRONTAS ? (
          <div className="herofoto__img">
            <Image src={src} alt={alt} fill sizes="(min-width: 1000px) 48vw, 100vw" priority />
          </div>
        ) : (
          <div className="herofoto__placeholder" aria-hidden="true">
            <div className="herofoto__placeholder-texto">
              <b>Sua foto aqui</b>
              <span>coloque em /public/img/hero-atleta.jpg</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
