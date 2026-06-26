/**
 * Preparação do banco no build da Vercel — sem terminal local.
 *
 * Comportamento (controlado por variáveis de ambiente):
 *  - Sempre: aplica o schema (prisma db push) se DATABASE_URL existir.
 *  - LIMPAR_DEMO=1 : remove o tenant de demonstração (slug "demo") e tudo dele.
 *  - SEED_DEMO=1   : popula dados de demonstração (idempotente).
 *
 * Em produção, deixe as duas desligadas: o build só mantém o schema em dia e a
 * plataforma fica limpa para cadastros reais. Qualquer falha é apenas registrada
 * (não derruba o build).
 */
import { execSync } from 'node:child_process';

if (!process.env.DATABASE_URL) {
  console.warn('[prepare-db] DATABASE_URL ausente — pulando (configure o Postgres na Vercel).');
  process.exit(0);
}

try {
  console.log('[prepare-db] aplicando schema (prisma db push)…');
  execSync('npx prisma db push --skip-generate --accept-data-loss', { stdio: 'inherit' });
} catch (e) {
  console.warn('[prepare-db] db push falhou (segue o build):', e?.message ?? e);
}

if (process.env.LIMPAR_DEMO === '1') {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const r = await prisma.tenant.deleteMany({ where: { slug: 'demo' } });
    console.log(`[prepare-db] dados de demonstração removidos (tenants apagados: ${r.count}).`);
    await prisma.$disconnect();
  } catch (e) {
    console.warn('[prepare-db] falha ao limpar demo (segue o build):', e?.message ?? e);
  }
}

if (process.env.SEED_DEMO === '1') {
  try {
    console.log('[prepare-db] populando seed de demonstração…');
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
  } catch (e) {
    console.warn('[prepare-db] seed falhou (segue o build):', e?.message ?? e);
  }
}

console.log('[prepare-db] concluído.');
