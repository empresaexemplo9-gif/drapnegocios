# Integração com a API (Buson / backend do site)

O app já está preparado para falar com o backend. Hoje roda em **modo `mock`**
(dados locais) e, no checkout, **encaminha o cliente ao site oficial**. Quando a
API da Buson for liberada e o programador expuser os endpoints para o app, ligar
o **modo `api`** é uma troca mínima.

## Como o app escolhe a fonte de dados

`src/servicos/config.ts` decide automaticamente:

1. `api` — se `EXPO_PUBLIC_API_URL` estiver definido.
2. `mock` — padrão (sem backend).

Para ligar o backend do site, basta definir a **base** da API (pasta
`apibuson/`), sem barra no fim:

```
EXPO_PUBLIC_API_URL=https://www.viajebrasilpassagens.com.br/apibuson
```

> Confirmar o domínio/caminho exato com o programador. Os caminhos `.php` já
> estão preenchidos em `src/servicos/endpoints.ts`.

## Só uma API: a do site (não a da Buson)

O app fala **apenas com a API do site oficial** (`apibuson/`). A **API da
Buson não entra no app**: a chave secreta e a comunicação com a Buson ficam no
backend do site, que expõe ao app só os endpoints por token. Ou seja, para
integrar o app você precisa **somente** da API do site — a da Buson é
consumida server-side pelo próprio site.

## Passos para ligar o modo `api`

1. **Apontar a URL**: definir `EXPO_PUBLIC_API_URL` com a base do `apibuson/`.
2. **Conferir os caminhos**: já mapeados em `src/servicos/endpoints.ts` (ponto
   único de troca) — ajustar só se o programador renomear algo.
3. **Normalizar formatos** (se preciso): se a resposta do backend tiver forma
   diferente dos tipos do app (`src/tipos`), mapear `raw -> tipo` dentro do
   serviço correspondente (`viagens.ts` / `pedidos.ts`).
4. Pronto. As telas não mudam.

> Catálogo da home (ofertas/destinos/pacotes) **não** existe no `apibuson/`:
> esses serviços seguem em mock mesmo no modo `api` (marcados como `null` em
> `endpoints.ts`) até o site expor uma API de catálogo.

## Autenticação (JWT)

- O login (`autenticar`) já **guarda o token** em `src/servicos/sessao.ts`.
- O cliente HTTP (`cliente.ts`) **anexa** `Authorization: Bearer <token>`
  automaticamente em todas as requisições.
- O token é **persistido** (AsyncStorage), reidratado no início do app e
  **limpo no logout**.

## Endpoints reais (apibuson/) — confirmar formato com o programador

Caminhos relativos à base `EXPO_PUBLIC_API_URL` (ex.: `.../apibuson/auth.php`):

| Método | Endpoint (`apibuson/`)                          | Resposta                  |
|--------|-------------------------------------------------|---------------------------|
| POST   | `auth.php` `{ email, senha }`                    | `{ token, usuario }`      |
| POST   | `refresh-token.php` `{ token }`                  | `{ token }`               |
| GET    | `buscar-viagens.php?categoria=&origem=&destino=` | `ProdutoViagem[]`         |
| GET    | `listar-estacoes.php`                            | `Estacao[]`               |
| POST   | `criar-reserva.php` `{ itens }`                  | `{ reservaId }`           |
| POST   | `cancelar-reserva.php` `{ reservaId }`           | `{ ok }`                  |
| POST   | `confirmar-pedido.php` `{ reservaId, forma, ...}`| `{ status, comprovante }` |
| GET    | `consultar-pedido.php?reservaId=`                | `Pedido`                  |
| GET    | `listar-pedidos.php`                             | `Pedido[]`                |
| GET    | `download-dabpe.php?reservaId=`                  | arquivo (DABPE)           |
| GET    | `config.php`                                     | `{ ... }`                 |

> Catálogo da home (`/ofertas`, `/destinos`, `/pacotes`, detalhe do produto)
> **não existe** no `apibuson/` — segue em mock até o site publicar uma API.

> ⚠️ A **chave secreta da Buson não fica no app**. O backend do site é quem
> guarda a chave e fala com a Buson; o app fala apenas com o backend do site,
> por token. Isso respeita o contrato Buson (cláusulas 5 e 12).
