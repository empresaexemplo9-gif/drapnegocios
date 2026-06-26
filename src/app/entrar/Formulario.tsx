'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getProviders } from 'next-auth/react';
import { politicaSenha } from '@/lib/password-policy';

export function Formulario() {
  const router = useRouter();
  const [sociais, setSociais] = useState<string[]>([]);

  // Pergunta ao servidor (em tempo real) quais provedores sociais estão ativos.
  useEffect(() => {
    getProviders()
      .then((p) => {
        if (!p) return;
        setSociais(
          Object.values(p)
            .map((x) => x.id)
            .filter((id) => id !== 'credentials'),
        );
      })
      .catch(() => setSociais([]));
  }, []);
  const params = useSearchParams();
  const proximo = params.get('proximo') ?? '/painel';
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    const f = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      redirect: false,
      email: String(f.get('email')),
      senha: String(f.get('senha')),
      tenantSlug: String(f.get('tenantSlug') || ''),
    });
    setCarregando(false);
    if (res?.error) setErro(res.error.includes('negócio') ? res.error : 'E-mail ou senha inválidos.');
    else router.push(proximo);
  }

  async function cadastrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro('');
    const f = new FormData(e.currentTarget);
    const senha = String(f.get('senha'));
    const checa = politicaSenha(senha);
    if (!checa.ok) {
      setErro(checa.erros.join(' '));
      return;
    }
    setCarregando(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        nome: String(f.get('nome')),
        email: String(f.get('email')),
        senha,
        nomeEmpresa: String(f.get('nomeEmpresa') || ''),
        tipoPerfil: String(f.get('tipoPerfil') || 'empresa'),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setCarregando(false);
      setErro(data?.erro ?? 'Não foi possível cadastrar.');
      return;
    }
    // Cadastro cria o tenant; já autentica em seguida.
    await signIn('credentials', {
      redirect: false,
      email: String(f.get('email')),
      senha,
      tenantSlug: data.tenantSlug ?? '',
    });
    setCarregando(false);
    router.push('/painel');
  }

  return (
    <div className="container-app py-12">
      <div className="mx-auto max-w-md">
        <h1 className="text-center text-3xl font-black tracking-tight text-tinta">Acessar a DRAP</h1>
        <p className="mt-2 text-center text-slate-600">
          Entre na sua conta ou crie um novo negócio na plataforma.
        </p>

        {erro && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {erro}
          </p>
        )}

        {sociais.length > 0 && (
          <div className="mt-6 grid gap-2">
            {sociais.includes('google') && (
              <button
                onClick={() => signIn('google', { callbackUrl: proximo })}
                className="btn-secundario w-full"
                type="button"
              >
                Entrar com Google
              </button>
            )}
            {sociais.includes('linkedin') && (
              <button
                onClick={() => signIn('linkedin', { callbackUrl: proximo })}
                className="btn-secundario w-full"
                type="button"
              >
                Entrar com LinkedIn
              </button>
            )}
          </div>
        )}

        <form onSubmit={entrar} className="cartao mt-6 space-y-3">
          <h2 className="font-bold text-tinta">Entrar</h2>
          <Campo nome="tenantSlug" tipo="text" rotulo="Empresa (slug) — opcional" opcional />
          <Campo nome="email" tipo="email" rotulo="E-mail" />
          <Campo nome="senha" tipo="password" rotulo="Senha" />
          <button disabled={carregando} className="btn-primario w-full">
            {carregando ? 'Entrando…' : 'Entrar'}
          </button>
          <p className="text-center text-xs text-slate-400">
            Primeiro acesso? Crie seu negócio no formulário abaixo.
          </p>
        </form>

        <form onSubmit={cadastrar} className="cartao mt-4 space-y-3">
          <h2 className="font-bold text-tinta">Criar novo negócio</h2>
          <Campo nome="nomeEmpresa" tipo="text" rotulo="Nome da empresa" />
          <Campo nome="nome" tipo="text" rotulo="Seu nome" />
          <Campo nome="email" tipo="email" rotulo="E-mail" />
          <Campo nome="senha" tipo="password" rotulo="Senha (8+, maiúscula, número, especial)" />
          <button disabled={carregando} className="btn-secundario w-full">
            Criar conta e empresa
          </button>
        </form>
      </div>
    </div>
  );
}

function Campo({
  nome,
  tipo,
  rotulo,
  valor,
  opcional,
}: {
  nome: string;
  tipo: string;
  rotulo: string;
  valor?: string;
  opcional?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-500">{rotulo}</span>
      <input
        name={nome}
        type={tipo}
        defaultValue={valor}
        required={!opcional}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-100"
      />
    </label>
  );
}
