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

// Desliga a telemetria do Prisma (evita chamadas de rede que podem falhar o build).
process.env.CHECKPOINT_DISABLE = '1';
process.env.PRISMA_HIDE_UPDATE_MESSAGE = '1';

// Aceita os vários nomes que a Vercel/Neon pode ter criado (depende do prefixo).
const urlRuntime =
  process.env.DATABASE_URL ||
  process.env.DATABASE_PRISMA_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.STORAGE_PRISMA_URL ||
  process.env.STORAGE_URL;

if (!urlRuntime) {
  console.warn('[prepare-db] Nenhuma URL de banco encontrada — pulando (conecte o Postgres na Vercel).');
  process.exit(0);
}
// Garante que o `prisma db push` (que lê env DATABASE_URL) tenha o valor.
process.env.DATABASE_URL = urlRuntime;

// Para o db push, é PRECISO a conexão DIRETA — o pooler (pgbouncer) recusa DDL,
// e foi por isso que as tabelas não eram criadas. Ordem:
// 1) variável non-pooling explícita; 2) derivar a direta tirando "-pooler" do
// host (padrão Neon); 3) por fim, a própria URL.
const urlDireta =
  process.env.DATABASE_URL_NON_POOLING ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.STORAGE_URL_NON_POOLING ||
  process.env.DATABASE_URL_UNPOOLED ||
  urlRuntime.replace('-pooler', '');

// RESET_DB=1 → recria o schema do zero (--force-reset). Use só num banco sem
// dados reais (corrige schema "pela metade"); depois remova a variável.
const flags = process.env.RESET_DB === '1' ? '--force-reset' : '';

try {
  const host = (urlDireta.match(/@([^/:?]+)/) || [])[1] ?? '(desconhecido)';
  console.log(`[prepare-db] aplicando schema (prisma db push ${flags}) em ${host}…`);
  execSync(`npx prisma db push --skip-generate --accept-data-loss ${flags}`.trim(), {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: urlDireta },
  });
  console.log('[prepare-db] schema aplicado com sucesso (tabelas criadas).');
} catch (e) {
  console.error('[prepare-db] ERRO no db push (tabelas NÃO criadas):', e?.message ?? e);
}

// Recuperação de acesso de emergência (sem depender de e-mail).
// Defina na Vercel: RECUPERAR_ADMIN_EMAIL e RECUPERAR_ADMIN_SENHA, faça um
// redeploy e depois REMOVA as duas variáveis. O build redefine a senha da conta
// canônica (a mais antiga com esse e-mail), garante super_admin/ativo e
// desconflita duplicados renomeando o e-mail deles (não apaga dados).
if (process.env.RECUPERAR_ADMIN_EMAIL && process.env.RECUPERAR_ADMIN_SENHA) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const bcrypt = (await import('bcryptjs')).default;
    const prisma = new PrismaClient();
    const email = process.env.RECUPERAR_ADMIN_EMAIL.trim().toLowerCase();
    const users = await prisma.user.findMany({
      where: { email },
      include: { tenant: { select: { slug: true } } },
      orderBy: { criadoEm: 'asc' },
    });
    if (users.length === 0) {
      console.warn(`[recuperar-admin] nenhum usuário com e-mail ${email}.`);
    } else {
      const canonica = users[0];
      const senhaHash = await bcrypt.hash(process.env.RECUPERAR_ADMIN_SENHA, 12);
      await prisma.user.update({
        where: { id: canonica.id },
        data: {
          senhaHash,
          status: 'ativo',
          papel: 'super_admin',
          tentativasLogin: 0,
          bloqueadoAte: null,
          emailVerificadoEm: new Date(),
        },
      });
      let i = 0;
      for (const u of users.slice(1)) {
        i += 1;
        await prisma.user.update({ where: { id: u.id }, data: { email: `${email}.dup${i}` } });
      }
      console.log(
        `[recuperar-admin] OK: senha redefinida para ${email} (tenant slug="${canonica.tenant.slug}"); ${i} duplicado(s) desconflitado(s).`,
      );
    }
    await prisma.$disconnect();
  } catch (e) {
    console.error('[recuperar-admin] falhou (segue o build):', e?.message ?? e);
  }
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
