/**
 * Cliente Prisma (singleton) + execução com contexto de tenant para RLS.
 *
 * `withTenant(tenantId, fn)` abre uma transação, fixa `app.tenant_id` com
 * set_config(..., true) (escopo da transação) e roda as queries dentro dela.
 * Assim as políticas de Row Level Security (prisma/rls.sql) garantem que
 * nenhuma linha de outro tenant seja lida ou gravada — reforço no banco, não
 * só na aplicação.
 */
import { PrismaClient, type Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { __drapPrisma?: PrismaClient };

// Resolve a URL do banco aceitando os vários nomes que a Vercel/Neon criam
// conforme o prefixo escolhido (DATABASE_URL, POSTGRES_URL, STORAGE_URL…).
// Sem nenhuma, usa um placeholder só pra inicialização não quebrar no load.
function resolverUrlBanco(): string {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_PRISMA_URL ||
    process.env.STORAGE_PRISMA_URL ||
    process.env.STORAGE_URL ||
    'postgresql://placeholder:placeholder@localhost:5432/placeholder'
  );
}
const databaseUrl = resolverUrlBanco();

export const prisma =
  globalForPrisma.__drapPrisma ??
  new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.__drapPrisma = prisma;

/** Client transacional já com o tenant fixado (sujeito ao RLS). */
export type TenantDb = Prisma.TransactionClient;

export async function withTenant<T>(
  tenantId: string,
  fn: (db: TenantDb) => Promise<T>,
): Promise<T> {
  if (!isUuid(tenantId)) throw new Error('tenantId inválido');
  return prisma.$transaction(async (tx) => {
    // set_config com is_local=true → válido apenas nesta transação.
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
    return fn(tx);
  });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(v: unknown): v is string {
  return typeof v === 'string' && UUID_RE.test(v);
}
