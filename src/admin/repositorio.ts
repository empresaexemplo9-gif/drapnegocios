import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Parceiro } from './tipos';

const CHAVE_PRECOS = '@viajebrasil/precos';
const CHAVE_PARCEIROS = '@viajebrasil/parceiros';

/** Parceiros iniciais (derivados das empresas usadas no catálogo). */
const PARCEIROS_SEED: Parceiro[] = [
  { id: 'pc-latam', nome: 'LATAM', categoria: 'aereo', ativo: true },
  { id: 'pc-gol', nome: 'GOL', categoria: 'aereo', ativo: true },
  { id: 'pc-azul', nome: 'Azul', categoria: 'aereo', ativo: true },
  { id: 'pc-tap', nome: 'TAP', categoria: 'aereo', ativo: true },
  { id: 'pc-cometa', nome: 'Viação Cometa', categoria: 'onibus', ativo: true },
  { id: 'pc-itapemirim', nome: 'Itapemirim', categoria: 'onibus', ativo: true },
  { id: 'pc-1001', nome: 'Auto Viação 1001', categoria: 'onibus', ativo: true },
  { id: 'pc-gontijo', nome: 'Gontijo', categoria: 'onibus', ativo: true },
  { id: 'pc-util', nome: 'Util', categoria: 'onibus', ativo: true },
  { id: 'pc-catarinense', nome: 'Catarinense', categoria: 'onibus', ativo: true },
  { id: 'pc-localiza', nome: 'Localiza', categoria: 'locacao', ativo: true },
  { id: 'pc-movida', nome: 'Movida', categoria: 'locacao', ativo: true },
  { id: 'pc-unidas', nome: 'Unidas', categoria: 'locacao', ativo: true },
  { id: 'pc-rede-hoteis', nome: 'Rede de Hotéis Parceiros', categoria: 'hospedagem', ativo: true },
  { id: 'pc-seguros', nome: 'Assistência ViajeBrasil Seguros', categoria: 'seguro', ativo: true },
  { id: 'pc-operadora', nome: 'Operadora ViajeBrasil Turismo', categoria: 'turismo', ativo: true },
];

// ---- Preços ----
export async function carregarOverridesPreco(): Promise<Record<string, number>> {
  try {
    const bruto = await AsyncStorage.getItem(CHAVE_PRECOS);
    return bruto ? (JSON.parse(bruto) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export async function definirPreco(id: string, preco: number): Promise<void> {
  const atual = await carregarOverridesPreco();
  atual[id] = preco;
  await AsyncStorage.setItem(CHAVE_PRECOS, JSON.stringify(atual));
}

// ---- Parceiros ----
export async function carregarParceiros(): Promise<Parceiro[]> {
  try {
    const bruto = await AsyncStorage.getItem(CHAVE_PARCEIROS);
    if (bruto) return JSON.parse(bruto) as Parceiro[];
  } catch {
    /* usa seed abaixo */
  }
  await AsyncStorage.setItem(CHAVE_PARCEIROS, JSON.stringify(PARCEIROS_SEED));
  return [...PARCEIROS_SEED];
}

export async function salvarParceiros(lista: Parceiro[]): Promise<void> {
  await AsyncStorage.setItem(CHAVE_PARCEIROS, JSON.stringify(lista));
}
