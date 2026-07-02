/**
 * Administração da PLATAFORMA (acima dos tenants) — para o dono fazer edições e
 * reparos: ver/excluir negócios e usuários, suspender contas, estatísticas.
 *
 * Acesso liberado só para e-mails listados em ADMIN_EMAILS (separados por
 * vírgula). Defina essa variável na Vercel com o seu e-mail.
 */
import { prisma } from './prisma';
import { hashSenha, politicaSenha } from './password';

export function ehAdminPlataforma(email?: string | null): boolean {
  if (!email) return false;
  const lista = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return lista.includes(email.toLowerCase());
}

export async function estatisticasPlataforma() {
  const [tenants, users, jobs, products, posts, reunioes] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.job.count(),
    prisma.product.count(),
    prisma.post.count(),
    prisma.reuniao.count(),
  ]);
  return { tenants, users, jobs, products, posts, reunioes };
}

export interface TenantAdmin {
  id: string;
  nome: string;
  slug: string;
  plano: string;
  usuarios: number;
  dono: string;
  criadoEm: string;
}

export async function listarTenantsAdmin(): Promise<TenantAdmin[]> {
  const ts = await prisma.tenant.findMany({
    include: {
      _count: { select: { users: true } },
      users: { where: { papel: 'super_admin' }, select: { email: true }, take: 1 },
    },
    orderBy: { criadoEm: 'desc' },
    take: 300,
  });
  return ts.map((t) => ({
    id: t.id,
    nome: t.nome,
    slug: t.slug,
    plano: t.plano,
    usuarios: t._count.users,
    dono: t.users[0]?.email ?? '—',
    criadoEm: t.criadoEm.toISOString(),
  }));
}

export async function excluirTenant(id: string): Promise<void> {
  // Cascata: apaga usuários, perfis, vagas, produtos, etc. do negócio.
  await prisma.tenant.delete({ where: { id } });
}

export interface UsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  papel: string;
  status: string;
  negocio: string;
  criadoEm: string;
}

export async function listarUsuariosAdmin(): Promise<UsuarioAdmin[]> {
  const us = await prisma.user.findMany({
    include: { tenant: { select: { nome: true } } },
    orderBy: { criadoEm: 'desc' },
    take: 300,
  });
  return us.map((u) => ({
    id: u.id,
    nome: u.nome,
    email: u.email,
    papel: u.papel,
    status: u.status,
    negocio: u.tenant.nome,
    criadoEm: u.criadoEm.toISOString(),
  }));
}

export async function excluirUsuario(id: string): Promise<void> {
  // Algumas relações com User não têm ON DELETE CASCADE (jobs, products,
  // applications, reuniões), então o delete direto falha por constraint de FK.
  // Apagamos os dependentes numa transação antes do usuário. As demais relações
  // (profile, posts, chat, grupos, notificações, etc.) já são em cascata/SetNull.
  await prisma.$transaction([
    prisma.application.deleteMany({ where: { candidateId: id } }),
    prisma.job.deleteMany({ where: { empresaId: id } }), // cascata apaga as candidaturas dessas vagas
    prisma.product.deleteMany({ where: { sellerId: id } }),
    prisma.reuniao.deleteMany({ where: { organizadorId: id } }), // cascata apaga os participantes
    prisma.user.delete({ where: { id } }),
  ]);
}

export async function alterarStatusUsuario(id: string, suspender: boolean): Promise<void> {
  await prisma.user.update({
    where: { id },
    data: { status: suspender ? 'suspenso' : 'ativo' },
  });
}

/** Status atual de um usuário (para alternar bloquear/reativar no perfil). */
export async function statusDoUsuario(id: string): Promise<string | null> {
  const u = await prisma.user.findUnique({ where: { id }, select: { status: true } });
  return u?.status ?? null;
}

/**
 * Superadmin define uma nova senha para um usuário (sem depender de e-mail).
 * Aplica a política de senha, zera o bloqueio de tentativas e reativa a conta.
 */
export async function definirSenhaUsuario(
  id: string,
  senha: string,
): Promise<{ ok: boolean; erro?: string }> {
  const regra = politicaSenha(senha);
  if (!regra.ok) return { ok: false, erro: regra.erros.join(' ') };
  const senhaHash = await hashSenha(senha);
  const r = await prisma.user.updateMany({
    where: { id },
    data: { senhaHash, status: 'ativo', tentativasLogin: 0, bloqueadoAte: null },
  });
  if (r.count === 0) return { ok: false, erro: 'Usuário não encontrado.' };
  return { ok: true };
}

/**
 * Exclui TODOS os perfis que não são super_admin (e seus dados). Ação em massa
 * irreversível — usada pela limpeza no painel admin. Mantém os superadmins.
 */
export async function excluirPerfisNaoAdmin(): Promise<number> {
  const alvos = await prisma.user.findMany({
    where: { papel: { not: 'super_admin' } },
    select: { id: true },
  });
  for (const u of alvos) {
    await excluirUsuario(u.id);
  }
  return alvos.length;
}
