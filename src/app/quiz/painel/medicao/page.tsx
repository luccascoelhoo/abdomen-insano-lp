import { logado } from '@/lib/quiz-painel';
import { ErroDoPainel, lerMedicao } from '@/lib/painel/dados';
import { tempoRelativo, dataHora } from '@/lib/painel/tempo';
import { SUPERFICIE, TEXTO } from '@/lib/painel/tema';
import { Bloco, Cabeca, Cartao, Erro, Vazio, num, type TomDoCartao } from '../_ui/Blocos';

/**
 * A medição está viva? Três perguntas: o quiz grava tela, grava lead, e o
 * servidor entrega os eventos à Meta. Sem tráfego, "parado" não é defeito:
 * por isso cada cartão diz há quanto tempo foi o último, e não só verde ou vermelho.
 */
const tomPorIdade = (iso: string | null, agora: Date, horasAtencao: number): TomDoCartao => {
  if (!iso) return 'atencao';
  const h = (agora.getTime() - new Date(iso).getTime()) / 3_600_000;
  return h <= horasAtencao ? 'positivo' : 'atencao';
};

export default async function Medicao() {
  if (!(await logado())) return null;
  const agora = new Date();
  let m;
  try {
    m = await lerMedicao(agora);
  } catch (e) {
    return <Erro>Não consegui ler a medição: {e instanceof ErroDoPainel ? e.message : 'erro inesperado'}.</Erro>;
  }
  const falhas = m.servidor.reduce((s, e) => s + e.falhas, 0);
  return (
    <>
      <Cabeca titulo="Medição" sub="A medição está viva? Leia antes de confiar em qualquer número do painel" lidoEm={agora} />
      <div className="space-y-4 sm:space-y-6">
        <Bloco titulo="Quiz" descricao="Com anúncio no ar, os dois devem ter menos de algumas horas">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Cartao
              titulo="Última tela gravada"
              valor={m.ultimoEventoDoQuiz ? tempoRelativo(new Date(m.ultimoEventoDoQuiz), agora) : 'nunca'}
              detalhe={m.ultimoEventoDoQuiz ? dataHora(m.ultimoEventoDoQuiz) : 'nenhuma jornada real medida ainda'}
              tom={tomPorIdade(m.ultimoEventoDoQuiz, agora, 6)}
            />
            <Cartao titulo="Telas nas últimas 24 h" valor={num(m.eventosDoQuiz24h)} detalhe="eventos de tela, sem os de teste" />
            <Cartao
              titulo="Último lead"
              valor={m.ultimoLead ? tempoRelativo(new Date(m.ultimoLead), agora) : 'nunca'}
              detalhe={m.ultimoLead ? dataHora(m.ultimoLead) : '—'}
              tom={tomPorIdade(m.ultimoLead, agora, 24)}
            />
          </div>
        </Bloco>
        <Bloco titulo="Servidor → Meta (últimos 7 dias)" descricao="Cópia dos eventos mandada pelo servidor (API de Conversões), do site inteiro e só do quiz">
          {m.servidor.length === 0 ? (
            <Vazio>Nenhum envio do servidor na última semana.</Vazio>
          ) : (
            <>
              <div className="overflow-x-auto text-[13px]">
                <div className="min-w-[520px]">
                  <div className="grid grid-cols-[1fr_90px_90px_90px_130px] gap-3 px-3 py-2 text-[11px] uppercase tracking-[0.06em]" style={{ color: TEXTO.t3, background: SUPERFICIE.s2 }}>
                    <span>Evento</span><span className="text-right">Enviados</span><span className="text-right">Do quiz</span><span className="text-right">Falhas</span><span className="text-right">Último</span>
                  </div>
                  {m.servidor.map((e) => (
                    <div key={e.evento} className="grid grid-cols-[1fr_90px_90px_90px_130px] gap-3 border-b px-3 py-2" style={{ borderColor: SUPERFICIE.linhaFina }}>
                      <span style={{ color: TEXTO.t1 }}>{e.evento}</span>
                      <span className="text-right" style={{ color: TEXTO.t2 }}>{num(e.total)}</span>
                      <span className="text-right" style={{ color: TEXTO.t2 }}>{num(e.doQuiz)}</span>
                      <span className="text-right" style={{ color: e.falhas ? '#FF6369' : TEXTO.t3 }}>{num(e.falhas)}</span>
                      <span className="text-right" style={{ color: TEXTO.t3 }}>{e.ultimo ? tempoRelativo(new Date(e.ultimo), agora) : '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-[12px]" style={{ color: falhas ? '#FF6369' : TEXTO.t3 }}>
                {falhas ? `${num(falhas)} envio(s) recusado(s) pela Meta na semana: vale abrir o log da Vercel.` : 'Nenhum envio recusado pela Meta na semana.'}
                {' '}O PageView não é registrado aqui (sai do servidor, mas não grava linha).
              </p>
            </>
          )}
        </Bloco>
      </div>
    </>
  );
}
