'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';

/**
 * Zona de perigo: exclusão self-service da conta. Pede confirmação por e-mail,
 * chama DELETE /api/conta e, ao concluir, encerra a sessão e volta para a home.
 */
export function ExcluirContaBotao({
  email,
  apagaNegocio,
}: {
  email: string;
  apagaNegocio: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [valor, setValor] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const confere = valor.trim().toLowerCase() === email.toLowerCase();

  async function excluir() {
    if (!confere || carregando) return;
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch('/api/conta', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmacao: valor.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { erro?: string } | null;
        setErro(data?.erro ?? 'Não foi possível excluir a conta.');
        setCarregando(false);
        return;
      }
      // Conta apagada → encerra a sessão e volta para a home.
      await signOut({ callbackUrl: '/?conta=excluida' });
    } catch {
      setErro('Falha de conexão. Tente novamente.');
      setCarregando(false);
    }
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="btn-secundario !border-rose-300 !text-rose-700 hover:!border-rose-400 hover:!bg-rose-50"
      >
        Excluir minha conta
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4">
      <p className="text-sm font-semibold text-rose-800">
        {apagaNegocio
          ? 'Você é o único usuário deste negócio. Excluir sua conta apaga o NEGÓCIO inteiro e todos os dados (vagas, produtos, propostas, clientes, etc.). Esta ação não pode ser desfeita.'
          : 'Excluir sua conta remove seu perfil e seus dados pessoais deste negócio. Esta ação não pode ser desfeita.'}
      </p>

      <label className="mt-3 block">
        <span className="mb-1 block text-xs font-semibold text-rose-700">
          Para confirmar, digite seu e-mail (<strong>{email}</strong>):
        </span>
        <input
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          autoComplete="off"
          placeholder={email}
          className="w-full rounded-lg border border-rose-300 px-3 py-2.5 text-sm outline-none focus:border-rose-500"
        />
      </label>

      {erro && <p className="mt-2 text-sm font-semibold text-rose-700">{erro}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={excluir}
          disabled={!confere || carregando}
          className="btn-primario !bg-rose-600 hover:!bg-rose-700 disabled:cursor-not-allowed disabled:!opacity-50"
        >
          {carregando ? 'Excluindo…' : 'Excluir permanentemente'}
        </button>
        <button
          type="button"
          onClick={() => {
            setAberto(false);
            setValor('');
            setErro(null);
          }}
          className="btn-secundario"
          disabled={carregando}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
