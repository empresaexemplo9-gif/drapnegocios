/**
 * Chat de um lead (cliente ↔ consultor), por polling.
 *
 * Cliente: anônimo, usa `clienteToken` (sem login). Consultor: usa o JWT.
 */
import { Platform } from 'react-native';
import { LEADS, TENANT } from './config';
import { getJson, enviarJson } from './apiVercel';
import type { MensagemChat } from '../tipos';

/** Mesma origem na web; `EXPO_PUBLIC_LEADS_URL` no nativo; senão `null`. */
function urlBase(caminho: string): string | null {
  if (Platform.OS === 'web') return caminho;
  if (LEADS.url) return `${LEADS.url}${caminho}`;
  return null;
}

function urlCliente(leadId: string, token: string): string | null {
  const base = urlBase(`/api/chat/${encodeURIComponent(leadId)}`);
  if (!base) return null;
  return `${base}?token=${encodeURIComponent(token)}&tenantId=${encodeURIComponent(TENANT.id)}`;
}

// ── Lado cliente (anônimo, via token) ──────────────────────────────────────

export async function listarMensagensCliente(leadId: string, token: string): Promise<MensagemChat[]> {
  const url = urlCliente(leadId, token);
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

export async function enviarMensagemCliente(leadId: string, token: string, texto: string): Promise<void> {
  const url = urlCliente(leadId, token);
  if (!url) return;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto }),
  });
}

export async function informarWhatsappCliente(leadId: string, token: string, telefone: string): Promise<void> {
  const url = urlCliente(leadId, token);
  if (!url) return;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telefone }),
  });
}

// ── Lado consultor (via JWT) ───────────────────────────────────────────────

export async function listarMensagens(leadId: string): Promise<MensagemChat[]> {
  const { mensagens } = await getJson<{ mensagens: MensagemChat[] }>(`/api/chat/${encodeURIComponent(leadId)}`);
  return mensagens;
}

export async function enviarMensagem(leadId: string, texto: string): Promise<void> {
  await enviarJson('POST', `/api/chat/${encodeURIComponent(leadId)}`, { texto });
}
