import { BotaoRolagem } from './BotaoRolagem';
import { depoimentosV2 } from '@/content/lp-v2';
import { AntesDepois } from '@/components/ui/AntesDepois';
import { CarrosselCasos } from './CarrosselCasos';
import { Rico } from './Rico';

/**
 * [5] Depoimentos — antes e depois reais. Os casos em destaque viram cartões
 * fixos (sem arraste, pensados para o celular); o resto segue no trilho. Sem
 * nome, número ou prazo: não temos esses dados dos alunos.
 */
export function DepoimentosV2() {
  const { casos, destaques } = depoimentosV2;
  const ids: readonly number[] = destaques;
  const emDestaque = destaques.flatMap((id) => casos.filter((c) => c.id === id));
  const demais = casos.filter((c) => !ids.includes(c.id));

  return (
    <section className="v2-sec v2-sec--escuro">
      <div className="v2-col v2-col--largo">
        <h2 className="v2-h2 v2-centro">
          {depoimentosV2.titulo}{' '}
          <span className="v2-acento">
            <Rico texto={depoimentosV2.tituloDestaque} />
          </span>
        </h2>
        <p className="v2-sub v2-centro">{depoimentosV2.sub}</p>
        <div className="v2-comparadores">
          {emDestaque.map((c) => (
            <AntesDepois
              key={c.src}
              src={c.src}
              alt={c.alt}
              legenda={depoimentosV2.legendaDestaque}
              sizes="(max-width: 560px) 100vw, (max-width: 900px) 520px, 360px"
            />
          ))}
        </div>
        {demais.length > 0 ? (
          <>
            <p className="v2-mais-resultados">{depoimentosV2.maisResultados}</p>
            <CarrosselCasos casos={demais} />
          </>
        ) : null}
        <div className="v2-botao-secao">
          <BotaoRolagem alvo="como-funciona">{depoimentosV2.cta}</BotaoRolagem>
        </div>
      </div>
    </section>
  );
}
