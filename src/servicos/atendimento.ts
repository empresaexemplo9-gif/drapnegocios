/**
 * Atendimento GERAL (chat livre cliente ↔ consultor), por polling.
 *
 * Diferente do lead aéreo (`leads.ts`/`chat.ts`): o cliente manda QUALQUER
 * dúvida. A distribuição é isolada (fila `carga_geral` no backend). O cliente
 * é anônimo e usa um `clienteToken`; o consultor usa o JWT.
 */
import { Platform } from 'react-native';
import { LEADS, TENANT } from './config';
import { getJson, enviarJson } from './apiVercel';
import type { Atendimento, MensagemChat, StatusAtendimento } from '../tipos';

/** Resposta da criação de um atendimento geral. */
export interface RespostaAtendimento {
  atendimentoId: string | null;
  clienteToken: string | null;
}

/** Mesma origem na web; `EXPO_PUBLIC_LEADS_URL` no nativo; senão `null`. */
function urlBase(caminho: string): string | null {
  if (Platform.OS === 'web') return caminho;
  if (LEADS.url) return `${LEADS.url}${caminho}`;
  return null;
}

function urlCliente(id: string, token: string): string | null {
  const base = urlBase(`/api/atendimentos/${encodeURIComponent(id)}`);
  if (!base) return null;
  return `${base}?token=${encodeURIComponent(token)}&tenantId=${encodeURIComponent(TENANT.id)}`;
}

// ── Lado cliente (anônimo, via token) ──────────────────────────────────────

/** Cria o atendimento com a 1ª mensagem do cliente e retorna os IDs do chat. */
export async function criarAtendimento(texto: string): Promise<RespostaAtendimento> {
  const url = urlBase('/api/atendimentos');
  if (!url) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[ViajeBrasil] atendimento (mock):', texto);
    }
    return { atendimentoId: null, clienteToken: null };
  }
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId: TENANT.id, origem: `app:${Platform.OS}`, texto }),
  });
  const d = (await resp.json().catch(() => ({}))) as Partial<RespostaAtendimento>;
  return { atendimentoId: d.atendimentoId ?? null, clienteToken: d.clienteToken ?? null };
}

export async function listarMensagensAtendimentoCliente(id: string, token: string): Promise<MensagemChat[]> {
  const url = urlCliente(id, token);
  if (!url) return [];
  try {
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const d = (await resp.json().catch(() => ({}))) as { mensagens?: MensagemChat[] };
    return d.mensagens ?? [];
  } catch {
    return [];
  }
}

export async function enviarMensagemAtendimentoCliente(id: string, token: string, texto: string): Promise<void> {
  const url = urlCliente(id, token);
  if (!url) return;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto }),
  });
}

// ── Lado consultor/admin (via JWT) ─────────────────────────────────────────

export async function listarAtendimentos(): Promise<Atendimento[]> {
  const { atendimentos } = await getJson<{ atendimentos: Atendimento[] }>('/api/atendimentos');
  return atendimentos;
}

export async function listarMensagensAtendimento(id: string): Promise<MensagemChat[]> {
  const { mensagens } = await getJson<{ mensagens: MensagemChat[] }>(
    `/api/atendimentos/${encodeURIComponent(id)}`,
  );
  return mensagens;
}

export async function enviarMensagemAtendimento(id: string, texto: string): Promise<void> {
  await enviarJson('POST', `/api/atendimentos/${encodeURIComponent(id)}`, { texto });
}

export async function mudarStatusAtendimento(id: string, status: StatusAtendimento): Promise<void> {
  await enviarJson('POST', `/api/atendimentos/${encodeURIComponent(id)}`, { status });
}
