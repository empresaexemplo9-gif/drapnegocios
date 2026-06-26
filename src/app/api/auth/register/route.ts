/**
 * Cadastro. Dois caminhos:
 *  1) Novo negócio → cria um Tenant (slug único) e um super_admin.
 *  2) Convite → entra em um Tenant existente com o papel do convite.
 *
 * Rate limited por IP. Senha validada pela política (8+/maiúscula/número/especial).
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { hashSenha } from '@/lib/server/password';
import { slugUnico } from '@/lib/server/tenant';
import { registrarAudit } from '@/lib/server/audit';
import { rateLimit } from '@/lib/server/rate-limit';
import { cadastroSchema } from '@/lib/validation';
import type { PapelUsuario, TipoProfile } from '@prisma/client';

function ipDe(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'desconhecido'
  );
}

export async function POST(req: Request) {
  const ip = ipDe(req);
  if (!rateLimit(`register:${ip}`, 5, 60_000).permitido) {
    return NextResponse.json({ erro: 'Muitas tentativas. Tente em instantes.' }, { status: 429 });
  }

  const corpo = await req.json().catch(() => null);
  const parse = cadastroSchema.safeParse(corpo);
  if (!parse.success) {
    return NextResponse.json(
      { erro: 'Dados inválidos', detalhes: parse.error.flatten() },
      { status: 400 },
    );
  }
  const { nome, email, senha, conviteToken, nomeEmpresa, tipoPerfil } = parse.data;
  const emailNorm = email.toLowerCase();
  const senhaHash = await hashSenha(senha);

  try {
    if (conviteToken) {
      // Caminho 2: entrar em tenant existente.
      const convite = await prisma.convite.findUnique({ where: { token: conviteToken } });
      if (!convite || convite.status !== 'pendente' || convite.expiraEm < new Date()) {
        return NextResponse.json({ erro: 'Convite inválido ou expirado.' }, { status: 400 });
      }
      const user = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            tenantId: convite.tenantId,
            nome,
            email: emailNorm,
            senhaHash,
            tipoPerfil,
            papel: convite.papel,
            status: 'ativo',
          },
        });
        await tx.profile.create({
          data: {
            tenantId: convite.tenantId,
            userId: u.id,
            tipo: papelParaProfile(convite.papel),
          },
        });
        await tx.convite.update({ where: { id: convite.id }, data: { status: 'aceito' } });
        return u;
      });
      await registrarAudit({
        tenantId: convite.tenantId,
        userId: user.id,
        acao: 'cadastro_via_convite',
        tabelaAfetada: 'users',
        ip,
      });
      return NextResponse.json({ ok: true, tenantId: convite.tenantId, userId: user.id });
    }

    // Caminho 1: criar novo tenant.
    const slug = await slugUnico(nomeEmpresa ?? nome);
    const { tenant, user } = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { nome: nomeEmpresa ?? nome, slug, plano: 'free', statusAssinatura: 'trial' },
      });
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          nome,
          email: emailNorm,
          senhaHash,
          tipoPerfil,
          papel: 'super_admin',
          status: 'ativo',
        },
      });
      await tx.profile.create({
        data: { tenantId: tenant.id, userId: user.id, tipo: 'empresa_contratante' },
      });
      await tx.subscription.create({
        data: { tenantId: tenant.id, plano: 'free', status: 'trial' },
      });
      return { tenant, user };
    });

    await registrarAudit({
      tenantId: tenant.id,
      userId: user.id,
      acao: 'tenant_criado',
      tabelaAfetada: 'tenants',
      dadosNovos: { slug: tenant.slug },
      ip,
    });
    return NextResponse.json({ ok: true, tenantSlug: tenant.slug, userId: user.id });
  } catch (e) {
    // Violação de unicidade (email já existe no tenant) cai aqui.
    const msg = e instanceof Error ? e.message : 'Erro ao cadastrar';
    if (msg.includes('Unique') || msg.includes('unique')) {
      return NextResponse.json({ erro: 'E-mail já cadastrado neste negócio.' }, { status: 409 });
    }
    return NextResponse.json({ erro: 'Erro ao cadastrar.' }, { status: 500 });
  }
}

function papelParaProfile(papel: PapelUsuario): TipoProfile {
  switch (papel) {
    case 'seller':
      return 'vendedor';
    case 'candidate':
      return 'candidato';
    case 'recruiter':
    case 'manager':
    case 'admin':
    case 'super_admin':
      return 'empresa_contratante';
    default:
      return 'comprador';
  }
}
