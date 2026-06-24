# DRAP Business — Fundação Multi-Tenant (back-end)

Este documento descreve como **ativar** a fundação multi-tenant (banco +
autenticação + RBAC) que vive na branch `claude/viajebrasil-cleanup-TRyip`.

> **Por que numa branch separada?** A `main` mantém a demo navegável no ar.
> Esta fundação depende de serviços externos (PostgreSQL, OAuth) e **não builda
> sem eles** instalados/configurados — por isso fica isolada até você provisionar
> e validar num deploy de preview.

## O que já está implementado

| Área | Arquivo(s) |
| --- | --- |
| Schema multi-tenant (12 tabelas + enums) | `prisma/schema.prisma` |
| Row Level Security (isolamento no banco) | `prisma/rls.sql` |
| Seed (tenant demo, usuários, vagas, produtos, IA) | `prisma/seed.ts` |
| Cliente Prisma + contexto de tenant (`withTenant`) | `src/lib/server/prisma.ts` |
| NextAuth (Credentials + Google + LinkedIn, JWT) | `src/lib/server/auth.ts` |
| Tipos da sessão (tenantId/papel/plano) | `src/types/next-auth.d.ts` |
| RBAC (7 papéis × permissões) | `src/lib/rbac.ts` |
| Política de senha + hashing (bcrypt) | `src/lib/server/password.ts` |
| Validação (zod) | `src/lib/validation.ts` |
| Rate limiting + bloqueio de login | `src/lib/server/rate-limit.ts` |
| Trilha de auditoria (retenção 90 dias) | `src/lib/server/audit.ts` |
| OTP por e-mail | `src/lib/server/otp.ts` |
| Slug único de tenant | `src/lib/server/tenant.ts` |
| Cadastro (novo tenant ou via convite) | `src/app/api/auth/register/route.ts` |
| OTP (solicitar/verificar) | `src/app/api/auth/otp/route.ts` |
| Exemplo de API com RBAC + RLS | `src/app/api/jobs/route.ts` |
| Middleware global (403 sem tenant) | `src/middleware.ts` |

## Passo a passo (Vercel Postgres)

1. **Crie o banco**: no projeto da Vercel → aba **Storage** → **Create Database**
   → **Postgres**. A Vercel injeta `DATABASE_URL` (pooled) e
   `POSTGRES_URL_NON_POOLING` (direta) automaticamente.

2. **Variáveis** (Settings → Environment Variables) — mínimas para subir:
   - `DATABASE_URL` (já vem do passo 1)
   - `NEXTAUTH_SECRET` = `openssl rand -base64 32`
   - `NEXTAUTH_URL` = a URL pública do deploy
   - (opcionais agora) `GOOGLE_CLIENT_ID/SECRET`, `LINKEDIN_CLIENT_ID/SECRET`,
     `ANTHROPIC_API_KEY`, chaves do gateway de pagamento.
   > O login Google/LinkedIn só é ativado se as respectivas variáveis existirem.

3. **Aplique o schema + RLS + seed** (localmente, apontando para o banco da
   Vercel com a string **non-pooling**):
   ```bash
   export DATABASE_URL="<POSTGRES_URL_NON_POOLING>"
   npm install
   npm run db:setup     # prisma db push + rls.sql + seed
   ```
   `db:rls` usa `psql`; se não tiver, rode o conteúdo de `prisma/rls.sql` no SQL
   editor da Vercel.

4. **OAuth callbacks** (quando for ligar login social):
   - Google: `https://SEU_DOMINIO/api/auth/callback/google`
   - LinkedIn: `https://SEU_DOMINIO/api/auth/callback/linkedin`

5. **Deploy**: faça um deploy de preview a partir da branch
   `claude/viajebrasil-cleanup-TRyip`. O `postinstall` roda `prisma generate`
   antes do `next build`.

## Conta de teste do seed

- Tenant (slug): **demo**
- Admin: `admin@demo.drap` · Recrutador: `recruiter@demo.drap` ·
  Vendedora: `seller@demo.drap` · Candidata: `candidata@demo.drap`
- Senha de todos: **Drap@2026**

## Como o isolamento funciona

Cada request autenticado carrega `tenantId` no JWT. As queries de domínio passam
por `withTenant(tenantId, db => ...)`, que fixa `app.tenant_id` na transação. As
políticas de RLS (`prisma/rls.sql`) usam esse valor para filtrar **toda** leitura
e escrita — então, mesmo que uma query esqueça o filtro, o banco não devolve
linhas de outro tenant. O middleware rejeita com **403** qualquer request às APIs
de domínio sem `tenantId` válido.

## Próximos passos (após validar)

- Migrar as páginas da demo (`/painel`, `/painel/prime`, `/planos`) do mock em
  memória para o NextAuth + Prisma (a camada de dados já está pronta).
- Refresh token rotativo completo para OAuth e gateway de pagamento real.
- Unir o `Plano` do banco (`free/prime_basico/prime_pro/prime_elite`) ao
  `src/lib/planos.ts` da UI.
