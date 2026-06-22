/**
 * Leads de passagens aéreas gerados pelo chatbot da tela inicial.
 *
 * Fluxo: o cliente toca no card "Passagens Aéreas", o chatbot abre e coleta os
 * dados da viagem. Ao iniciar (gatilho do botão) e ao concluir, o app avisa o
 * backend, que é quem efetivamente **envia o e-mail ao consultor** e aplica a
 * política de distribuição entre consultores (definida server-side).
 *
 * No modo `mock` (sem backend) nada é enviado de fato — apenas registramos no
 * console em desenvolvimento. Ao ligar `EXPO_PUBLIC_API_URL` (modo `api`), o
 * lead é enviado para o endpoint `ENDPOINTS.leads.aereo`.
 */
import { Platform } from 'react-native';
import { CONSULTOR, LEADS, TENANT } from './config';

/** Caminho da Vercel Function que recebe os leads. */
const CAMINHO = '/api/leads-aereo';

/** Dados da viagem coletados pelo chatbot. */
export interface LeadAereo {
  /** Cidade de origem da viagem. */
  origem: string;
  /** Cidade de destino da viagem. */
  destino: string;
  numeroPassageiros: number;
  /** Nome(s) do(s) passageiro(s). */
  nomes: string[];
  dataIda: string;
  /** `null` = somente ida. */
  dataVolta: string | null;
  classe: string;
  /** WhatsApp/telefone de contato do cliente (com DDD). */
  telefone: string;
}

/** Tipo do evento enviado ao backend. */
type TipoEvento = 'inicio' | 'completo';

/** Monta o envelope comum (tenant, origem, consultor sugerido, timestamp). */
function envelope(tipo: TipoEvento, extra: Record<string, unknown> = {}) {
  return {
    tipo,
    tenantId: TENANT.id,
    consultorEmail: CONSULTOR.email || undefined,
    origem: `app:${Platform.OS}`,
    criadoEm: new Date().toISOString(),
    ...extra,
  };
}

/**
 * Resolve o destino do POST:
 * - `EXPO_PUBLIC_LEADS_URL` definido (nativo) → `<url>/api/leads-aereo`.
 * - Web/PWA sem URL → mesma origem (`/api/leads-aereo`) na Vercel.
 * - Nativo sem URL → `null` (cai no modo mock).
 */
function urlDestino(): string | null {
  if (Platform.OS === 'web') return CAMINHO;
  if (LEADS.url) return `${LEADS.url}${CAMINHO}`;
  return null;
}

/** Envia o evento à Vercel Function ou, sem destino, registra localmente. */
async function despachar(payload: Record<string, unknown>): Promise<void> {
  const url = urlDestino();
  if (!url) {
    // Sem backend configurado: o e-mail real sai da Vercel Function.
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[ViajeBrasil] lead aéreo (mock):', payload);
    }
    return;
  }
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/**
 * Notifica que um cliente **iniciou** o atendimento aéreo (gatilho do botão).
 * Melhor-esforço: nunca deve interromper a abertura do chat.
 */
export async function notificarInicioAtendimentoAereo(): Promise<void> {
  try {
    await despachar(envelope('inicio'));
  } catch {
    // Silencioso: o lead completo, enviado ao final, é o que importa.
  }
}

/**
 * Envia o lead **completo** ao final do chat, para o backend avisar o
 * consultor por e-mail com todos os dados da viagem. Pode lançar `ErroApi`
 * para a tela informar falha — por isso o chamador deve tratar.
 */
export async function enviarLeadAereo(lead: LeadAereo): Promise<void> {
  await despachar(envelope('completo', { lead }));
}
