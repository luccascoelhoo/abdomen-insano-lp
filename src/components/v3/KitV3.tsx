import Image from 'next/image';
import { CelularApp } from '@/components/v2/CelularApp';
import { telasApp } from '@/content/lp-v2';

/**
 * O "kit" da V.2 saindo por cima do card de compra: celulares com telas reais
 * do app, os dois guias bônus como capa de livro e o selo do desafio.
 *
 * É a mesma montagem do `CardOferta` da V.2, com as mesmas classes `v2-kit*`
 * (estilo em v2.css). Fica copiada aqui, e não importada, porque o
 * `CardOferta` é da home e o time do Igor mexe nele: assim a V.3 não quebra
 * quando a home muda, e vice-versa.
 */
function CelularParado({ src, className }: { src: string; className: string }) {
  return (
    <div className={`v2-celular ${className}`}>
      <div className="v2-celular__tela">
        <Image className="v2-celular__quadro is-ativa" src={src} alt="" width={540} height={1200} sizes="130px" />
      </div>
    </div>
  );
}

function Livro({ rotulo, titulo, className }: { rotulo: string; titulo: string; className: string }) {
  return (
    <div className={`v2-kit__livro ${className}`}>
      <span className="v2-kit__livro-rotulo">{rotulo}</span>
      <span className="v2-kit__livro-titulo">{titulo}</span>
      <Image src="/img/logo-desafio.svg" alt="" width={70} height={39} className="v2-kit__livro-logo" />
    </div>
  );
}

export function KitV3() {
  return (
    <div className="v2-kit">
      <Livro rotulo="Guia" titulo="Fim de Semana Sem Culpa" className="v2-kit__livro--esq" />
      <Livro rotulo="Protocolo" titulo="Anti-Inchaço" className="v2-kit__livro--dir" />
      <CelularParado src="/img/app/dieta.webp" className="v2-kit__cel v2-kit__cel--esq" />
      <CelularParado src="/img/app/serie.webp" className="v2-kit__cel v2-kit__cel--dir" />
      <CelularApp
        telas={telasApp.vitrine}
        rotulo="O app do desafio: treino, séries e dieta"
        pontos={false}
        className="v2-kit__cel v2-kit__cel--centro"
      />
      <div className="v2-kit__selo" aria-hidden="true">
        <Image src="/img/logo-desafio.svg" alt="" width={88} height={50} />
      </div>
    </div>
  );
}
