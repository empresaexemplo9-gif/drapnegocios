# Backend Supabase — ViajeBrasil

Passo a passo para ligar o backend real (login de admin, preços e parceiros
compartilhados). Enquanto as variáveis não estiverem definidas, o app continua
no modo **mock** (dados locais) — nada quebra.

## 1. Criar o projeto

1. Acesse https://supabase.com → **New project**.
2. Defina um nome (ex.: `viajebrasil`) e uma senha de banco.
3. Aguarde o provisionamento.

## 2. Criar as tabelas

1. No projeto, vá em **SQL Editor → New query**.
2. Cole o conteúdo de [`migrations/0001_inicial.sql`](./migrations/0001_inicial.sql)
   e clique em **Run**.
   - Cria as tabelas `perfis`, `parceiros`, `precos`, as policies de RLS, o
     gatilho que cria o perfil de cada usuário e popula os parceiros iniciais.

## 3. Criar o usuário administrador

1. Vá em **Authentication → Users → Add user** (e-mail + senha).
2. Copie o **User UID** criado.
3. No **SQL Editor**, promova-o a admin:
   ```sql
   update public.perfis set papel = 'admin' where id = 'COLE_O_UID_AQUI';
   ```

## 4. Pegar as chaves

Em **Project Settings → API**, copie:
- **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
- **anon public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 5. Configurar no app

### Vercel (produção)
**Settings → Environment Variables** do projeto `viajebrasil`, adicione:

| Nome | Valor |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | a Project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | a anon key |

Depois **Redeploy**.

### Local
Crie um `.env` na raiz do projeto (veja `.env.example`) com as duas variáveis.

## Pronto

Com as variáveis definidas, o app passa a:
- **Login real** (Supabase Auth) — admin entra com o usuário criado no passo 3.
- **Preços e parceiros compartilhados** entre todos os dispositivos, com escrita
  liberada apenas para administradores (RLS).

> O catálogo (voos, hotéis, pacotes, etc.) continua vindo do app; o backend
> guarda os **overrides de preço** e os **parceiros**. Reservas e pagamento são
> os próximos passos (tabelas e gateway).
