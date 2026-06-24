import { redirect } from 'next/navigation';
import { autenticar, registrar } from '@/lib/usuarios';
import { criarSessao } from '@/lib/sessao';

export const metadata = { title: 'Entrar' };

export default function EntrarPage({ searchParams }: { searchParams: { erro?: string } }) {
  async function acaoEntrar(formData: FormData) {
    'use server';
    const email = String(formData.get('email') ?? '');
    const senha = String(formData.get('senha') ?? '');
    try {
      const u = autenticar(email, senha);
      criarSessao(u.id);
    } catch (e) {
      redirect(`/entrar?erro=${encodeURIComponent((e as Error).message)}`);
    }
    redirect('/painel');
  }

  async function acaoRegistrar(formData: FormData) {
    'use server';
    const nome = String(formData.get('nome') ?? '');
    const email = String(formData.get('email') ?? '');
    const senha = String(formData.get('senha') ?? '');
    if (nome.trim().length < 2 || senha.length < 6) {
      redirect('/entrar?erro=' + encodeURIComponent('Informe nome e uma senha de 6+ caracteres.'));
    }
    try {
      const u = registrar(nome, email, senha);
      criarSessao(u.id);
    } catch (e) {
      redirect(`/entrar?erro=${encodeURIComponent((e as Error).message)}`);
    }
    redirect('/painel');
  }

  return (
    <div className="container-app py-12">
      <div className="mx-auto max-w-md">
        <h1 className="text-center text-3xl font-black tracking-tight text-tinta">Acessar a DRAP</h1>
        <p className="mt-2 text-center text-slate-600">
          Entre na sua conta ou crie uma nova para montar seu perfil.
        </p>

        {searchParams.erro && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {searchParams.erro}
          </p>
        )}

        <form action={acaoEntrar} className="cartao mt-6 space-y-3">
          <h2 className="font-bold text-tinta">Entrar</h2>
          <Campo nome="email" tipo="email" rotulo="E-mail" />
          <Campo nome="senha" tipo="password" rotulo="Senha" />
          <button className="btn-primario w-full">Entrar</button>
        </form>

        <form action={acaoRegistrar} className="cartao mt-4 space-y-3">
          <h2 className="font-bold text-tinta">Criar conta</h2>
          <Campo nome="nome" tipo="text" rotulo="Nome" />
          <Campo nome="email" tipo="email" rotulo="E-mail" />
          <Campo nome="senha" tipo="password" rotulo="Senha (mín. 6)" />
          <button className="btn-secundario w-full">Criar conta</button>
        </form>
      </div>
    </div>
  );
}

function Campo({ nome, tipo, rotulo }: { nome: string; tipo: string; rotulo: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-500">{rotulo}</span>
      <input
        name={nome}
        type={tipo}
        required
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-100"
      />
    </label>
  );
}
