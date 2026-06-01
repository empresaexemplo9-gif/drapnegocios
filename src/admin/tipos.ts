import type { Categoria } from '../tipos';

/** Empresa parceira (transportadora, companhia aérea, rede, locadora, seguradora). */
export interface Parceiro {
  id: string;
  nome: string;
  categoria: Categoria;
  contato?: string;
  ativo: boolean;
}
