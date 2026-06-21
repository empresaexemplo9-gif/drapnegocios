import Constants from 'expo-constants';

/**
 * Configuração da integração com o backend.
 *
 * Ordem de prioridade da fonte de dados:
 * 1. **api** — se EXPO_PUBLIC_API_URL estiver definido (REST genérica).
 * 2. **mock** — dados locais (sem backend).
 *
 * Nenhuma tela conhece a origem dos dados: tudo passa por `src/servicos`.
 */
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

const baseUrlEnv = process.env.EXPO_PUBLIC_API_URL ?? extra.apiUrl ?? '';

/**
 * Site oficial da Viaje Brasil, onde a compra de passagens é concluída.
 *
 * O contrato com a Buson autoriza a venda apenas pelos canais oficiais
 * (links/PDV/QR Codes) e veda embutir o sistema deles em apps de terceiros.
 * Por isso o app NÃO processa o pagamento: ele encaminha o cliente final ao
 * checkout oficial. Configurável por `EXPO_PUBLIC_SITE_URL`.
 */
const siteUrlEnv =
  process.env.EXPO_PUBLIC_SITE_URL ?? extra.siteUrl ?? 'https://www.viajebrasilpassagens.com.br';

export const SITE_OFICIAL = {
  url: siteUrlEnv.replace(/\/$/, ''),
} as const;

/**
 * White label da Buson (canal oficial de venda fornecido pela Buson). É para
 * onde o app encaminha o cliente ao buscar/comprar — sem processar pagamento
 * nem embutir o sistema do parceiro. Configurável por `EXPO_PUBLIC_WHITELABEL_URL`.
 */
const whiteLabelEnv =
  process.env.EXPO_PUBLIC_WHITELABEL_URL ?? extra.whiteLabelUrl ?? 'https://viajebrasil.busonempresas.com.br';

export const WHITE_LABEL = {
  url: whiteLabelEnv.replace(/\/$/, ''),
} as const;

/**
 * Tenant (locatário) ao qual este build pertence. Toda a operação do app é
 * isolada por tenant: a sessão/token é guardada sob esta chave (ver
 * `sessao.ts`) e os leads enviados ao backend levam este `tenantId`, que o
 * backend usa para aplicar o RLS (isolamento por linha) no banco.
 * Configurável por `EXPO_PUBLIC_TENANT_ID` (padrão: `viajebrasil`).
 */
const tenantEnv = process.env.EXPO_PUBLIC_TENANT_ID ?? extra.tenantId ?? 'viajebrasil';

export const TENANT = {
  id: tenantEnv.trim() || 'viajebrasil',
} as const;

/**
 * E-mail do consultor (ou da fila de consultores) que recebe os leads de
 * passagens aéreas. Opcional no app: quem efetivamente dispara o e-mail é o
 * backend (modo `api`); este valor só é repassado como sugestão de destino.
 * A política de distribuição entre consultores será definida no backend.
 * Configurável por `EXPO_PUBLIC_CONSULTOR_EMAIL`.
 */
const consultorEmailEnv =
  process.env.EXPO_PUBLIC_CONSULTOR_EMAIL ?? extra.consultorEmail ?? '';

export const CONSULTOR = {
  email: consultorEmailEnv.trim(),
} as const;

/**
 * Base da função de leads (chatbot aéreo). Na web/PWA da Vercel a função fica
 * em mesma origem (`/api/leads-aereo`), então o padrão é vazio = mesma origem.
 * Defina `EXPO_PUBLIC_LEADS_URL` (ex.: `https://viajebrasil.vercel.app`) apenas
 * para builds nativos (iOS/Android), que não têm "mesma origem".
 */
const leadsUrlEnv = process.env.EXPO_PUBLIC_LEADS_URL ?? extra.leadsUrl ?? '';

export const LEADS = {
  url: leadsUrlEnv.replace(/\/$/, ''),
} as const;

export type FonteDados = 'mock' | 'api';

export const API_CONFIG = {
  baseUrl: baseUrlEnv.replace(/\/$/, ''),
  fonte: (baseUrlEnv ? 'api' : 'mock') as FonteDados,
  timeoutMs: 15000,
} as const;
