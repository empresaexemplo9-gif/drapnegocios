# Integração com a API (Buson / backend do site)

O app já está preparado para falar com o backend. Hoje roda em **modo `mock`**
(dados locais) e, no checkout, **encaminha o cliente ao site oficial**. Quando a
API da Buson for liberada e o programador expuser os endpoints para o app, ligar
o **modo `api`** é uma troca mínima.

## Como o app escolhe a fonte de dados

`src/servicos/config.ts` decide automaticamente:

1. `supabase` — se `EXPO_PUBLIC_SUPABASE_URL` + `ANON_KEY` estiverem definidos.
2. `api` — se `EXPO_PUBLIC_API_URL` estiver definido.
3. `mock` — padrão (sem backend).

Para ligar o backend do site, basta definir:

```
EXPO_PUBLIC_API_URL=https://api.viajebrasilpassagens.com.br
```

## Passos para ligar o modo `api`

1. **Apontar a URL**: definir `EXPO_PUBLIC_API_URL` (acima).
2. **Conferir os caminhos**: ajustar `src/servicos/endpoints.ts` para os
   endpoints reais do backend (ponto único de troca).
3. **Normalizar formatos** (se preciso): se a resposta do backend tiver forma
   diferente dos tipos do app (`src/tipos`), mapear `raw -> tipo` dentro do
   serviço correspondente (`viagens.ts` / `pedidos.ts`).
4. Pronto. As telas não mudam.

## Autenticação (JWT)

- O login (`autenticar`) já **guarda o token** em `src/servicos/sessao.ts`.
- O cliente HTTP (`cliente.ts`) **anexa** `Authorization: Bearer <token>`
  automaticamente em todas as requisições.
- O token é **persistido** (AsyncStorage), reidratado no início do app e
  **limpo no logout**.

## Contrato previsto (confirmar com o backend)

| Método | Endpoint                                   | Resposta                  |
|--------|--------------------------------------------|---------------------------|
| POST   | `/auth/login` `{ email, senha }`           | `{ token, usuario }`      |
| GET    | `/ofertas`                                 | `BannerOferta[]`          |
| GET    | `/destinos`                                | `Destino[]`               |
| GET    | `/pacotes`                                 | `PacoteTurismo[]`         |
| GET    | `/busca?categoria=&origem=&destino=`       | `ProdutoViagem[]`         |
| GET    | `/produtos/:id`                            | `ProdutoViagem`           |
| POST   | `/reservas` `{ itens }`                     | `{ reservaId }`           |
| POST   | `/pagamentos` `{ reservaId, forma, ... }`  | `{ status, comprovante }` |

> ⚠️ A **chave secreta da Buson não fica no app**. O backend do site é quem
> guarda a chave e fala com a Buson; o app fala apenas com o backend do site,
> por token. Isso respeita o contrato Buson (cláusulas 5 e 12).
