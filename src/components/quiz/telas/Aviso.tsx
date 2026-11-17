/**
 * O `AvisoOnboarding` do app: card com borda na cor do aviso (laranja = atenção,
 * vermelho = impedimento), ícone à esquerda e o texto.
 */
export function Aviso({ texto, bloqueante = false }: { texto: string; bloqueante?: boolean }) {
  return (
    <div className={`qc-aviso${bloqueante ? ' qc-aviso--bloqueio' : ''}`}>
      <svg className="qc-aviso__icone" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
        {bloqueante ? (
          <>
            <path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86z" fill="currentColor" />
            <path d="M12 7v6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="12" cy="16.8" r="1.4" fill="#fff" />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="10" fill="currentColor" />
            <path d="M12 11v6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="12" cy="7.4" r="1.4" fill="#fff" />
          </>
        )}
      </svg>
      <p>
        <span className="q-sr">{bloqueante ? 'Impedimento: ' : 'Atenção: '}</span>
        {texto}
      </p>
    </div>
  );
}
