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
import { eu } from '../servicos/auth';
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
  /** Carregando a sessão persistida (evita "flash-bounce" nos guards). */
  carregando: boolean;
  ehAdmin: boolean;
  ehConsultor: boolean;
  /** Tenant corrente do app (isolamento de dados e sessão). */
  tenantId: string;
  /** Verdadeiro se o papel do usuário está entre os informados. */
  temPapel: (...papeis: Papel[]) => boolean;
  entrar: (email: string, papel?: Papel, nome?: string) => void;
  sair: () => void;
}

const AutenticacaoContext = createContext<AutenticacaoContextValor | null>(null);

export function AutenticacaoProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Reidrata o token salvo e, com ele, o usuário (papel) via /api/auth/me.
  useEffect(() => {
    let ativo = true;
    (async () => {
      await carregarTokenPersistido();
      const u = await eu();
      if (!ativo) return;
      if (u) setUsuario({ ...u, tenantId: TENANT.id });
      setCarregando(false);
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const entrar = useCallback((email: string, papel: Papel = 'cliente', nome?: string) => {
    const nomeFinal = (nome ?? email.split('@')[0] ?? 'Viajante').trim();
    setUsuario({ nome: nomeFinal, email, papel, tenantId: TENANT.id });
  }, []);

  const sair = useCallback(() => {
    void definirToken(null);
    setUsuario(null);
  }, []);

  const temPapel = useCallback(
    (...papeis: Papel[]) => (usuario ? papeis.includes(usuario.papel) : false),
    [usuario],
  );

  const valor = useMemo(
    () => ({
      usuario,
      autenticado: usuario !== null,
      carregando,
      ehAdmin: usuario?.papel === 'admin',
      ehConsultor: usuario?.papel === 'consultor',
      tenantId: TENANT.id,
      temPapel,
      entrar,
      sair,
    }),
    [usuario, carregando, temPapel, entrar, sair],
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
