# Backend — leads, chat in-app, multi-tenant e RLS (na Vercel)

Tudo roda **na própria Vercel**, no mesmo projeto que publica o app web:

- **Vercel Functions** (`api/*`) — leads, chat, auth, admin, ofertas, upload.
- **Postgres (Neon)** — dados com **RLS** por tenant.
- **Vercel Blob** — fotos das ofertas (upload do admin).

> O atendimento é feito por **chat dentro do app** (cliente ↔ consultor). **Não
> há e-mail.** O WhatsApp é exceção: o cliente informa só se quiser, no chat.

## Fluxo do atendimento

1. O cliente toca em **"Passagens Aéreas"** (ou na aba **Atendimento**) e o
   chatbot coleta a viagem (trecho, passageiros, nomes, datas, classe).
2. Ao concluir, `POST /api/leads-aereo` cria o lead, **atribui um consultor por
   round-robin** (o menos carregado) e devolve `{ leadId, clienteToken }`.
3. O app guarda o `clienteToken` (anônimo) e abre o **chat** com o consultor.
4. O consultor vê o lead na **área interna** (`/painel`) e responde pelo chat.
5. (Opcional) o cliente informa o **WhatsApp** — o consultor vê o botão `wa.me`.

## Endpoints (Vercel Functions)

| Endpoint | Método | Quem | O quê |
|---|---|---|---|
| `/api/leads-aereo` | POST | público | cria o lead → `{ leadId, clienteToken }` |
| `/api/chat/[id]` | GET/POST | cliente (`?token=&tenantId=`) ou consultor/admin (JWT) | lista/envia mensagens; `POST {telefone}` informa WhatsApp |
| `/api/leads` | GET | consultor/admin | lista (consultor: os seus; admin: todos) |
| `/api/leads/[id]` | GET/PATCH | consultor/admin | detalhe; muda status / reatribui (admin) |
| `/api/auth/{login,register,me}` | POST/GET | público / Bearer | login, cadastro (cliente), rehidratação |
| `/api/admin/stats` | GET | admin | métricas |
| `/api/admin/ofertas` | GET/POST/PATCH/DELETE | admin | CRUD das ofertas da home |
| `/api/admin/upload` | POST | admin | upload de imagem → Vercel Blob |
| `/api/home/ofertas` | GET | público | ofertas ativas da home |

Helpers compartilhados em `api/_lib/{http,db,auth}.ts`. Toda função protegida
verifica o JWT (`auth.ts`) e seta o tenant via `comTenant` (`db.ts`) — o **RLS
continua valendo**. Nunca se confia em `papel`/`tenant_id` do cliente.

## Migrações (rodar no SQL Editor do Neon, em ordem)

`001_tenant_rls` → `002_rota_aereo` → `003_auth` → `004_home_ofertas`
→ `006_home_secao` → `007_chat`. `005_seed_exemplo.sql` é um **template**
(edite e-mails/senhas) para criar admin e consultores de teste.

## Variáveis de ambiente (server-side, SÓ na Vercel)

| Variável | Para quê |
|---|---|
| `DATABASE_URL` | conexão do Neon (criada pela integração) |
| `JWT_SECRET` | segredo forte para assinar os JWTs |
| `BLOB_READ_WRITE_TOKEN` | upload de fotos (criado ao conectar um Vercel Blob store) |

O app só usa `EXPO_PUBLIC_TENANT_ID` (opcional) e `EXPO_PUBLIC_LEADS_URL`
(apenas builds nativos; na web é mesma origem).

## Isolamento multi-tenant (RLS)

`001_tenant_rls.sql` cria as tabelas, habilita **RLS** e políticas que limitam
cada linha ao tenant corrente (`current_tenant_id()`, que aceita o claim
`tenant_id` do JWT ou `set_config('app.current_tenant', …)`). `FORCE ROW LEVEL
SECURITY` nas tabelas de dados garante o isolamento mesmo para o dono do banco
(a `tenants` fica sem `FORCE`, para resolver `slug → id`).

## Distribuição entre consultores (round-robin)

Em `api/leads-aereo.ts`: ao gravar o lead, escolhe o **consultor ativo menos
carregado** (`order by consultores.carga`), seta `consultor_id`/`status` e
incrementa a `carga` — tudo numa transação RLS. Sem consultor ativo, o lead
nasce `novo`/sem consultor.

## Upload de imagens (Vercel Blob)

`/admin/ofertas` → "Enviar foto" sobe a imagem para o **Vercel Blob**
(`api/admin/upload.ts`, só admin). Habilite criando um **Blob store** na Vercel
(Storage → Blob), que injeta `BLOB_READ_WRITE_TOKEN`. Sem o store, o upload
retorna erro amigável e o campo de **URL** continua funcionando.
