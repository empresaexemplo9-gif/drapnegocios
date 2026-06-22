-- ViajeBrasil — atendimento geral (chat livre cliente ↔ consultor)
-- Banco: PostgreSQL (Neon). Aplique no SQL Editor após 007.
--
-- Diferente do lead de passagem aérea: aqui o cliente manda QUALQUER dúvida.
-- A DISTRIBUIÇÃO é ISOLADA da fila de leads: usa o contador `carga_geral`
-- (round-robin próprio), separado do `carga` (usado pelos leads aéreos).

begin;

-- Fila própria do atendimento geral.
alter table consultores add column if not exists carga_geral int not null default 0;

create table if not exists atendimentos (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references tenants(id) on delete cascade,
  consultor_id uuid references consultores(id) on delete set null,
  status       text not null default 'novo' check (status in ('novo', 'em_atendimento', 'resolvido')),
  cliente_token text,
  criado_em    timestamptz not null default now()
);
create index if not exists idx_atendimentos_tenant on atendimentos (tenant_id, criado_em desc);
create index if not exists idx_atendimentos_token on atendimentos (cliente_token);

create table if not exists atendimento_mensagens (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references tenants(id) on delete cascade,
  atendimento_id uuid not null references atendimentos(id) on delete cascade,
  autor          text not null check (autor in ('cliente', 'consultor')),
  texto          text not null,
  criado_em      timestamptz not null default now()
);
create index if not exists idx_atendimento_mensagens
  on atendimento_mensagens (tenant_id, atendimento_id, criado_em);

alter table atendimentos enable row level security;
alter table atendimentos force  row level security;
drop policy if exists tenant_isolation_atendimentos on atendimentos;
create policy tenant_isolation_atendimentos on atendimentos
  using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());

alter table atendimento_mensagens enable row level security;
alter table atendimento_mensagens force  row level security;
drop policy if exists tenant_isolation_atendimento_mensagens on atendimento_mensagens;
create policy tenant_isolation_atendimento_mensagens on atendimento_mensagens
  using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());

commit;
