-- ViajeBrasil — modelo multi-tenant com RLS (Row Level Security)
-- Banco: PostgreSQL (compatível com Supabase).
--
-- Objetivo: isolar todos os dados por TENANT (locatário/empresa) de modo que
-- nenhum login de um tenant enxergue dados de outro. O isolamento é garantido
-- pelo PRÓPRIO banco via RLS — não depende de a aplicação "lembrar" de filtrar
-- por tenant em cada consulta.
--
-- Como o tenant corrente é determinado (a função `current_tenant_id()` cobre
-- os dois cenários):
--   * Supabase/Auth: claim `tenant_id` no JWT
--       -> current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id'
--   * Backend próprio (apibuson/): definido por sessão/transação
--       -> SET LOCAL app.current_tenant = '<uuid-do-tenant>';
--
-- O app envia o `tenantId` (texto, ex.: 'viajebrasil') no payload do lead; o
-- backend resolve o tenant correspondente e aplica `SET LOCAL` antes de gravar.

begin;

create extension if not exists pgcrypto;

-- ── Tabelas ────────────────────────────────────────────────────────────────

-- Tenants (empresas/locatários).
create table if not exists tenants (
  id        uuid primary key default gen_random_uuid(),
  slug      text not null unique,            -- ex.: 'viajebrasil'
  nome      text not null,
  criado_em timestamptz not null default now()
);

-- Consultores (atendentes), sempre vinculados a um tenant.
create table if not exists consultores (
  id        uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  nome      text not null,
  email     text not null,
  ativo     boolean not null default true,
  criado_em timestamptz not null default now(),
  unique (tenant_id, email)
);

-- Usuários do app — login isolado por tenant. O MESMO e-mail pode existir em
-- tenants diferentes sem colidir (unicidade é por (tenant_id, email)).
create table if not exists usuarios (
  id        uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  email     text not null,
  papel     text not null default 'cliente'
              check (papel in ('cliente', 'admin', 'consultor')),
  criado_em timestamptz not null default now(),
  unique (tenant_id, email)
);

-- Leads de passagens aéreas (gerados pelo chatbot do app).
create table if not exists leads_aereo (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references tenants(id) on delete cascade,
  numero_passageiros int  not null check (numero_passageiros between 1 and 9),
  nomes              text[] not null default '{}',
  data_ida           text not null,
  data_volta         text,                   -- null = somente ida
  classe             text not null,
  contato_nome       text,
  contato_email      text,
  contato_telefone   text,
  origem             text,
  status             text not null default 'novo'
                       check (status in ('novo','atribuido','em_atendimento','convertido','perdido')),
  -- Política de DISTRIBUIÇÃO entre consultores: DEFINIDA POSTERIORMENTE.
  -- Por ora o lead nasce sem consultor; a atribuição virá de uma regra/job.
  consultor_id       uuid references consultores(id) on delete set null,
  criado_em          timestamptz not null default now()
);
create index if not exists idx_leads_aereo_tenant
  on leads_aereo (tenant_id, criado_em desc);

-- ── Resolução do tenant corrente ────────────────────────────────────────────

create or replace function current_tenant_id() returns uuid
language sql stable as $$
  select coalesce(
    nullif(current_setting('app.current_tenant', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'tenant_id')
  )::uuid
$$;

-- ── RLS ─────────────────────────────────────────────────────────────────────

alter table tenants     enable row level security;
alter table consultores enable row level security;
alter table usuarios    enable row level security;
alter table leads_aereo enable row level security;

-- Defesa em profundidade: RLS vale inclusive para o dono das tabelas.
alter table consultores force row level security;
alter table usuarios    force row level security;
alter table leads_aereo force row level security;

-- Cada tenant só enxerga/grava as próprias linhas.
drop policy if exists tenant_isolation_consultores on consultores;
create policy tenant_isolation_consultores on consultores
  using (tenant_id = current_tenant_id())
  with check (tenant_id = current_tenant_id());

drop policy if exists tenant_isolation_usuarios on usuarios;
create policy tenant_isolation_usuarios on usuarios
  using (tenant_id = current_tenant_id())
  with check (tenant_id = current_tenant_id());

drop policy if exists tenant_isolation_leads on leads_aereo;
create policy tenant_isolation_leads on leads_aereo
  using (tenant_id = current_tenant_id())
  with check (tenant_id = current_tenant_id());

-- tenants: cada um só enxerga a si mesmo.
drop policy if exists tenant_self on tenants;
create policy tenant_self on tenants
  using (id = current_tenant_id());

-- ── Notificação de novo lead (consultor) ────────────────────────────────────
-- Emite um NOTIFY a cada novo lead. Um worker/edge function escuta o canal
-- `lead_aereo_novo` e dispara o e-mail ao consultor (SMTP/credenciais ficam no
-- backend). A escolha de QUAL consultor recebe será a política de distribuição.
create or replace function notificar_novo_lead_aereo() returns trigger
language plpgsql as $$
begin
  perform pg_notify(
    'lead_aereo_novo',
    json_build_object(
      'id', new.id,
      'tenant_id', new.tenant_id,
      'numero_passageiros', new.numero_passageiros,
      'classe', new.classe,
      'criado_em', new.criado_em
    )::text
  );
  return new;
end;
$$;

drop trigger if exists trg_lead_aereo_novo on leads_aereo;
create trigger trg_lead_aereo_novo
  after insert on leads_aereo
  for each row execute function notificar_novo_lead_aereo();

-- ── Seed mínimo ─────────────────────────────────────────────────────────────
insert into tenants (slug, nome) values ('viajebrasil', 'VIAJE BRASIL LTDA')
  on conflict (slug) do nothing;

commit;
