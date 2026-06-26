# 🚀 Publicar a DRAP Business (produção real)

Runbook único para colocar a plataforma **multi-tenant com banco real** online na
Vercel. Tempo estimado: ~15 min. Você faz os passos marcados **[VOCÊ]** (precisam
da sua conta); o código já está pronto.

## Visão geral

A plataforma usa **PostgreSQL (Vercel Postgres) + Prisma + NextAuth**. O build na
Vercel roda `prisma generate` sozinho. As migrations e o seed você roda uma vez.

---

## 1. [VOCÊ] Criar o banco (Vercel Postgres)

1. No projeto da Vercel → aba **Storage** → **Create Database** → **Postgres**.
2. A Vercel cria e injeta automaticamente as variáveis `DATABASE_URL` (pooled),
   `POSTGRES_URL_NON_POOLING` (direta) e afins no projeto.

## 2. [VOCÊ] Definir as variáveis de ambiente

Em **Settings → Environment Variables** (ambiente Production e Preview):

| Variável | Valor | Obrigatória |
| --- | --- | --- |
| `DATABASE_URL` | (já criada pelo passo 1) | ✅ |
| `NEXTAUTH_SECRET` | gere com `openssl rand -base64 32` | ✅ |
| `NEXTAUTH_URL` | a URL pública (ex.: `https://drap.vercel.app`) | ✅ |
| `ANTHROPIC_API_KEY` | sua chave Anthropic (IA real) | opcional |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | login Google | opcional |
| `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` | login LinkedIn | opcional |

> Sem `ANTHROPIC_API_KEY` a classificação usa a heurística (funciona).
> Sem as chaves OAuth, os botões de login social ficam inativos (e-mail+senha funciona).

## 3. Aplicar schema + RLS + seed (uma vez)

No seu computador, apontando para o banco da Vercel (use a string
**não-pooling** para migrations):

```bash
git clone <repo> && cd viajebrasil
git checkout claude/viajebrasil-cleanup-TRyip   # branch da plataforma real
npm install
export DATABASE_URL="<POSTGRES_URL_NON_POOLING da Vercel>"
npm run db:setup    # prisma db push + RLS (prisma/rls.sql) + seed
```

Se não tiver `psql` para o RLS, abra `prisma/rls.sql` e cole no **SQL Editor** da
Vercel (Storage → seu banco → Query).

## 4. [VOCÊ] Configurar o deploy

- **Production Branch**: em Settings → Git, aponte para
  `claude/viajebrasil-cleanup-TRyip` (esta é a plataforma real com banco).
- **Framework Preset**: Next.js (detecta sozinho). Build/Output: padrão.
- Clique em **Deploy** (ou faça um push para disparar).

## 5. OAuth (quando quiser ligar login social)

Callbacks a cadastrar no provedor:
- Google: `https://SEU_DOMINIO/api/auth/callback/google`
- LinkedIn: `https://SEU_DOMINIO/api/auth/callback/linkedin`

---

## ✅ Conta de teste (vem do seed)

- Empresa (slug): **demo**
- Admin: `admin@demo.drap` · Recrutador: `recruiter@demo.drap` ·
  Vendedora: `seller@demo.drap` · Candidata: `candidata@demo.drap`
- Senha de todas: **Drap@2026**

## Fluxos prontos para uso

- **Cadastro de novo negócio** (cria tenant + super_admin) e **login** (e-mail+senha, OAuth).
- **Perfil** do usuário/empresa no painel.
- **Planos**: assinar Prime (trial de 7 dias) → vira `subscription` real.
- **Painel Prime**: ranking de currículos pela IA, score médio, métricas e ROI.
- **Admin de preços** (gate por papel admin).
- **Isolamento multi-tenant** garantido por RLS no banco.

## O que é v1 vs próximo

- **Real e por-tenant:** auth, tenants, perfis, assinaturas, vagas/candidaturas
  (API), análises de IA, auditoria, RBAC, RLS.
- **Ainda com dados de vitrine (showcase) demonstrativos:** páginas públicas
  `/vagas`, `/vitrine`, `/perfil`, `/feed` (catálogo de exemplo). Próximo passo:
  ligá-las às tabelas `jobs`/`products`/`profiles` do tenant + telas de criar
  vaga/produto e candidatar-se.
- **Fase seguinte:** gateway de pagamento (cobrança recorrente real), OAuth social
  ativo, CRM, propostas em PDF.

## Se o build falhar

O único risco que não consegui validar aqui é tipo do Prisma (o engine não baixa
neste ambiente). Se o deploy acusar erro, me mande o log do build da Vercel que eu
corrijo na hora.
