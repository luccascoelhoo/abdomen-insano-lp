import Image from 'next/image';
import Link from 'next/link';
import { rodape, type PaginaFunil as Pagina } from '@/content/desafio';
import { BotoesFunil } from './BotoesFunil';
import { ViewContentFunil } from './ViewContentFunil';
import { VslPlayer } from './VslPlayer';

/** `**trecho**` vira <b>trecho</b> — mantém a copy inteira no arquivo de conteúdo. */
function comNegrito(texto: string) {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((parte, i) =>
    parte.startsWith('**') ? <b key={i}>{parte.slice(2, -2)}</b> : parte,
  );
}

/**
 * Esqueleto das páginas pós-compra (upsell e downsell).
 *
 * Mesma identidade da LP — tinta escura, laranja, Space Grotesk no título,
 * mono na camada de dado — mas numa coluna só, estreita, com o vídeo como
 * protagonista. Nada de menu, nada de link pra fora além do rodapé legal:
 * a única saída é assistir e decidir.
 */
export function PaginaFunil({ pagina, destinoRecusa }: { pagina: Pagina; destinoRecusa: string }) {
  const esconderBotoes = Boolean(pagina.vsl.playerId && pagina.vsl.delaySegundos > 0);

  return (
    <div className="funil">
      <ViewContentFunil produtoId={pagina.produtoId} />

      <main className="funil__coluna">
        <Image
          className="funil__logo"
          src="/img/logo-desafio.svg"
          alt="Desafio Abdômen Insano"
          width={92}
          height={52}
          priority
        />

        {pagina.progresso !== undefined && (
          <div
            className="funil__progresso"
            role="progressbar"
            aria-valuenow={pagina.progresso}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso da compra"
          >
            <span className="funil__progresso-barra" style={{ width: `${pagina.progresso}%` }}>
              <span className="funil__progresso-valor">{pagina.progresso}%</span>
            </span>
          </div>
        )}

        <h1 className="funil__titulo">
          {pagina.tituloAntes}
          {pagina.tituloDestaque && <span>{pagina.tituloDestaque}</span>}
          {pagina.tituloDepois}
        </h1>

        {pagina.alerta && (
          <p className="funil__alerta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M12 9v4m0 4h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" />
            </svg>
            {pagina.alerta}
          </p>
        )}

        <div className="funil__texto">
          {pagina.paragrafos.map((p) => (
            <p key={p}>{comNegrito(p)}</p>
          ))}
        </div>

        <VslPlayer vsl={pagina.vsl} />

        <BotoesFunil
          aceitar={pagina.aceitar}
          produtoId={pagina.produtoId}
          recusarTexto={pagina.recusarTexto}
          recusarHref={destinoRecusa}
          esconder={esconderBotoes}
        />
      </main>

      <footer className="funil__rodape">
        <nav className="footer__nav">
          {rodape.navegacao.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.rotulo}
            </Link>
          ))}
        </nav>
        <p>{rodape.empresa}</p>
      </footer>
    </div>
  );
}
