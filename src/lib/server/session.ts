/**
 * Helpers de sessão no servidor: lê o usuário autenticado e aplica RBAC.
 * Usados em route handlers e Server Components.
 */
import { getServerSession, type Session } from 'next-auth';
import { authOptions } from './auth';
import { pode, type Papel, type Permissao } from '../rbac';

export interface ContextoAuth {
  userId: string;
  tenantId: string;
  papel: Papel;
  plano: string;
  nome?: string | null;
  email?: string | null;
}

export async function obterContexto(): Promise<ContextoAuth | null> {
  // Tolerante a má configuração (ex.: NEXTAUTH_SECRET ausente): trata como
  // deslogado em vez de derrubar a renderização das páginas públicas.
  let session: Session | null = null;
  try {
    session = await getServerSession(authOptions);
  } catch (e) {
    console.error('obterContexto: falha ao ler sessão —', (e as Error).message);
    return null;
  }
  if (!session?.user?.tenantId) return null;
  return {
    userId: session.user.id,
    tenantId: session.user.tenantId,
    papel: session.user.papel as Papel,
    plano: session.user.plano,
    nome: session.user.name,
    email: session.user.email,
  };
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Exige autenticação com tenant válido; lança 403 caso contrário. */
export async function exigirAuth(): Promise<ContextoAuth> {
  const ctx = await obterContexto();
  if (!ctx) throw new HttpError(403, 'Acesso negado: sessão sem tenant válido.');
  return ctx;
}

/** Exige uma permissão específica do papel no tenant. */
export async function exigirPermissao(permissao: Permissao): Promise<ContextoAuth> {
  const ctx = await exigirAuth();
  if (!pode(ctx.papel, permissao)) {
    throw new HttpError(403, `Papel "${ctx.papel}" não tem a permissão ${permissao}.`);
  }
  return ctx;
}
