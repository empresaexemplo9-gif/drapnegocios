export { API_CONFIG, SITE_OFICIAL, TENANT, CONSULTOR } from './config';
export type { FonteDados } from './config';
export { notificarInicioAtendimentoAereo, enviarLeadAereo } from './leads';
export type { LeadAereo } from './leads';
export { login, registrar, eu } from './auth';
export type { UsuarioAuth, SessaoAuth } from './auth';
export { listarLeads, obterLead, atualizarLead } from './leadsConsultor';
export type { FiltroLeads } from './leadsConsultor';
export {
  listarOfertasHome,
  listarOfertasAdmin,
  criarOferta,
  atualizarOferta,
  excluirOferta,
} from './home';
export { obterEstatisticas } from './admin';
export type { EstatisticasAdmin } from './admin';
export { linkWhatsApp } from './whatsapp';
export { enviarFotoOferta } from './upload';
export { linkCheckoutOficial, abrirCheckoutOficial, linkWhiteLabel, abrirWhiteLabel } from './site';
export { ErroApi, requisitar } from './cliente';
export { ENDPOINTS } from './endpoints';
export { tokenAtual, definirToken, carregarTokenPersistido } from './sessao';
export {
  listarOfertas,
  listarDestinos,
  listarPacotes,
  buscar,
  obterProduto,
} from './viagens';
export type { FiltroBusca } from './viagens';
export {
  criarReserva,
  processarPagamento,
  autenticar,
} from './pedidos';
export type {
  FormaPagamento,
  DadosViajante,
  Comprovante,
  SessaoUsuario,
} from './pedidos';
