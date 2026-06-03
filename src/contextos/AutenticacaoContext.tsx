import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { Papel } from '../tipos';
import { carregarTokenPersistido, definirToken } from '../servicos/sessao';

export type { Papel };

interface Usuario {
  nome: string;
  email: string;
  papel: Papel;
}

interface AutenticacaoContextValor {
  usuario: Usuario | null;
  autenticado: boolean;
  ehAdmin: boolean;
  entrar: (email: string, papel?: Papel) => void;
  sair: () => void;
}

const AutenticacaoContext = createContext<AutenticacaoContextValor | null>(null);

export function AutenticacaoProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Reidrata o token (JWT) salvo, para o modo `api` já iniciar autenticado.
  useEffect(() => {
    void carregarTokenPersistido();
  }, []);

  const entrar = useCallback((email: string, papel: Papel = 'cliente') => {
    const nome = email.split('@')[0] ?? 'Viajante';
    setUsuario({ nome, email, papel });
  }, []);

  const sair = useCallback(() => {
    void definirToken(null);
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({
      usuario,
      autenticado: usuario !== null,
      ehAdmin: usuario?.papel === 'admin',
      entrar,
      sair,
    }),
    [usuario, entrar, sair],
  );

  return (
    <AutenticacaoContext.Provider value={valor}>{children}</AutenticacaoContext.Provider>
  );
}

export function useAutenticacao() {
  const ctx = useContext(AutenticacaoContext);
  if (!ctx) throw new Error('useAutenticacao deve ser usado dentro de AutenticacaoProvider');
  return ctx;
}
