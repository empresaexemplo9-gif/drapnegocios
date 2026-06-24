/**
 * Modelo de visibilidade por plano.
 *
 * Princípio: o plano NÃO muda o mérito (o score 0–100 da IA permanece honesto).
 * Ele aumenta o ALCANCE (onde aparece) e o DESTAQUE/POSICIONAMENTO (ordenação e
 * selo). Vale para os três públicos:
 *   - empresa contratante (já tinha o painel Prime);
 *   - vendedor / prestador de serviço (vitrine);
 *   - candidato / quem busca trabalho (ranking visto pelas empresas).
 */
import type { ChavePlano } from './planos';

/** Pontos de boost de POSICIONAMENTO por plano (somados só na ordenação). */
export const BOOST: Record<ChavePlano, number> = {
  free: 0,
  basico: 10,
  pro: 22,
  elite: 40,
};

/** Alcance: 0 local · 1 estadual · 2 regional/nacional · 3 nacional + home. */
export const ALCANCE: Record<ChavePlano, number> = {
  free: 0,
  basico: 1,
  pro: 2,
  elite: 3,
};

export const ALCANCE_LABEL = ['Local', 'Estadual', 'Regional / Nacional', 'Nacional + destaque na home'];

export function boostVisibilidade(plano: ChavePlano): number {
  return BOOST[plano] ?? 0;
}

export function alcanceVisibilidade(plano: ChavePlano): number {
  return ALCANCE[plano] ?? 0;
}

export function alcanceLabel(plano: ChavePlano): string {
  return ALCANCE_LABEL[alcanceVisibilidade(plano)] ?? ALCANCE_LABEL[0];
}

export function temDestaque(plano: ChavePlano): boolean {
  return plano !== 'free';
}

/** Selo de destaque exibido na vitrine/ranking. Null para Free. */
export function rotuloDestaque(plano: ChavePlano): string | null {
  switch (plano) {
    case 'basico':
      return 'Destaque';
    case 'pro':
      return 'Destaque Pro';
    case 'elite':
      return 'Destaque Elite';
    default:
      return null;
  }
}

/**
 * Ordena por (mérito + boost de plano), mantendo o mérito como base. Em empate
 * de mérito, o plano superior aparece antes. Não altera o valor do mérito.
 */
export function ordenarPorVisibilidade<T>(
  itens: T[],
  merito: (x: T) => number,
  plano: (x: T) => ChavePlano,
): T[] {
  return [...itens].sort(
    (a, b) =>
      merito(b) + boostVisibilidade(plano(b)) - (merito(a) + boostVisibilidade(plano(a))),
  );
}
