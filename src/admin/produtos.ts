import {
  hospedagens,
  locacoes,
  pacotes,
  passagensAereas,
  passagensOnibus,
  seguros,
} from '../dados';
import type { ProdutoViagem } from '../tipos';

/** Todos os produtos do catálogo, em ordem de exibição no admin. */
export function listarTodosProdutos(): ProdutoViagem[] {
  return [
    ...passagensAereas,
    ...passagensOnibus,
    ...hospedagens,
    ...pacotes,
    ...locacoes,
    ...seguros,
  ];
}

/** Preço canônico do produto (o campo varia por categoria). */
export function precoDe(p: ProdutoViagem): number {
  if (p.categoria === 'hospedagem') return p.precoNoite;
  if (p.categoria === 'locacao' || p.categoria === 'seguro') return p.precoDia;
  return p.preco;
}

/** Rótulo legível do produto para listas administrativas. */
export function rotuloProduto(p: ProdutoViagem): string {
  switch (p.categoria) {
    case 'aereo':
      return `${p.companhia} · ${p.origem} → ${p.destino}`;
    case 'onibus':
      return `${p.empresa} · ${p.origem} → ${p.destino}`;
    case 'hospedagem':
      return p.nome;
    case 'turismo':
      return p.titulo;
    case 'locacao':
      return `${p.modelo} · ${p.locadora}`;
    case 'seguro':
      return p.plano;
  }
}

/** Aplica overrides de preço (por id) a uma lista, sem mutar o original. */
export function aplicarPrecos<T extends ProdutoViagem>(
  lista: T[],
  overrides: Record<string, number>,
): T[] {
  return lista.map((p) => {
    const novo = overrides[p.id];
    if (novo === undefined) return p;
    if (p.categoria === 'hospedagem') return { ...p, precoNoite: novo };
    if (p.categoria === 'locacao' || p.categoria === 'seguro') return { ...p, precoDia: novo };
    return { ...p, preco: novo };
  });
}
