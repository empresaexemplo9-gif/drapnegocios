-- ViajeBrasil — seed de EXEMPLO (admin + consultores) para testar os logins.
-- ⚠️ TROQUE os e-mails e as SENHAS antes de rodar. Não use estas senhas em produção.
-- Usa pgcrypto `crypt(senha, gen_salt('bf', 11))` → hash bcrypt compatível com
-- o `bcryptjs` das Functions. Aplique no SQL Editor após 003/004.

begin;

-- Ativa o tenant corrente (RLS) para todas as escritas abaixo.
-- (id::text — set_config espera texto; uuid puro não casa na assinatura.)
select set_config('app.current_tenant', (select id::text from tenants where slug = 'viajebrasil'), true);

-- ADMIN ---------------------------------------------------------------------
insert into usuarios (tenant_id, email, papel, nome, ativo, password_hash)
values (
  (select id from tenants where slug = 'viajebrasil'),
  'admin@viajebrasil.com',                       -- << troque
  'admin', 'Administrador', true,
  crypt('123456', gen_salt('bf', 11))   -- << troque
)
on conflict (tenant_id, email) do update
  set papel = 'admin', nome = excluded.nome, ativo = true,
      password_hash = excluded.password_hash;

-- CONSULTORES ---------------------------------------------------------------
-- 1) cria/atualiza os usuarios (papel consultor)
insert into usuarios (tenant_id, email, papel, nome, ativo, password_hash)
values
  ((select id from tenants where slug = 'viajebrasil'),
   'consultor1@viajebrasil.com', 'consultor', 'Consultor Um', true,
   crypt('123456', gen_salt('bf', 11))),
  ((select id from tenants where slug = 'viajebrasil'),
   'consultor2@viajebrasil.com', 'consultor', 'Consultor Dois', true,
   crypt('123456', gen_salt('bf', 11)))
on conflict (tenant_id, email) do update
  set papel = 'consultor', nome = excluded.nome, ativo = true,
      password_hash = excluded.password_hash;

-- 2) cria/atualiza os registros de consultores ligados a esses usuarios
insert into consultores (tenant_id, nome, email, ativo, usuario_id)
select u.tenant_id, u.nome, u.email, true, u.id
from usuarios u
where u.tenant_id = (select id from tenants where slug = 'viajebrasil')
  and u.email in ('consultor1@viajebrasil.com', 'consultor2@viajebrasil.com')
on conflict (tenant_id, email) do update
  set usuario_id = excluded.usuario_id, ativo = true, nome = excluded.nome;

commit;
