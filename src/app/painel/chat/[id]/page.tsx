import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obterContexto } from '@/lib/server/session';
import { participaDaConversa, enviarConviteNoChat } from '@/lib/server/chat';
import { minhasReunioes } from '@/lib/server/agenda';
import { Chat } from '@/components/Chat';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Conversa' };

export default async function ConversaPage({ params }: { params: { id: string } }) {
  const ctx = await obterContexto();
  if (!ctx) redirect(`/entrar?proximo=/painel/chat/${params.id}`);
  if (!(await participaDaConversa(params.id, ctx.userId))) redirect('/painel/chat');

  async function compartilharConvite(formData: FormData) {
    'use server';
    const atual = await obterContexto();
    if (!atual) redirect('/entrar');
    const reuniaoId = String(formData.get('reuniaoId') ?? '');
    if (reuniaoId) await enviarConviteNoChat(params.id, atual.userId, reuniaoId);
    redirect(`/painel/chat/${params.id}`);
  }

  const reunioes = await minhasReunioes(ctx.userId, ctx.email ?? '');

  return (
    <div className="container-app py-8">
      <Link href="/painel/chat" className="text-sm font-semibold text-marca-600">
        ← Conversas
      </Link>

      <div className="mt-4">
        <Chat conversaId={params.id} meuId={ctx.userId} />
      </div>

      {/* Enviar convite de reunião no chat */}
      {reunioes.length > 0 && (
        <form action={compartilharConvite} className="cartao mt-4 flex flex-wrap items-end gap-2">
          <label className="block flex-1">
            <span className="mb-1 block text-xs font-semibold text-slate-500">
              Enviar convite de um compromisso seu
            </span>
            <select
              name="reuniaoId"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            >
              {reunioes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.titulo} · {r.inicioEm.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                </option>
              ))}
            </select>
          </label>
          <button className="btn-secundario !py-2">Enviar convite</button>
        </form>
      )}
      <p className="mt-3 text-xs text-slate-400">
        Precisa agendar?{' '}
        <Link href="/painel/agenda" className="font-semibold text-marca-600">
          Criar compromisso
        </Link>
        . Quem aceitar o convite entra na call.
      </p>
    </div>
  );
}
