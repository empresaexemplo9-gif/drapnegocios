import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ItemReserva } from '../tipos';

interface CarrinhoContextValor {
  itens: ItemReserva[];
  total: number;
  adicionar: (item: ItemReserva) => void;
  remover: (chave: string) => void;
  limpar: () => void;
  contem: (chave: string) => boolean;
}

const CarrinhoContext = createContext<CarrinhoContextValor | null>(null);

export function CarrinhoProvider({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<ItemReserva[]>([]);

  const adicionar = useCallback((item: ItemReserva) => {
    setItens((atual) =>
      atual.some((i) => i.chave === item.chave) ? atual : [...atual, item],
    );
  }, []);

  const remover = useCallback((chave: string) => {
    setItens((atual) => atual.filter((i) => i.chave !== chave));
  }, []);

  const limpar = useCallback(() => setItens([]), []);

  const contem = useCallback(
    (chave: string) => itens.some((i) => i.chave === chave),
    [itens],
  );

  const total = useMemo(
    () => itens.reduce((soma, i) => soma + i.preco, 0),
    [itens],
  );

  const valor = useMemo(
    () => ({ itens, total, adicionar, remover, limpar, contem }),
    [itens, total, adicionar, remover, limpar, contem],
  );

  return <CarrinhoContext.Provider value={valor}>{children}</CarrinhoContext.Provider>;
}

export function useCarrinho() {
  const ctx = useContext(CarrinhoContext);
  if (!ctx) throw new Error('useCarrinho deve ser usado dentro de CarrinhoProvider');
  return ctx;
}
