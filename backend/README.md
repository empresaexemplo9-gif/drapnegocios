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
    "numeroPassageiros": 2,
    "nomes": ["Maria Silva", "João Silva"],
    "dataIda": "20/07/2026",
    "dataVolta": "27/07/2026",   // null = somente ida
    "classe": "Executiva"
  } }
```

No `tipo: "completo"` a função resolve o tenant pelo slug, faz
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

## Política de distribuição entre consultores

**A definir.** O lead nasce sem `consultor_id`; a regra de qual consultor recebe
(rodízio, por região, disponibilidade…) será implementada depois. A coluna
`status` já acompanha o ciclo (`novo → atribuido → em_atendimento →
convertido/perdido`).
