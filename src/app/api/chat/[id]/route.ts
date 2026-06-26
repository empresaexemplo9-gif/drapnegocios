/**
 * Mensagens de uma conversa.
 *  GET  ?desde=<iso> → mensagens novas (para o polling do chat)
 *  POST { texto }    → envia uma mensagem de texto
 * Exige sessão e que o usuário participe da conversa.
 */
import { NextResponse } from 'next/server';
import { obterContexto } from '@/lib/server/session';
import { mensagens, enviarMensagem } from '@/lib/server/chat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const ctx = await obterContexto();
  if (!ctx) return NextResponse.json({ erro: 'Não autenticado' }, { status: 403 });
  const desde = new URL(req.url).searchParams.get('desde') ?? undefined;
  const msgs = await mensagens(params.id, ctx.userId, desde);
  if (msgs === null) return NextResponse.json({ erro: 'Sem acesso' }, { status: 403 });
  return NextResponse.json({ mensagens: msgs });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ctx = await obterContexto();
  if (!ctx) return NextResponse.json({ erro: 'Não autenticado' }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const ok = await enviarMensagem(params.id, ctx.userId, String(body?.texto ?? ''));
  if (!ok) return NextResponse.json({ erro: 'Não enviado' }, { status: 400 });
  return NextResponse.json({ ok: true });
}
