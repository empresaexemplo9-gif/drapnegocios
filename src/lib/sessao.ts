/**
 * Sessão por cookie httpOnly assinado (HMAC). Simples e segura o suficiente
 * para o MVP; na fase 2 pode migrar para NextAuth/OAuth sem mudar as telas.
 */
import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { porId, type Usuario } from './usuarios';

const COOKIE = 'drap_sessao';
const SEGREDO = process.env.AUTH_SECRET ?? 'dev-inseguro-trocar-em-producao';

function assinar(valor: string): string {
  return createHmac('sha256', SEGREDO).update(valor).digest('hex');
}

/** Cria a sessão (chamar apenas dentro de Server Action / Route Handler). */
export function criarSessao(usuarioId: string): void {
  const token = `${usuarioId}.${assinar(usuarioId)}`;
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });
}

/** Encerra a sessão (Server Action / Route Handler). */
export function encerrarSessao(): void {
  cookies().delete(COOKIE);
}

/** Usuário autenticado a partir do cookie, ou null. Seguro em Server Components. */
export function usuarioAtual(): Usuario | null {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const [id, assinatura] = token.split('.');
  if (!id || !assinatura) return null;
  const esperado = assinar(id);
  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperado);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return porId(id) ?? null;
}
