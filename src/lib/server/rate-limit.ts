/**
 * Rate limiting por chave (ex.: `login:${ip}`).
 *
 * Dois modos, escolhidos automaticamente:
 *  - DISTRIBUÍDO (recomendado em produção serverless): usa Upstash Redis quando
 *    UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN estão definidos. Vale
 *    entre todas as instâncias da Vercel.
 *  - EM MEMÓRIA (fallback): janela deslizante por instância. Suficiente para uma
 *    instância / desenvolvimento. É também o fallback se o Redis falhar.
 *
 * O bloqueio de conta após 5 falhas de login é persistido no usuário
 * (tentativasLogin/bloqueadoAte) — ver auth.ts.
 */
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface Janela {
  count: number;
  reset: number;
}

const g = globalThis as unknown as {
  __drapRate?: Map<string, Janela>;
  __drapLimiters?: Map<string, Ratelimit>;
};
g.__drapRate ??= new Map();
const store = g.__drapRate;

export interface ResultadoRate {
  permitido: boolean;
  restante: number;
  resetEm: number;
}

/** Rate-limit em memória (síncrono). Fallback e uso onde async não cabe. */
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

const temUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);
const redis = temUpstash ? Redis.fromEnv() : null;

/** Reaproveita um Ratelimit por combinação limite/janela (evita recriar). */
function limiterUpstash(limite: number, janelaMs: number): Ratelimit {
  g.__drapLimiters ??= new Map();
  const chave = `${limite}:${janelaMs}`;
  let l = g.__drapLimiters.get(chave);
  if (!l) {
    l = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(limite, `${Math.max(1, Math.round(janelaMs / 1000))} s`),
      prefix: 'drap_rl',
      analytics: false,
    });
    g.__drapLimiters.set(chave, l);
  }
  return l;
}

/**
 * Rate-limit assíncrono, distribuído quando o Upstash está configurado; cai no
 * modo em memória se não estiver ou se o Redis falhar (nunca derruba o fluxo).
 */
export async function checarRate(
  chave: string,
  limite = 10,
  janelaMs = 60_000,
): Promise<ResultadoRate> {
  if (redis) {
    try {
      const r = await limiterUpstash(limite, janelaMs).limit(chave);
      return { permitido: r.success, restante: r.remaining, resetEm: r.reset };
    } catch (e) {
      console.error('Upstash rate-limit falhou; usando fallback em memória:', (e as Error).message);
    }
  }
  return rateLimit(chave, limite, janelaMs);
}

export function chaveLogin(tenantSlug: string, ip: string): string {
  return `login:${tenantSlug}:${ip}`;
}
