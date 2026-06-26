/**
 * Rate limiting por chave (tenant_id + IP) e bloqueio de login.
 *
 * Implementação em memória por janela deslizante — suficiente para uma
 * instância. Em produção multi-instância, troque o store por Redis/Upstash
 * mantendo a mesma assinatura. O bloqueio de conta após 5 falhas é persistido
 * no usuário (campos tentativasLogin/bloqueadoAte) — ver auth.ts.
 */

interface Janela {
  count: number;
  reset: number;
}

const g = globalThis as unknown as { __drapRate?: Map<string, Janela> };
g.__drapRate ??= new Map();
const store = g.__drapRate;

export interface ResultadoRate {
  permitido: boolean;
  restante: number;
  resetEm: number;
}

/**
 * @param chave   identificador (ex.: `login:${tenantSlug}:${ip}`)
 * @param limite  máximo de requisições na janela
 * @param janelaMs duração da janela
 */
export function rateLimit(chave: string, limite = 10, janelaMs = 60_000): ResultadoRate {
  const agora = Date.now();
  const atual = store.get(chave);

  if (!atual || agora > atual.reset) {
    store.set(chave, { count: 1, reset: agora + janelaMs });
    return { permitido: true, restante: limite - 1, resetEm: agora + janelaMs };
  }

  atual.count += 1;
  const permitido = atual.count <= limite;
  return { permitido, restante: Math.max(0, limite - atual.count), resetEm: atual.reset };
}

export function chaveLogin(tenantSlug: string, ip: string): string {
  return `login:${tenantSlug}:${ip}`;
}
