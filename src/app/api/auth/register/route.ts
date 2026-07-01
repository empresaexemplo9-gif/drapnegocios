/**
 * Cadastro. Dois caminhos:
 *  1) Novo negócio → cria um Tenant (slug único) e um super_admin.
 *  2) Convite → entra em um Tenant existente com o papel do convite.
 *
 * Rate limited por IP. Senha validada pela política (8+/maiúscula/número/especial).
 */
import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/server/prisma';
import { hashSenha } from '@/lib/server/password';
import { slugUnico } from '@/lib/server/tenant';
import { registrarAudit } from '@/lib/server/audit';
import { rateLimit } from '@/lib/server/rate-limit';
import { cadastroSchema } from '@/lib/validation';
import type { PapelUsuario, TipoProfile } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Identifica qual campo único colidiu num erro P2002 do Prisma. */
function alvoUnico(e: unknown): string {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
    const t = e.meta?.target;
    return Array.isArray(t) ? t.join(',') : String(t ?? '');
  }
  return '';
}

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
  const { nome, email, senha, conviteToken, nomeEmpresa, tipoPerfil, tipoProfile } = parse.data;
  const emailNorm = email.toLowerCase();

  // Não permite perfil duplicado: um e-mail = uma única conta em toda a
  // plataforma (independe do negócio/convite).
  const jaExiste = await prisma.user.findFirst({
    where: { email: emailNorm },
    select: { id: true },
  });
  if (jaExiste) {
    return NextResponse.json(
      { erro: 'Este e-mail já tem uma conta. Faça login ou use "Esqueci a senha".' },
      { status: 409 },
    );
  }

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

    // Caminho 1: criar novo tenant (com retry caso o slug colida).
    const baseEmpresa = nomeEmpresa && nomeEmpresa.trim().length >= 2 ? nomeEmpresa : nome;
    let slug = await slugUnico(baseEmpresa);
    let criado: { tenantSlug: string; userId: string; tenantId: string } | null = null;

    for (let tentativa = 0; tentativa < 5 && !criado; tentativa++) {
      try {
        const slugAtual = slug;
        const res = await prisma.$transaction(async (tx) => {
          const tenant = await tx.tenant.create({
            data: { nome: baseEmpresa, slug: slugAtual, plano: 'free', statusAssinatura: 'trial' },
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
            data: { tenantId: tenant.id, userId: user.id, tipo: tipoProfile as never },
          });
          await tx.subscription.create({
            data: { tenantId: tenant.id, plano: 'free', status: 'trial' },
          });
          return { tenantSlug: tenant.slug, userId: user.id, tenantId: tenant.id };
        });
        criado = res;
      } catch (e) {
        const alvo = alvoUnico(e);
        if (alvo.includes('email')) {
          // Único caso real de "já cadastrado": e-mail repetido neste negócio.
          return NextResponse.json(
            { erro: 'Este e-mail já tem uma conta. Faça login ou use "Esqueci a senha".' },
            { status: 409 },
          );
        }
        if (alvo.includes('slug')) {
          // Colisão de slug → tenta novamente com um sufixo aleatório.
          slug = `${slug}-${randomBytes(2).toString('hex')}`;
          continue;
        }
        throw e; // erro inesperado → cai no catch externo
      }
    }

    if (!criado) {
      return NextResponse.json(
        { erro: 'Não foi possível criar a conta agora. Tente novamente.' },
        { status: 500 },
      );
    }

    await registrarAudit({
      tenantId: criado.tenantId,
      userId: criado.userId,
      acao: 'tenant_criado',
      tabelaAfetada: 'tenants',
      dadosNovos: { slug: criado.tenantSlug },
      ip,
    });
    return NextResponse.json({ ok: true, tenantSlug: criado.tenantSlug, userId: criado.userId });
  } catch (e) {
    const alvo = alvoUnico(e);
    if (alvo.includes('email')) {
      return NextResponse.json(
        { erro: 'Este e-mail já tem uma conta. Faça login ou use "Esqueci a senha".' },
        { status: 409 },
      );
    }
    console.error('Erro no cadastro:', e);
    return NextResponse.json({ erro: 'Erro ao cadastrar. Tente novamente.' }, { status: 500 });
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
