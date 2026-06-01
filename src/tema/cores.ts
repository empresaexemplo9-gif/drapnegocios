/**
 * Paleta da marca ViajeBrasil, derivada da logo (cores do Brasil):
 * verde da mata, azul do mar/céu, amarelo do sol e azul-marinho do wordmark.
 */
export const cores = {
  // Marca
  verde: '#1FA84C',
  verdeEscuro: '#0E7A37',
  azulMarinho: '#15315E',
  azul: '#1E73BE',
  azulCeu: '#2BA8E0',
  amarelo: '#FFC20E',
  laranja: '#F39200',

  // Superfícies
  fundo: '#F4F6F9',
  superficie: '#FFFFFF',
  superficieAlt: '#EEF2F7',
  borda: '#E2E8F0',

  // Texto
  texto: '#15315E',
  textoSuave: '#5A6B85',
  textoClaro: '#9AA7BD',
  textoInverso: '#FFFFFF',

  // Estados
  sucesso: '#1FA84C',
  alerta: '#F39200',
  erro: '#E2483D',
  destaque: '#FFC20E',

  // Utilidades
  sombra: '#15315E',
  transparente: 'transparent',
} as const;

/** Degradês usados em cabeçalhos e cartões de destaque. */
export const degrades = {
  marca: ['#1FA84C', '#1E73BE'] as const,
  ceu: ['#2BA8E0', '#1E73BE'] as const,
  sol: ['#FFC20E', '#F39200'] as const,
  noite: ['#15315E', '#1E73BE'] as const,
};

export type Cor = keyof typeof cores;
