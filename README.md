# DRAP Business

Hub digital de negócios e conexões que une **marketing automatizado, banco de vagas,
vitrine de serviços e captação de clientes** — tudo em um perfil único.

Site **web, mobile-first** (abre e instala como app no Android e no iPhone via "Adicionar à
tela inicial").

## Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + TypeScript
- **Backend (fase 2):** Node.js + Prisma + PostgreSQL
- **Auth (fase 2):** NextAuth com OAuth (Instagram, LinkedIn, WhatsApp, TikTok)
- **IA (fase 2):** API da Anthropic (geração de conteúdo e score de perfil)
- **Mídia/Docs (fase 2):** AWS S3 · Propostas em PDF (React PDF)

## MVP (já implementado)

Navegável com dados de demonstração (sem precisar de banco):

- **Autenticação** (`/entrar`) — cadastro e login com senha protegida (hash + salt),
  sessão por cookie assinado; área protegida **`/painel`** para completar o perfil.
- **Perfil Unificado** (`/perfil`) — pessoa, empresa, autônomo ou produto, com score.
- **Banco de Vagas e Talentos** (`/vagas`) — vagas CLT/PJ/freela com **match básico** por
  habilidade, área e região (`src/lib/match.ts`).
- **Vitrine e Marketplace** (`/vitrine`) — serviços/produtos com preço, prazo e região.
- **Rede de Captação** (`/feed`) — feed de quem busca, oferece e está disponível.

## Fase 2 (próxima)

Marketing automatizado · Integração com redes sociais (OAuth) · CRM nativo ·
Central de propostas (PDF) · Grupos e comunidades · IA e score de perfil ·
Motor de engajamento (gamificação).

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
npm run type-check
```

## Banco de dados (quando ligar a fase 2)

1. Defina `DATABASE_URL` no `.env` (ver `.env.example`).
2. `npx prisma migrate dev` (cria as tabelas a partir de `prisma/schema.prisma`).
3. Troque as funções de `src/lib/dados.ts` por consultas via Prisma (as telas não mudam).

## Identidade

DRAP Business — tom profissional e acessível, foco no mercado brasileiro.
Paleta sóbria com destaque em **azul/roxo escuro** (`marca-600 #4F46E5`). Interface limpa,
mobile-first.
