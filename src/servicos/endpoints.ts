/**
 * Mapa central de endpoints do backend (modo `api`).
 *
 * ⚠️ PONTO ÚNICO DE TROCA: quando a API da Buson/site for liberada, ajuste os
 * caminhos abaixo para os endpoints reais do backend do programador. Nenhum
 * outro arquivo precisa mudar — os serviços (`viagens.ts`, `pedidos.ts`) já
 * consomem estas constantes.
 *
 * Contrato previsto (confirmar com o backend):
 *   POST {auth.login}       { email, senha }                 -> { token, usuario }
 *   GET  {catalogo.ofertas}                                  -> BannerOferta[]
 *   GET  {catalogo.destinos}                                 -> Destino[]
 *   GET  {catalogo.pacotes}                                  -> PacoteTurismo[]
 *   GET  {catalogo.busca}?categoria=&origem=&destino=        -> ProdutoViagem[]
 *   GET  {catalogo.produto(id)}                              -> ProdutoViagem
 *   POST {pedidos.reservas} { itens }                        -> { reservaId }
 *   POST {pedidos.pagamentos} { reservaId, forma, viajante } -> { status, comprovante }
 *
 * Se o formato de resposta do backend diferir dos tipos do app, faça o
 * mapeamento (raw -> tipo do app) dentro do serviço correspondente — esse é o
 * único lugar onde a forma dos dados precisa ser normalizada.
 */
export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
  },
  catalogo: {
    ofertas: '/ofertas',
    destinos: '/destinos',
    pacotes: '/pacotes',
    busca: '/busca',
    produto: (id: string) => `/produtos/${id}`,
  },
  pedidos: {
    reservas: '/reservas',
    pagamentos: '/pagamentos',
  },
} as const;
