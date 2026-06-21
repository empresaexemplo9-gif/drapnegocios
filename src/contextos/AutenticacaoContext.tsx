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
import { TENANT } from '../servicos/config';

export type { Papel };

interface Usuario {
  nome: string;
  email: string;
  papel: Papel;
  /** Tenant ao qual o login pertence — base do isolamento multi-tenant. */
  tenantId: string;
}

interface AutenticacaoContextValor {
  usuario: Usuario | null;
  autenticado: boolean;
  ehAdmin: boolean;
  /** Tenant corrente do app (isolamento de dados e sessão). */
  tenantId: string;
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
    setUsuario({ nome, email, papel, tenantId: TENANT.id });
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
      tenantId: TENANT.id,
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
