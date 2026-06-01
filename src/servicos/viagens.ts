/**
 * Serviços de catálogo de viagens — a fronteira entre as telas e a origem
 * dos dados. No modo `mock` retornam dados locais (`src/dados`); no modo `api`
 * chamam o backend através de `requisitar(...)` usando os caminhos de
 * `ENDPOINTS`. As assinaturas são assíncronas para que ligar o backend não
 * exija mudar nenhuma tela.
 *
 * Quando a API for liberada, ajuste os caminhos em `endpoints.ts` (ponto único
 * de troca). Se a resposta do backend tiver formato diferente dos tipos do
 * app, normalize aqui (raw -> tipo do app).
 */
import {
  banners,
  buscarPorCategoria,
  buscarProduto,
  destinos,
  pacotes,
} from '../dados';
import type {
  BannerOferta,
  Categoria,
  Destino,
  PacoteTurismo,
  ProdutoViagem,
} from '../tipos';
import { aplicarPrecos } from '../admin/produtos';
import { API_CONFIG } from './config';
import { requisitar } from './cliente';
import { ENDPOINTS } from './endpoints';
import { overridesPreco } from './admin';

export interface FiltroBusca {
  origem?: string;
  destino?: string;
}

export async function listarOfertas(): Promise<BannerOferta[]> {
  if (API_CONFIG.fonte === 'api') return requisitar<BannerOferta[]>(ENDPOINTS.catalogo.ofertas);
  return banners;
}

export async function listarDestinos(): Promise<Destino[]> {
  if (API_CONFIG.fonte === 'api') return requisitar<Destino[]>(ENDPOINTS.catalogo.destinos);
  return destinos;
}

export async function listarPacotes(): Promise<PacoteTurismo[]> {
  if (API_CONFIG.fonte === 'api') return requisitar<PacoteTurismo[]>(ENDPOINTS.catalogo.pacotes);
  return pacotes;
}

export async function buscar(
  categoria: Categoria,
  filtro: FiltroBusca = {},
): Promise<ProdutoViagem[]> {
  if (API_CONFIG.fonte === 'api') {
    const query = new URLSearchParams({ categoria });
    if (filtro.origem) query.set('origem', filtro.origem);
    if (filtro.destino) query.set('destino', filtro.destino);
    return requisitar<ProdutoViagem[]>(`${ENDPOINTS.catalogo.busca}?${query.toString()}`);
  }
  const overrides = await overridesPreco();
  return aplicarPrecos(buscarPorCategoria(categoria, filtro), overrides);
}

export async function obterProduto(id: string): Promise<ProdutoViagem | null> {
  if (API_CONFIG.fonte === 'api') return requisitar<ProdutoViagem>(ENDPOINTS.catalogo.produto(id));
  const produto = buscarProduto(id);
  if (!produto) return null;
  const overrides = await overridesPreco();
  return aplicarPrecos([produto], overrides)[0] ?? produto;
}
