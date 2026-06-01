import { ptBR } from './pt-br';

/**
 * Acesso central às strings de UI. Hoje só há PT-BR; manter este ponto
 * único facilita adicionar outros idiomas no futuro.
 */
export const t = ptBR;
export type Traducoes = typeof ptBR;
