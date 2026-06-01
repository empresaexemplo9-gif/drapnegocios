/**
 * Serviços administrativos: preços e parceiros.
 * - `supabase`: lê/grava nas tabelas `parceiros` e `precos` (com RLS).
 * - `api`: endpoints `/admin/*` (REST genérica).
 * - `mock`: AsyncStorage local (protótipo).
 */
import {
  carregarParceiros,
  carregarOverridesPreco,
  definirPreco,
  salvarParceiros,
} from '../admin/repositorio';
import type { Parceiro } from '../admin/tipos';
import { API_CONFIG } from './config';
import { requisitar } from './cliente';
import { clienteSupabase } from './supabase';

export async function listarParceiros(): Promise<Parceiro[]> {
  if (API_CONFIG.fonte === 'supabase') {
    const { data, error } = await clienteSupabase()
      .from('parceiros')
      .select('id, nome, categoria, contato, ativo')
      .order('nome');
    if (error) throw error;
    return (data ?? []) as Parceiro[];
  }
  if (API_CONFIG.fonte === 'api') return requisitar<Parceiro[]>('/admin/parceiros');
  return carregarParceiros();
}

export async function salvarParceiro(parceiro: Parceiro): Promise<Parceiro[]> {
  if (API_CONFIG.fonte === 'supabase') {
    const { error } = await clienteSupabase()
      .from('parceiros')
      .upsert({ ...parceiro, contato: parceiro.contato ?? null });
    if (error) throw error;
    return listarParceiros();
  }
  if (API_CONFIG.fonte === 'api') {
    await requisitar(`/admin/parceiros/${parceiro.id}`, {
      method: 'PUT',
      body: JSON.stringify(parceiro),
    });
    return listarParceiros();
  }
  const lista = await carregarParceiros();
  const i = lista.findIndex((p) => p.id === parceiro.id);
  if (i >= 0) lista[i] = parceiro;
  else lista.push(parceiro);
  await salvarParceiros(lista);
  return lista;
}

export async function removerParceiro(id: string): Promise<Parceiro[]> {
  if (API_CONFIG.fonte === 'supabase') {
    const { error } = await clienteSupabase().from('parceiros').delete().eq('id', id);
    if (error) throw error;
    return listarParceiros();
  }
  if (API_CONFIG.fonte === 'api') {
    await requisitar(`/admin/parceiros/${id}`, { method: 'DELETE' });
    return listarParceiros();
  }
  const lista = (await carregarParceiros()).filter((p) => p.id !== id);
  await salvarParceiros(lista);
  return lista;
}

export async function overridesPreco(): Promise<Record<string, number>> {
  if (API_CONFIG.fonte === 'supabase') {
    const { data, error } = await clienteSupabase().from('precos').select('produto_id, preco');
    if (error) throw error;
    const mapa: Record<string, number> = {};
    for (const linha of data ?? []) mapa[linha.produto_id as string] = Number(linha.preco);
    return mapa;
  }
  if (API_CONFIG.fonte === 'api') return requisitar<Record<string, number>>('/admin/precos');
  return carregarOverridesPreco();
}

export async function definirPrecoProduto(id: string, preco: number): Promise<void> {
  if (API_CONFIG.fonte === 'supabase') {
    const { error } = await clienteSupabase()
      .from('precos')
      .upsert({ produto_id: id, preco });
    if (error) throw error;
    return;
  }
  if (API_CONFIG.fonte === 'api') {
    await requisitar(`/admin/precos/${id}`, { method: 'PUT', body: JSON.stringify({ preco }) });
    return;
  }
  await definirPreco(id, preco);
}
