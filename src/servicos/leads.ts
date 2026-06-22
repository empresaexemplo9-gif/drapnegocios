/**
 * Lead de passagens aéreas gerado pelo chatbot.
 *
 * Ao concluir o chat, o app envia o lead à Vercel Function, que cria o lead
 * (atribuído por round-robin) e devolve `{ leadId, clienteToken }`. O cliente
 * usa esse token para conversar com o consultor pelo chat in-app (ver `chat.ts`).
 * Não há mais e-mail; o atendimento acontece no app.
 */
import { Platform } from 'react-native';
import { LEADS, TENANT } from './config';

/** Caminho da Vercel Function que recebe os leads. */
const CAMINHO = '/api/leads-aereo';

/** Dados da viagem coletados pelo chatbot. */
export interface LeadAereo {
  origem: string;
  destino: string;
  numeroPassageiros: number;
  nomes: string[];
  dataIda: string;
  /** `null` = somente ida. */
  dataVolta: string | null;
  classe: string;
  /** WhatsApp (opcional; o cliente informa só se quiser). */
  telefone: string;
}

/** Resposta da criação do lead. */
export interface RespostaLead {
  leadId: string | null;
  clienteToken: string | null;
}

/** Web/PWA → mesma origem; nativo → `EXPO_PUBLIC_LEADS_URL`; senão `null` (mock). */
function urlDestino(): string | null {
  if (Platform.OS === 'web') return CAMINHO;
  if (LEADS.url) return `${LEADS.url}${CAMINHO}`;
  return null;
}

/** Envia o lead completo e retorna os identificadores para o chat. */
export async function enviarLeadAereo(lead: LeadAereo): Promise<RespostaLead> {
  const payload = {
    tipo: 'completo',
    tenantId: TENANT.id,
    origem: `app:${Platform.OS}`,
    criadoEm: new Date().toISOString(),
    lead,
  };
  const url = urlDestino();
  if (!url) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[ViajeBrasil] lead aéreo (mock):', payload);
    }
    return { leadId: null, clienteToken: null };
  }
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const dados = (await resp.json().catch(() => ({}))) as Partial<RespostaLead>;
  return { leadId: dados.leadId ?? null, clienteToken: dados.clienteToken ?? null };
}
