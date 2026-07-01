-- DRAP Business — Row Level Security (multi-tenant).
--
-- Aplique este script UMA vez, DEPOIS de criar o schema (prisma db push /
-- prisma migrate deploy). Ele força o isolamento por tenant no nível do banco:
-- nenhuma query enxerga linhas de outro tenant, mesmo que a aplicação erre.
--
-- A aplicação define o tenant da sessão em cada transação com:
--   SELECT set_config('app.tenant_id', '<uuid>', true);
-- (ver src/lib/server/prisma.ts → withTenant)
--
-- Importante: o papel usado pela aplicação NÃO pode ter BYPASSRLS. Por isso
-- usamos FORCE ROW LEVEL SECURITY, que sujeita até o dono da tabela à política.

-- Necessário para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Lê o tenant corrente da sessão; NULL se não definido.
CREATE OR REPLACE FUNCTION app_current_tenant() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid
$$;

DO $$
DECLARE
  t text;
  tabelas text[] := ARRAY[
    'users', 'profiles', 'jobs', 'applications', 'products',
    'subscriptions', 'audit_logs', 'notifications', 'ai_analysis', 'convites',
    'leads', 'clientes', 'propostas'
  ];
BEGIN
  FOREACH t IN ARRAY tabelas LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', t);

    -- Remove políticas antigas (idempotência ao reaplicar).
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I;', t);

    -- Isolamento: só enxerga/grava linhas do tenant corrente.
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I
         USING (tenant_id = app_current_tenant())
         WITH CHECK (tenant_id = app_current_tenant());', t);
  END LOOP;
END $$;

-- A tabela `tenants` em si: cada sessão só vê o próprio tenant.
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_self ON tenants;
CREATE POLICY tenant_self ON tenants
  USING (id = app_current_tenant())
  WITH CHECK (id = app_current_tenant());

-- accounts / otp_codes são por-usuário (sem tenant_id direto): o isolamento
-- vem por join com users via a aplicação. Mantidos fora do RLS por tenant_id.
