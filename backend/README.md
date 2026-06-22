# Backend — leads aéreos, multi-tenant e RLS (na Vercel)

O atendimento de Passagens Aéreas roda **na própria Vercel**, no mesmo projeto
que publica o app web:

- **Vercel Function** `api/leads-aereo.ts` — recebe o lead do chatbot.
- **Postgres (Neon)** — guarda o lead, com **RLS** por tenant.
- **Resend** — envia o e-mail ao consultor.

> O app (Expo/React Native) é só o cliente: ele faz `POST /api/leads-aereo` em
> **mesma origem** na web. Sem backend (build nativo sem `EXPO_PUBLIC_LEADS_URL`),
> o app cai no modo `mock` e só registra o lead no console em desenvolvimento.

## Fluxo do atendimento aéreo

1. O cliente toca no card **"Passagens Aéreas"** na home.
2. Abre o **chatbot** (`src/componentes/ChatbotAereo.tsx`), que:
   - avisa o backend que um atendimento **iniciou** (gatilho do botão);
   - coleta **nome(s)**, **nº de passageiros**, **ida**, **volta** (ou somente
     ida) e **classe**;
   - exibe a mensagem de **direcionamento ao consultor**.
3. Ao concluir, o app envia o **lead completo** para `POST /api/leads-aereo`.
4. A função grava em `leads_aereo` (com RLS) e **notifica o consultor por e-mail**.

## Passo a passo de deploy (Vercel)

1. **Banco (Neon):** projeto na Vercel → **Storage → Create Database → Neon**.
   Isso cria `DATABASE_URL`. Aplique `sql/001_tenant_rls.sql` no SQL Editor do
   Neon (cria tabelas + RLS + tenant `viajebrasil`).
2. **E-mail (Resend):** crie a conta, gere uma **API Key** e (em produção)
   verifique um domínio remetente.
3. **Variáveis de ambiente** (Settings → Environment Variables, Production +
   Preview) — todas **server-side** (sem `EXPO_PUBLIC_`):

   | Variável          | Para quê                                              |
   |-------------------|-------------------------------------------------------|
   | `DATABASE_URL`    | conexão do Neon (criada pela integração)              |
   | `RESEND_API_KEY`  | chave da API do Resend                                |
   | `EMAIL_FROM`      | remetente, ex.: `ViajeBrasil <onboarding@resend.dev>` |
   | `CONSULTOR_EMAIL` | destino padrão dos leads                              |
   | `NOTIFY_ON_START` | `false` desliga o e-mail no início do chat (opc.)     |

4. **Redeploy** do projeto. Pronto — `api/leads-aereo.ts` passa a responder em
   `https://<seu-dominio>.vercel.app/api/leads-aereo`.

> Apps **nativos** (iOS/Android) não têm "mesma origem": defina
> `EXPO_PUBLIC_LEADS_URL=https://<seu-dominio>.vercel.app` no build para que o
> app encontre a função.

## Contrato do endpoint

`POST /api/leads-aereo`. Corpo:

```jsonc
// início (gatilho do botão)
{ "tipo": "inicio", "tenantId": "viajebrasil",
  "consultorEmail": "opcional@...", "origem": "app:web",
  "criadoEm": "2026-06-21T12:00:00.000Z" }

// completo (fim do chat)
{ "tipo": "completo", "tenantId": "viajebrasil",
  "origem": "app:web", "criadoEm": "2026-06-21T12:01:00.000Z",
  "lead": {
    "origem": "São Paulo",
    "destino": "Rio de Janeiro",
    "numeroPassageiros": 2,
    "nomes": ["Maria Silva", "João Silva"],
    "dataIda": "20/07/2026",
    "dataVolta": "27/07/2026",   // null = somente ida
    "classe": "Executiva",
    "telefone": "(62) 99999-8888"
  } }
```

> Migração `sql/002_rota_aereo.sql` adiciona `origem_cidade`/`destino_cidade`
> em `leads_aereo` (o trecho da viagem). Rode-a no Neon após a `001`.

No `tipo: "completo"` a função grava `contato_telefone`/`contato_nome` e gera um
link `wa.me` no e-mail, para o consultor abrir a conversa com o cliente no
WhatsApp com uma só clique. A função resolve o tenant pelo slug, faz
`set_config('app.current_tenant', <uuid>, true)` na mesma transação (ativa o
RLS) e insere em `leads_aereo`; depois envia o e-mail via Resend.

## Isolamento multi-tenant (RLS)

`sql/001_tenant_rls.sql` cria `tenants`, `consultores`, `usuarios` e
`leads_aereo`, habilita **RLS** e cria políticas que limitam cada linha ao
tenant corrente (`current_tenant_id()`, que aceita o claim `tenant_id` do **JWT**
ou `set_config('app.current_tenant', …)`). `FORCE ROW LEVEL SECURITY` nas
tabelas de dados garante o isolamento mesmo para o dono do banco (a tabela
`tenants` fica sem `FORCE` de propósito, para a função resolver `slug → id`).

No app, o isolamento começa no cliente: a sessão/token é guardada sob
`@viajebrasil/<tenantId>/token` (`src/servicos/sessao.ts`) e cada login carrega
seu `tenantId` (`src/contextos/AutenticacaoContext.tsx`).

### Aplicar a migração manualmente

```bash
psql "$DATABASE_URL" -f sql/001_tenant_rls.sql
# Neon/Supabase: cole o conteúdo no SQL Editor e rode.
```

## Distribuição entre consultores (round-robin)

Implementada em `api/leads-aereo.ts` → `registrarLead()`: ao gravar o lead,
escolhe o **consultor ativo menos carregado** (`order by consultores.carga`),
seta `consultor_id` + `status='atribuido'` e incrementa a `carga` — tudo numa
única instrução (CTEs) na mesma transação RLS. Sem consultor ativo, o lead
nasce `novo`/sem consultor e o e-mail vai para `CONSULTOR_EMAIL`. O e-mail é
endereçado ao consultor atribuído quando houver.

## Autenticação e papéis (custom, JWT)

Login real por e-mail/senha nas Functions (`api/auth/*`), com **bcrypt**
(`bcryptjs`) e **JWT** (`jsonwebtoken`, HS256, claim `{ sub, tenant_id, papel }`).
`usuarios` é a tabela única de login (papéis `cliente | consultor | admin`);
`consultores` referencia um `usuario` (`usuario_id`) e guarda a `carga` do
round-robin.

| Endpoint | Método | Quem | O quê |
|---|---|---|---|
| `/api/auth/login` | POST | público | e-mail/senha → `{ token, usuario }` |
| `/api/auth/register` | POST | público | auto-cadastro (sempre `cliente`) |
| `/api/auth/me` | GET | Bearer | rehidrata o usuário do token |
| `/api/leads` | GET | consultor/admin | lista (consultor: os seus; admin: todos) |
| `/api/leads/[id]` | GET/PATCH | consultor/admin | detalhe; muda status / reatribui (admin) |
| `/api/admin/stats` | GET | admin | métricas (status, conversão, carga) |
| `/api/admin/ofertas` | GET/POST/PATCH/DELETE | admin | CRUD das ofertas da home |
| `/api/home/ofertas` | GET | público | ofertas ativas da home |

Toda Function protegida verifica o JWT (`api/_lib/auth.ts`) e seta o tenant a
partir do claim (`api/_lib/db.ts → comTenant`) — RLS continua valendo. Nunca se
confia em `papel`/`tenant_id` vindos do cliente.

## Migrações (ordem) e variáveis

Rode no SQL Editor do Neon, em ordem: `001` → `002` → `003_auth` → `004_home_ofertas`.
`005_seed_exemplo.sql` é um **template** (edite e-mails/senhas) para criar um
admin e consultores de teste.

Novo env **server-side**: `JWT_SECRET` (segredo forte para assinar os JWTs).
Os demais (`DATABASE_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `CONSULTOR_EMAIL`,
`NOTIFY_ON_START`) seguem como antes. O app não recebe nenhum desses.

### Aplicar a migração manualmente

```bash
psql "$DATABASE_URL" -f sql/001_tenant_rls.sql
# Neon/Supabase: cole o conteúdo no SQL Editor e rode.
```
