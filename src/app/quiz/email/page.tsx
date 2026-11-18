import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'E-mail | Desafio Abdômen Insano',
  robots: { index: false, follow: false },
};

const MENSAGENS: Record<string, { titulo: string; texto: string }> = {
  confirmado: {
    titulo: 'E-mail confirmado!',
    texto: 'Pronto. Você vai receber as dicas e os lembretes do desafio. Pode sair da lista quando quiser, pelo link no fim de cada e-mail.',
  },
  saiu: {
    titulo: 'Você saiu da lista',
    texto: 'Não vamos mais mandar dicas nem lembretes para este e-mail.',
  },
  invalido: {
    titulo: 'Link vencido ou inválido',
    texto: 'Este link não vale mais. Se quiser, refaça o quiz para receber um novo.',
  },
  erro: {
    titulo: 'Algo deu errado',
    texto: 'Não conseguimos registrar agora. Tente de novo em alguns minutos.',
  },
};

export default async function PaginaEmail({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const m = MENSAGENS[status ?? ''] ?? MENSAGENS.invalido;
  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24, background: '#f2f2f2', fontFamily: 'var(--font-body, system-ui)' }}>
      <div style={{ maxWidth: 440, background: '#fff', borderRadius: 20, padding: '32px 24px', textAlign: 'center', border: '1px solid #e3e3e3' }}>
        <h1 style={{ margin: '0 0 10px', fontSize: 26, fontWeight: 900, color: '#111' }}>{m.titulo}</h1>
        <p style={{ margin: '0 0 22px', color: '#555', lineHeight: 1.5 }}>{m.texto}</p>
        <Link href="/" style={{ color: '#c2410c', fontWeight: 800 }}>
          Ir para o Desafio Abdômen Insano
        </Link>
      </div>
    </main>
  );
}
