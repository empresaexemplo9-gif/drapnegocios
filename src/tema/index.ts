export { cores, degrades } from './cores';
export type { Cor } from './cores';
export { tipografia } from './tipografia';

/** Espaçamentos base (múltiplos de 4). */
export const espaco = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Raios de borda. */
export const raio = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Sombra padrão para cartões. */
export const sombra = {
  shadowColor: '#15315E',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 3,
} as const;
