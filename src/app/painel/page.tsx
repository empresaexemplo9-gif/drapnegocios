import { redirect } from 'next/navigation';
import { usuarioAtual } from '@/lib/sessao';
import { atualizarPerfil, type Usuario } from '@/lib/usuarios';
import type { TipoPerfil } from '@/lib/dados';

export const metadata = { title: 'Meu painel' };

const tipos: TipoPerfil[] = ['pessoa', 'empresa', 'autonomo', 'produto'];

export default function PainelPage() {
  const usuario = usuarioAtual();
  if (!usuario) redirect('/entrar');

  async function salvar(formData: FormData) {
    'use server';
    const atual = usuarioAtual();
    if (!atual) redirect('/entrar');
    atualizarPerfil(atual.id, {
      tipo: String(formData.get('tipo') ?? 'pessoa') as TipoPerfil,
      areaAtuacao: String(formData.get('areaAtuacao') ?? ''),
      regiao: String(formData.get('regiao') ?? ''),
      bio: String(formData.get('bio') ?? ''),
    });
    redirect('/painel?salvo=1');
  }

  const u: Usuario = usuario;
  const completude = calcularCompletude(u);

  return (
    <div className="container-app py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-tinta">Olá, {u.nome.split(' ')[0]} 👋</h1>
          <p className="text-slate-500">{u.email}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-marca-600">{completude}%</div>
          <div className="text-xs font-semibold text-slate-400">perfil completo</div>
        </div>
      </div>

      <form action={salvar} className="cartao mt-8 grid gap-4 sm:grid-cols-2">
        <h2 className="font-bold text-tinta sm:col-span-2">Complete seu perfil</h2>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Tipo de perfil</span>
          <select
            name="tipo"
            defaultValue={u.perfil.tipo}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm capitalize outline-none focus:border-marca-500"
          >
            {tipos.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t}
              </option>
            ))}
          </select>
        </label>

        <Campo nome="areaAtuacao" rotulo="Área de atuação" valor={u.perfil.areaAtuacao} />
        <Campo nome="regiao" rotulo="Região" valor={u.perfil.regiao} />

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Bio</span>
          <textarea
            name="bio"
            defaultValue={u.perfil.bio}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
          />
        </label>

        <div className="sm:col-span-2">
          <button className="btn-primario">Salvar perfil</button>
        </div>
      </form>
    </div>
  );
}

function calcularCompletude(u: Usuario): number {
  const campos = [u.nome, u.email, u.perfil.areaAtuacao, u.perfil.regiao, u.perfil.bio];
  const preenchidos = campos.filter((c) => c && c.trim().length > 0).length;
  return Math.round((preenchidos / campos.length) * 100);
}

function Campo({ nome, rotulo, valor }: { nome: string; rotulo: string; valor: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-500">{rotulo}</span>
      <input
        name={nome}
        defaultValue={valor}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-100"
      />
    </label>
  );
}
