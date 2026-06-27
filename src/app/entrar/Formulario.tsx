'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getProviders } from 'next-auth/react';
import { politicaSenha } from '@/lib/password-policy';

/** Tipos de perfil escolhíveis no cadastro → mapeiam para os campos do banco. */
const TIPOS_CADASTRO = [
  { v: 'empresa', label: 'Empresa', tipoPerfil: 'empresa', tipoProfile: 'empresa_contratante' },
  { v: 'candidato', label: 'Profissional / Candidato (busco trabalho)', tipoPerfil: 'pessoa_fisica', tipoProfile: 'candidato' },
  { v: 'vendedor', label: 'Vendedor / Prestador de serviço', tipoPerfil: 'autonomo', tipoProfile: 'vendedor' },
  { v: 'comprador', label: 'Comprador', tipoPerfil: 'pessoa_fisica', tipoProfile: 'comprador' },
] as const;

export function Formulario() {
  const router = useRouter();
  const params = useSearchParams();
  const proximo = params.get('proximo') ?? '/painel';
  const [aba, setAba] = useState<'entrar' | 'criar'>(params.get('aba') === 'criar' ? 'criar' : 'entrar');
  const [sociais, setSociais] = useState<string[]>([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Pergunta ao servidor quais provedores sociais estão ativos.
  useEffect(() => {
    getProviders()
      .then((p) => {
        if (!p) return;
        setSociais(Object.values(p).map((x) => x.id).filter((id) => id !== 'credentials'));
      })
      .catch(() => setSociais([]));
  }, []);

  function trocarAba(nova: 'entrar' | 'criar') {
    setAba(nova);
    setErro('');
  }

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
    const escolhido = TIPOS_CADASTRO.find((t) => t.v === String(f.get('tipoCadastro'))) ?? TIPOS_CADASTRO[0];
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        nome: String(f.get('nome')),
        email: String(f.get('email')),
        senha,
        nomeEmpresa: String(f.get('nomeEmpresa') || ''),
        tipoPerfil: escolhido.tipoPerfil,
        tipoProfile: escolhido.tipoProfile,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setCarregando(false);
      setErro(data?.erro ?? 'Não foi possível cadastrar.');
      return;
    }
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
        <h1 className="text-center text-3xl font-black tracking-tight text-tinta">
          {aba === 'entrar' ? 'Entrar na DRAP' : 'Criar conta'}
        </h1>

        {/* Abas: separa login de cadastro */}
        <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => trocarAba('entrar')}
            className={`rounded-lg py-2 text-sm font-bold transition ${
              aba === 'entrar' ? 'bg-white text-marca-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => trocarAba('criar')}
            className={`rounded-lg py-2 text-sm font-bold transition ${
              aba === 'criar' ? 'bg-white text-marca-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            Criar conta
          </button>
        </div>

        {erro && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{erro}</p>
        )}

        {sociais.length > 0 && (
          <div className="mt-4 grid gap-2">
            {sociais.includes('google') && (
              <button onClick={() => signIn('google', { callbackUrl: proximo })} className="btn-secundario w-full" type="button">
                Continuar com Google
              </button>
            )}
            {sociais.includes('linkedin') && (
              <button onClick={() => signIn('linkedin', { callbackUrl: proximo })} className="btn-secundario w-full" type="button">
                Continuar com LinkedIn
              </button>
            )}
            <div className="my-1 text-center text-xs text-slate-400">ou com e-mail</div>
          </div>
        )}

        {/* PAINEL DE LOGIN */}
        {aba === 'entrar' && (
          <form onSubmit={entrar} className="cartao mt-4 space-y-3">
            <Campo nome="email" tipo="email" rotulo="E-mail" />
            <Campo nome="senha" tipo="password" rotulo="Senha" />
            <Campo nome="tenantSlug" tipo="text" rotulo="Empresa (slug) — opcional" opcional />
            <button disabled={carregando} className="btn-primario w-full">
              {carregando ? 'Entrando…' : 'Entrar'}
            </button>
            <p className="text-center text-xs text-slate-400">
              Não tem conta?{' '}
              <button type="button" onClick={() => trocarAba('criar')} className="font-semibold text-marca-600">
                Criar conta
              </button>
            </p>
          </form>
        )}

        {/* PAINEL DE CRIAÇÃO DE CONTA */}
        {aba === 'criar' && (
          <form onSubmit={cadastrar} className="cartao mt-4 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-500">Tipo de perfil</span>
              <select
                name="tipoCadastro"
                defaultValue="empresa"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
              >
                {TIPOS_CADASTRO.map((t) => (
                  <option key={t.v} value={t.v}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <Campo nome="nome" tipo="text" rotulo="Seu nome" />
            <Campo nome="nomeEmpresa" tipo="text" rotulo="Nome do negócio/marca (opcional)" opcional />
            <Campo nome="email" tipo="email" rotulo="E-mail" />
            <Campo nome="senha" tipo="password" rotulo="Senha (8+, maiúscula, número, especial)" />
            <button disabled={carregando} className="btn-primario w-full">
              {carregando ? 'Criando…' : 'Criar conta'}
            </button>
            <p className="text-center text-xs text-slate-400">
              Já tem conta?{' '}
              <button type="button" onClick={() => trocarAba('entrar')} className="font-semibold text-marca-600">
                Entrar
              </button>
            </p>
          </form>
        )}
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
