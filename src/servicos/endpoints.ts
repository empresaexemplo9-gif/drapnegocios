/**
 * Mapa central de endpoints do backend (modo `api`).
 *
 * Estes são os caminhos REAIS da API do site oficial (pasta `apibuson/`),
 * relativos à base definida em `EXPO_PUBLIC_API_URL`. Ex.: com
 * `EXPO_PUBLIC_API_URL=https://www.viajebrasilpassagens.com.br/apibuson`, o
 * caminho `/auth.php` vira `…/apibuson/auth.php`.
 *
 * ⚠️ PONTO ÚNICO DE TROCA: se o programador renomear/mover um endpoint, ajuste
 * só aqui — os serviços (`viagens.ts`, `pedidos.ts`) já consomem estas
 * constantes e nenhuma tela muda.
 *
 * O backend `apibuson/` é focado em PASSAGENS (busca, reserva, pedido). O
 * catálogo da home (ofertas/destinos/pacotes) NÃO é exposto por ele hoje —
 * por isso esses caminhos são `null` (sem backend) e os serviços usam os
 * dados mock automaticamente, mesmo no modo `api`. Quando o site publicar uma
 * API de catálogo, basta preencher o caminho aqui.
 *
 * Contrato previsto (confirmar formato com o programador):
 *   POST {auth.login}        auth.php            { email, senha }              -> { token, usuario }
 *   POST {auth.refresh}      refresh-token.php   { token }                     -> { token }
 *   GET  {catalogo.busca}    buscar-viagens.php  ?categoria=&origem=&destino=  -> ProdutoViagem[]
 *   GET  {catalogo.estacoes} listar-estacoes.php                              -> Estacao[]
 *   POST {pedidos.criarReserva}    criar-reserva.php    { itens }             -> { reservaId }
 *   POST {pedidos.cancelarReserva} cancelar-reserva.php { reservaId }         -> { ok }
 *   POST {pedidos.confirmar}       confirmar-pedido.php { reservaId, ... }     -> { status, comprovante }
 *   GET  {pedidos.consultar}       consultar-pedido.php ?reservaId=            -> Pedido
 *   GET  {pedidos.listar}          listar-pedidos.php                          -> Pedido[]
 *   GET  {pedidos.baixarDabpe}     download-dabpe.php   ?reservaId=            -> arquivo (DABPE)
 *   GET  {config}                  config.php                                  -> { ... }
 *
 * Se o formato de resposta diferir dos tipos do app, normalize (raw -> tipo)
 * dentro do serviço correspondente — único lugar onde isso muda.
 */

/** Caminho de endpoint real. `null` = recurso ainda não exposto pelo backend. */
type Caminho = string;
type CaminhoOpcional = string | null;

export const ENDPOINTS = {
  auth: {
    login: '/auth.php' as Caminho,
    refresh: '/refresh-token.php' as Caminho,
  },
  catalogo: {
    // Real (apibuson): busca de passagens e estações de origem/destino.
    busca: '/buscar-viagens.php' as Caminho,
    estacoes: '/listar-estacoes.php' as Caminho,
    // Sem endpoint no apibuson — usa mock até o site expor um catálogo.
    ofertas: null as CaminhoOpcional,
    destinos: null as CaminhoOpcional,
    pacotes: null as CaminhoOpcional,
    produto: null as null | ((id: string) => string),
  },
  pedidos: {
    criarReserva: '/criar-reserva.php' as Caminho,
    cancelarReserva: '/cancelar-reserva.php' as Caminho,
    confirmar: '/confirmar-pedido.php' as Caminho,
    consultar: '/consultar-pedido.php' as Caminho,
    listar: '/listar-pedidos.php' as Caminho,
    baixarDabpe: '/download-dabpe.php' as Caminho,
  },
  config: '/config.php' as Caminho,
};
