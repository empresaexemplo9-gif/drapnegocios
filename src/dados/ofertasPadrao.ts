/**
 * Ofertas que aparecem na home por padrão (as mesmas do fallback de
 * `app/(tabs)/index.tsx`). O admin pode "popular" o banco com estas para já
 * começar com a vitrine atual e então editar à vontade.
 */
const foto = (seed: string, w = 800) => `https://picsum.photos/seed/vb-${seed}/${w}/${Math.round(w * 0.66)}`;

export interface OfertaPadrao {
  titulo: string;
  cidade: string;
  preco: number;
  badge: string;
  imagem_url: string;
  ordem: number;
}

export const OFERTAS_PADRAO: OfertaPadrao[] = [
  { titulo: 'Rio de Janeiro', cidade: 'Rio de Janeiro – RJ', preco: 189, badge: '20% OFF', imagem_url: foto('rio'), ordem: 1 },
  { titulo: 'Belo Horizonte', cidade: 'Belo Horizonte – MG', preco: 149, badge: '15% OFF', imagem_url: foto('bh'), ordem: 2 },
  { titulo: 'São Paulo', cidade: 'São Paulo – SP', preco: 129, badge: '10% OFF', imagem_url: foto('sao'), ordem: 3 },
  { titulo: 'Salvador', cidade: 'Salvador – BA', preco: 119, badge: '10% OFF', imagem_url: foto('ssa'), ordem: 4 },
];
