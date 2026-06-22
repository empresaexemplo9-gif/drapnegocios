/**
 * Cliente HTTP para as Vercel Functions (same-origin na web, `EXPO_PUBLIC_LEADS_URL`
 * no nativo), anexando o JWT da sessão. Usado pelos painéis de consultor/admin.
 */
import { Platform } from 'react-native';
import { LEADS } from './config';
import { tokenAtual } from './sessao';

/** Resolve a URL. Na web é SEMPRE mesma origem (evita o preview chamar a API de
 *  produção); `LEADS.url` só vale no nativo. `null` = sem backend. */
export function urlVercel(caminho: string): string | null {
  if (Platform.OS === 'web') return caminho;
  if (LEADS.url) return `${LEADS.url}${caminho}`;
  return null;
}

function cabecalhos(comCorpo: boolean): Record<string, string> {
  const h: Record<string, string> = {};
  if (comCorpo) h['Content-Type'] = 'application/json';
  const tk = tokenAtual();
  if (tk) h.Authorization = `Bearer ${tk}`;
  return h;
}

async function tratar<T>(resp: Response): Promise<T> {
  const dados = (await resp.json().catch(() => ({}))) as Record<string, unknown>;
  if (!resp.ok) throw new Error((dados.erro as string) || `Falha na requisição (${resp.status})`);
  return dados as T;
}

export async function getJson<T>(caminho: string): Promise<T> {
  const url = urlVercel(caminho);
  if (!url) throw new Error('backend indisponível');
  return tratar<T>(await fetch(url, { headers: cabecalhos(false) }));
}

export async function enviarJson<T>(metodo: 'POST' | 'PATCH' | 'DELETE', caminho: string, corpo?: unknown): Promise<T> {
  const url = urlVercel(caminho);
  if (!url) throw new Error('backend indisponível');
  return tratar<T>(
    await fetch(url, {
      method: metodo,
      headers: cabecalhos(corpo !== undefined),
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    }),
  );
}
