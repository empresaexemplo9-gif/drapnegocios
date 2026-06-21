# Backend — leads aéreos, multi-tenant e RLS

Este diretório documenta o **contrato de backend** usado pelo chatbot de
Passagens Aéreas do app e entrega as **migrações SQL** que garantem o
isolamento por tenant via **RLS (Row Level Security)** no PostgreSQL/Supabase.

> O app é um cliente Expo/React Native: ele **não** tem banco embutido nem
> envia e-mail por conta própria. Quem **persiste o lead**, aplica o RLS e
> **dispara o e-mail ao consultor** é o backend descrito aqui. Sem backend
> (modo `mock`), o app apenas registra o lead no console em desenvolvimento.

## Fluxo do atendimento aéreo

1. O cliente toca no card **"Passagens Aéreas"** na home.
2. Abre o **chatbot** dentro do app (`src/componentes/ChatbotAereo.tsx`), que:
   - avisa o backend que um atendimento **iniciou** (gatilho do botão);
   - coleta **nome(s)**, **nº de passageiros**, **data de ida**, **data de
     volta** (ou somente ida) e **preferência de classe**;
   - exibe a mensagem de **direcionamento ao consultor**.
3. Ao concluir, o app envia o **lead completo** para o backend
   (`POST {EXPO_PUBLIC_API_URL}/leads-aereo.php`).
4. O backend grava em `leads_aereo` e **notifica um consultor por e-mail**.

## Endpoint esperado pelo app

`POST {EXPO_PUBLIC_API_URL}/leads-aereo.php` (mapeado em
`src/servicos/endpoints.ts` → `leads.aereo`). Corpo:

```jsonc
// evento de início (gatilho do botão)
{ "tipo": "inicio", "tenantId": "viajebrasil",
  "consultorEmail": "opcional@...", "origem": "app:android",
  "criadoEm": "2026-06-21T12:00:00.000Z" }

// lead completo (fim da conversa)
{ "tipo": "completo", "tenantId": "viajebrasil",
  "consultorEmail": "opcional@...", "origem": "app:ios",
  "criadoEm": "2026-06-21T12:01:00.000Z",
  "lead": {
    "numeroPassageiros": 2,
    "nomes": ["Maria Silva", "João Silva"],
    "dataIda": "20/07/2026",
    "dataVolta": "27/07/2026",   // null = somente ida
    "classe": "Executiva"
  } }
```

Responsabilidades do backend ao receber `tipo: "completo"`:

1. Resolver o tenant pelo `tenantId` (slug) → `tenants.id`.
2. `SET LOCAL app.current_tenant = '<uuid>'` na transação (ativa o RLS).
3. `INSERT` em `leads_aereo` (o `tenant_id` precisa bater com o tenant corrente,
   senão o `WITH CHECK` da política bloqueia).
4. O trigger emite `NOTIFY lead_aereo_novo`; um worker/edge function escuta e
   **envia o e-mail** ao consultor (SMTP/credenciais ficam só no servidor).

## Isolamento multi-tenant (RLS)

`sql/001_tenant_rls.sql` cria `tenants`, `consultores`, `usuarios` e
`leads_aereo`, habilita **RLS** e cria políticas que limitam cada linha ao
tenant corrente (`current_tenant_id()`), que aceita tanto o claim `tenant_id`
do **JWT (Supabase)** quanto `SET LOCAL app.current_tenant` (backend próprio).
`FORCE ROW LEVEL SECURITY` garante o isolamento mesmo para o dono da tabela.

No app, o isolamento começa no cliente: a sessão/token é guardada sob a chave
`@viajebrasil/<tenantId>/token` (ver `src/servicos/sessao.ts`) e cada login
carrega seu `tenantId` (`src/contextos/AutenticacaoContext.tsx`).

### Aplicar a migração

```bash
psql "$DATABASE_URL" -f sql/001_tenant_rls.sql
# Supabase: cole o conteúdo no SQL Editor ou use `supabase db push`.
```

## Política de distribuição entre consultores

**A definir.** O lead nasce sem `consultor_id`; a regra de qual consultor
recebe (rodízio, por região, por disponibilidade, etc.) será implementada
depois no worker que escuta `lead_aereo_novo`. A coluna `status` já acompanha
o ciclo (`novo → atribuido → em_atendimento → convertido/perdido`).

## Variáveis de ambiente (app)

| Variável                      | Para quê                                           |
|-------------------------------|----------------------------------------------------|
| `EXPO_PUBLIC_API_URL`         | Liga o modo `api`; base onde fica `leads-aereo.php` |
| `EXPO_PUBLIC_TENANT_ID`       | Tenant deste build (padrão `viajebrasil`)          |
| `EXPO_PUBLIC_CONSULTOR_EMAIL` | E-mail sugerido do consultor (destino do lead)     |
