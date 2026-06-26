import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obterContexto } from '@/lib/server/session';
import { minhasConversas, iniciarConversa } from '@/lib/server/chat';

export const metadata = { title: 'Chat' };
export const dynamic = 'force-dynamic';

export default async function ChatListaPage({
  searchParams,
}: {
  searchParams?: { erro?: string };
}) {
  const ctx = await obterContexto();
  if (!ctx) redirect('/entrar?proximo=/painel/chat');

  async function nova(formData: FormData) {
    'use server';
    const atual = await obterContexto();
    if (!atual) redirect('/entrar');
    const id = await iniciarConversa(atual.userId, String(formData.get('email') ?? ''));
    if (!id) redirect('/painel/chat?erro=1');
    redirect(`/painel/chat/${id}`);
  }

  const conversas = await minhasConversas(ctx.userId);

  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-black tracking-tight text-tinta">Chat</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Converse com empresas, profissionais e candidatos da plataforma — e envie convites de
        reunião direto na conversa.
      </p>

      <form action={nova} className="cartao mt-6 flex flex-wrap items-end gap-2">
        <label className="block flex-1">
          <span className="mb-1 block text-xs font-semibold text-slate-500">
            Iniciar conversa (e-mail do contato)
          </span>
          <input
            name="email"
            type="email"
            required
            placeholder="contato@email.com"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
          />
        </label>
        <button className="btn-primario">Conversar</button>
      </form>

      {searchParams?.erro && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Não encontrei ninguém com esse e-mail na plataforma.
        </p>
      )}

      <div className="mt-8 space-y-2">
        {conversas.length === 0 && (
          <p className="cartao text-sm text-slate-500">Nenhuma conversa ainda.</p>
        )}
        {conversas.map((c) => (
          <Link
            key={c.id}
            href={`/painel/chat/${c.id}`}
            className="cartao flex items-center justify-between gap-3 !py-3"
          >
            <div className="min-w-0">
              <p className="font-bold text-tinta">{c.titulo}</p>
              <p className="truncate text-sm text-slate-500">{c.ultima}</p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-marca-600">Abrir →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
