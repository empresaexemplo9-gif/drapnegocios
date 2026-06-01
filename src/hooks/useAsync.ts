import { useEffect, useState } from 'react';

interface EstadoAsync<T> {
  dados: T | undefined;
  carregando: boolean;
  erro: Error | undefined;
}

/**
 * Executa uma função assíncrona (tipicamente um serviço de `src/servicos`) e
 * expõe `dados`, `carregando` e `erro`. Reexecuta quando `deps` muda.
 *
 * Mantém as telas agnósticas quanto à origem (mock ou API) — elas só lidam
 * com Promises.
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: React.DependencyList,
): EstadoAsync<T> {
  const [estado, setEstado] = useState<EstadoAsync<T>>({
    dados: undefined,
    carregando: true,
    erro: undefined,
  });

  useEffect(() => {
    let ativo = true;
    setEstado((s) => ({ ...s, carregando: true, erro: undefined }));

    fn()
      .then((dados) => {
        if (ativo) setEstado({ dados, carregando: false, erro: undefined });
      })
      .catch((erro: Error) => {
        if (ativo) setEstado({ dados: undefined, carregando: false, erro });
      });

    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return estado;
}
