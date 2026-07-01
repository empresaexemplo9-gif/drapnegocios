# Aplicar Row Level Security (RLS) no Neon — passo a passo seguro

Este guia liga a **2ª camada de isolamento por tenant** no banco (Postgres/Neon).
Hoje o isolamento é garantido pela aplicação (`where: { tenantId }` em todo lugar).
O RLS adiciona uma rede de proteção no próprio banco: mesmo que a aplicação erre,
nenhuma query enxerga linhas de outro tenant.

> ⚠️ Faça **uma vez**, com calma. O build **não** aplica isso sozinho (de
> propósito). O script é **idempotente** — pode reaplicar sem duplicar nada.

---

## Como funciona (contexto)

- A aplicação já fixa o tenant da sessão em cada transação:
  `SELECT set_config('app.tenant_id', '<uuid>', true)` (ver `src/lib/server/prisma.ts` → `withTenant`).
- O script `prisma/rls.sql` cria a função `app_current_tenant()` e, para cada
  tabela com `tenant_id`, liga `ENABLE` + **`FORCE ROW LEVEL SECURITY`** e a
  política `tenant_isolation` (`tenant_id = app_current_tenant()`).
- **`FORCE`** sujeita **até o dono da tabela** à política. Por isso, no SQL
  Editor (sem `app.tenant_id` setado), as tabelas parecem **vazias** — isso é o
  esperado e confirma que o RLS está ativo. Não é erro nem lockout: dá para
  inspecionar com `SET row_security = off` (ver abaixo).

---

## Pré-requisitos

1. O papel que a aplicação usa para conectar **não pode ter `BYPASSRLS`**
   (o Neon `neondb_owner` padrão não tem — ok).
2. Confirme que a `DATABASE_URL` de produção é a do Neon e que a app está
   funcionando normalmente antes de começar.

---

## Passo a passo

### 1. Abrir o SQL Editor do Neon
Vercel → projeto → **Storage** → seu Postgres → **Open in Neon** → **SQL Editor**.
(Ou entre em `console.neon.tech`.)

### 2. (Recomendado) Testar num branch primeiro
No Neon, crie um **Branch** do banco de produção (cópia instantânea). Rode os
passos 3–4 **no branch**; se algo travar, é descartável. Só depois aplique no
branch principal (produção).

### 3. Rodar o script idempotente
Abra `prisma/rls.sql` deste repositório, **cole todo o conteúdo** no SQL Editor e
execute. Ele cobre: `users, profiles, jobs, applications, products,
subscriptions, audit_logs, notifications, ai_analysis, convites, leads,
clientes, propostas`.

### 4. Validar que ligou (sem se trancar fora)

**a) RLS está ativo?** No editor (sem `app.tenant_id`), estas devem voltar **0**:
```sql
SELECT count(*) FROM users;
SELECT count(*) FROM leads;
```
Se voltar 0, o `FORCE RLS` está valendo. ✅

**b) Os dados continuam lá?** Ainda no editor, inspecione **ignorando o RLS**
(o dono pode):
```sql
SET row_security = off;
SELECT count(*) FROM users;     -- agora mostra o total real
SET row_security = on;
```

**c) A aplicação enxerga normal?** Abra a plataforma **logado** e confira o
feed, perfis, CRM, etc.
- Tudo aparece normalmente → o `withTenant` está setando o tenant e o RLS **não
  travou**. 🎉
- Tudo aparece **vazio** em toda a app → alguma leitura não passa pelo
  `withTenant`. **Faça o rollback** (abaixo), corrija o caminho e reaplique.

---

## Rollback (destravar na hora)

Se precisar desligar o RLS rapidamente, cole e execute:

```sql
DO $$
DECLARE t text;
  tabelas text[] := ARRAY[
    'users','profiles','jobs','applications','products','subscriptions',
    'audit_logs','notifications','ai_analysis','convites','leads','clientes','propostas'
  ];
BEGIN
  FOREACH t IN ARRAY tabelas LOOP
    EXECUTE format('ALTER TABLE %I NO FORCE ROW LEVEL SECURITY;', t);
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I;', t);
  END LOOP;
END $$;
```

Isso volta ao estado anterior (só a proteção da aplicação). Reaplicar o
`prisma/rls.sql` é sempre seguro (idempotente).

---

## Observações

- **Migrations**: ao rodar `prisma db push`/`migrate` no futuro, novas tabelas
  **não** recebem RLS automaticamente — reaplique o `prisma/rls.sql` (idempotente)
  depois de mudanças de schema, e inclua toda tabela nova com `tenant_id` no array.
- **Automatizar no build**: dá para chamar o `rls.sql` no `scripts/prepare-db.mjs`,
  mas só recomendo **depois** de validar manualmente conforme acima — assim você
  não corre o risco de um deploy trancar a leitura.
