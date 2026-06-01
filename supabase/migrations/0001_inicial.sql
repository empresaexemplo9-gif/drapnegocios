-- ViajeBrasil — esquema inicial (Supabase / Postgres)
-- Execute no SQL Editor do projeto Supabase.

-- =========================================================
-- Perfis (papel de usuário) ligados ao auth.users
-- =========================================================
create table if not exists public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  papel text not null default 'cliente' check (papel in ('admin', 'cliente')),
  criado_em timestamptz not null default now()
);

alter table public.perfis enable row level security;

-- O usuário atual é administrador? (SECURITY DEFINER evita recursão de RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfis where id = auth.uid() and papel = 'admin'
  );
$$;

-- Cria o perfil automaticamente ao registrar um usuário
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id, nome)
  values (new.id, new.raw_user_meta_data ->> 'nome');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop policy if exists "perfis_ver_proprio" on public.perfis;
create policy "perfis_ver_proprio" on public.perfis
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "perfis_atualizar_proprio" on public.perfis;
create policy "perfis_atualizar_proprio" on public.perfis
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- =========================================================
-- Parceiros (empresas)
-- =========================================================
create table if not exists public.parceiros (
  id text primary key,
  nome text not null,
  categoria text not null,
  contato text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

alter table public.parceiros enable row level security;

drop policy if exists "parceiros_leitura" on public.parceiros;
create policy "parceiros_leitura" on public.parceiros for select using (true);

drop policy if exists "parceiros_admin" on public.parceiros;
create policy "parceiros_admin" on public.parceiros
  for all using (public.is_admin()) with check (public.is_admin());

-- =========================================================
-- Preços (overrides por produto)
-- =========================================================
create table if not exists public.precos (
  produto_id text primary key,
  preco numeric(10, 2) not null check (preco >= 0),
  atualizado_em timestamptz not null default now()
);

alter table public.precos enable row level security;

drop policy if exists "precos_leitura" on public.precos;
create policy "precos_leitura" on public.precos for select using (true);

drop policy if exists "precos_admin" on public.precos;
create policy "precos_admin" on public.precos
  for all using (public.is_admin()) with check (public.is_admin());

-- =========================================================
-- Seed de parceiros (idempotente)
-- =========================================================
insert into public.parceiros (id, nome, categoria, ativo) values
  ('pc-latam', 'LATAM', 'aereo', true),
  ('pc-gol', 'GOL', 'aereo', true),
  ('pc-azul', 'Azul', 'aereo', true),
  ('pc-tap', 'TAP', 'aereo', true),
  ('pc-cometa', 'Viação Cometa', 'onibus', true),
  ('pc-itapemirim', 'Itapemirim', 'onibus', true),
  ('pc-1001', 'Auto Viação 1001', 'onibus', true),
  ('pc-gontijo', 'Gontijo', 'onibus', true),
  ('pc-util', 'Util', 'onibus', true),
  ('pc-catarinense', 'Catarinense', 'onibus', true),
  ('pc-localiza', 'Localiza', 'locacao', true),
  ('pc-movida', 'Movida', 'locacao', true),
  ('pc-unidas', 'Unidas', 'locacao', true),
  ('pc-rede-hoteis', 'Rede de Hotéis Parceiros', 'hospedagem', true),
  ('pc-seguros', 'Assistência ViajeBrasil Seguros', 'seguro', true),
  ('pc-operadora', 'Operadora ViajeBrasil Turismo', 'turismo', true)
on conflict (id) do nothing;
