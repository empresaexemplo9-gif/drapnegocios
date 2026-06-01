import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { Papel } from '../admin/credenciais';
import { SUPABASE } from '../servicos/config';
import { supabase } from '../servicos/supabase';
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

  // Restaura a sessão do Supabase (quando configurado) e mantém sincronizado.
  useEffect(() => {
    if (!SUPABASE.ativo || !supabase) return;
    const sb = supabase;
    let ativo = true;

    const aplicar = async (sessao: { user?: { id: string; email?: string } } | null) => {
      const u = sessao?.user;
      if (!u) {
        if (ativo) setUsuario(null);
        return;
      }
      const { data: perfil } = await sb
        .from('perfis')
        .select('papel, nome')
        .eq('id', u.id)
        .single();
      if (!ativo) return;
      setUsuario({
        nome: (perfil?.nome as string | undefined) ?? u.email?.split('@')[0] ?? 'Viajante',
        email: u.email ?? '',
        papel: perfil?.papel === 'admin' ? 'admin' : 'cliente',
      });
    };

    sb.auth.getSession().then(({ data }) => aplicar(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_evento, sessao) => aplicar(sessao));
    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const entrar = useCallback((email: string, papel: Papel = 'cliente') => {
    const nome = email.split('@')[0] ?? 'Viajante';
    setUsuario({ nome, email, papel });
  }, []);

  const sair = useCallback(() => {
    if (SUPABASE.ativo && supabase) void supabase.auth.signOut();
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
