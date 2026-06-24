/**
 * Exemplo de rota de domínio multi-tenant com RBAC + RLS.
 *
 *  GET  → lista vagas do tenant (permissão vagas:ler).
 *  POST → cria vaga (permissão vagas:gerenciar).
 *
 * Todas as queries passam por `withTenant`, que fixa o tenant da sessão na
 * transação — o RLS no banco garante o isolamento mesmo se a aplicação falhar.
 */
import { NextResponse } from 'next/server';
import { withTenant } from '@/lib/server/prisma';
import { exigirPermissao, HttpError } from '@/lib/server/session';
import { registrarAudit } from '@/lib/server/audit';

function trata(e: unknown) {
  if (e instanceof HttpError) return NextResponse.json({ erro: e.message }, { status: e.status });
  return NextResponse.json({ erro: 'Erro interno.' }, { status: 500 });
}

export async function GET() {
  try {
    const ctx = await exigirPermissao('vagas:ler');
    const vagas = await withTenant(ctx.tenantId, (db) =>
      db.job.findMany({ orderBy: { criadoEm: 'desc' }, take: 100 }),
    );
    return NextResponse.json({ vagas });
  } catch (e) {
    return trata(e);
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await exigirPermissao('vagas:gerenciar');
    const corpo = await req.json().catch(() => ({}));
    if (!corpo?.titulo || !corpo?.descricao) {
      return NextResponse.json({ erro: 'titulo e descricao são obrigatórios.' }, { status: 400 });
    }
    const vaga = await withTenant(ctx.tenantId, (db) =>
      db.job.create({
        data: {
          tenantId: ctx.tenantId,
          empresaId: ctx.userId,
          titulo: String(corpo.titulo),
          descricao: String(corpo.descricao),
          requisitos: corpo.requisitos ? String(corpo.requisitos) : null,
          regiao: corpo.regiao ? String(corpo.regiao) : null,
          planoNaPublicacao: ctx.plano as never,
        },
      }),
    );
    await registrarAudit({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      acao: 'vaga_criada',
      tabelaAfetada: 'jobs',
      dadosNovos: { id: vaga.id, titulo: vaga.titulo },
    });
    return NextResponse.json({ vaga }, { status: 201 });
  } catch (e) {
    return trata(e);
  }
}
