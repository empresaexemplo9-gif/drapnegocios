-- ViajeBrasil — chat in-app por lead (cliente ↔ consultor)
-- Banco: PostgreSQL (Neon). Aplique no SQL Editor após 006.
--
-- O cliente é ANÔNIMO: ao criar o lead, geramos um `cliente_token` (segredo)
-- que o app guarda e usa para ler/enviar mensagens daquele lead, sem login.
-- O consultor acessa via JWT (precisa ser o dono do lead, ou admin).

begin;

alter table leads_aereo add column if not exists cliente_token text;
create index if not exists idx_leads_cliente_token on leads_aereo (cliente_token);

create table if not exists lead_mensagens (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references tenants(id) on delete cascade,
  lead_id    uuid not null references leads_aereo(id) on delete cascade,
  autor      text not null check (autor in ('cliente', 'consultor')),
  texto      text not null,
  criado_em  timestamptz not null default now()
);
create index if not exists idx_lead_mensagens on lead_mensagens (tenant_id, lead_id, criado_em);

alter table lead_mensagens enable row level security;
alter table lead_mensagens force  row level security;

drop policy if exists tenant_isolation_lead_mensagens on lead_mensagens;
create policy tenant_isolation_lead_mensagens on lead_mensagens
  using (tenant_id = current_tenant_id())
  with check (tenant_id = current_tenant_id());

commit;
