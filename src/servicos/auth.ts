/**
 * Autenticação real (cliente/consultor/admin) contra as Vercel Functions.
 *
 * Mesmo padrão de `leads.ts`: na web/PWA chama em mesma origem (`/api/auth/...`);
 * no nativo usa `EXPO_PUBLIC_LEADS_URL`. Sem backend (nativo sem URL) cai num
 * fallback mock (cliente) para não travar o desenvolvimento.
 */
import { Platform } from 'react-native';
import { LEADS, TENANT } from './config';
import { definirToken, tokenAtual } from './sessao';
import type { Papel } from '../tipos';

export interface UsuarioAuth {
  nome: string;
  email: string;
  papel: Papel;
}

export interface SessaoAuth {
  token: string;
  usuario: UsuarioAuth;
}

/** Resolve a URL do endpoint. Na web é SEMPRE mesma origem (evita o preview
 *  chamar a API de produção); `LEADS.url` só vale no nativo. `null` = sem backend. */
function urlOuNull(caminho: string): string | null {
  if (Platform.OS === 'web') return caminho;
  if (LEADS.url) return `${LEADS.url}${caminho}`;
  return null;
}

async function postJson<T>(url: string, corpo: unknown): Promise<T> {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  });
  const dados = (await resp.json().catch(() => ({}))) as Record<string, unknown>;
  if (!resp.ok) throw new Error((dados.erro as string) || `Falha na autenticação (${resp.status})`);
  return dados as T;
}

/** Sessão mock para dev/offline (sempre cliente). */
function sessaoMock(email: string, nome?: string): SessaoAuth {
  const nomeFinal = (nome ?? email.split('@')[0] ?? 'Viajante').trim();
  return { token: 'mock-token', usuario: { nome: nomeFinal, email, papel: 'cliente' } };
}

export async function login(email: string, senha: string): Promise<SessaoAuth> {
  const url = urlOuNull('/api/auth/login');
  const sessao = url
    ? await postJson<SessaoAuth>(url, { email, senha, tenantId: TENANT.id })
    : sessaoMock(email);
  await definirToken(sessao.token);
  return sessao;
}

export async function registrar(nome: string, email: string, senha: string): Promise<SessaoAuth> {
  const url = urlOuNull('/api/auth/register');
  const sessao = url
    ? await postJson<SessaoAuth>(url, { nome, email, senha, tenantId: TENANT.id })
    : sessaoMock(email, nome);
  await definirToken(sessao.token);
  return sessao;
}

/** Rehidrata o usuário a partir do token salvo (ou `null` se inválido/ausente). */
export async function eu(): Promise<UsuarioAuth | null> {
  const token = tokenAtual();
  if (!token || token === 'mock-token') return null;
  const url = urlOuNull('/api/auth/me');
  if (!url) return null;
  try {
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!resp.ok) return null;
    const dados = (await resp.json().catch(() => ({}))) as { usuario?: UsuarioAuth };
    return dados.usuario ?? null;
  } catch {
    return null;
  }
}
