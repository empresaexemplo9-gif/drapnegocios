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
import { API_CONFIG, CONSULTOR, TENANT } from './config';
import { requisitar } from './cliente';
import { ENDPOINTS } from './endpoints';

/** Dados da viagem coletados pelo chatbot. */
export interface LeadAereo {
  numeroPassageiros: number;
  /** Nome(s) do(s) passageiro(s). */
  nomes: string[];
  dataIda: string;
  /** `null` = somente ida. */
  dataVolta: string | null;
  classe: string;
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

/** Despacha o evento ao backend (modo `api`) ou registra localmente (mock). */
async function despachar(payload: Record<string, unknown>): Promise<void> {
  if (API_CONFIG.fonte === 'api') {
    await requisitar(ENDPOINTS.leads.aereo, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return;
  }
  // Mock: sem backend, o e-mail real sai do servidor no modo `api`.
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[ViajeBrasil] lead aéreo (mock):', payload);
  }
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
