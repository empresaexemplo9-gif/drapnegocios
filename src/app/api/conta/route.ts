/**
 * Exclusão da própria conta. DELETE /api/conta
 *
 * Exige sessão válida e que o corpo confirme o e-mail da conta (defesa contra
 * cliques acidentais e contra requisições forjadas). Após excluir, o cliente
 * encerra a sessão (signOut) — ver components/ExcluirContaBotao.tsx.
 */
import { NextResponse } from 'next/server';
import { exigirAuth, HttpError } from '@/lib/server/session';
import { excluirMinhaConta } from '@/lib/server/conta';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(req: Request) {
  let ctx;
  try {
    ctx = await exigirAuth();
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500;
    return NextResponse.json({ erro: 'Não autenticado.' }, { status });
  }

  const corpo = await req.json().catch(() => null);
  const confirmacao = String(corpo?.confirmacao ?? '')
    .trim()
    .toLowerCase();

  if (!ctx.email || confirmacao !== ctx.email.toLowerCase()) {
    return NextResponse.json(
      { erro: 'Confirmação inválida. Digite seu e-mail exatamente para excluir.' },
      { status: 400 },
    );
  }

  try {
    await excluirMinhaConta(ctx.tenantId, ctx.userId);
  } catch (e) {
    console.error('Erro ao excluir conta:', e);
    return NextResponse.json(
      { erro: 'Não foi possível excluir a conta agora. Tente novamente.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
