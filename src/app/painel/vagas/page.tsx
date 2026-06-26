import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obterContexto } from '@/lib/server/session';
import { pode, type Papel } from '@/lib/rbac';
import { minhasVagas, criarVaga, fecharVaga } from '@/lib/server/repos';

export const metadata = { title: 'Minhas vagas' };
export const dynamic = 'force-dynamic';

const NIVEIS = ['estagio', 'junior', 'pleno', 'senior', 'especialista'];
const CONTRATOS = ['CLT', 'PJ', 'FREELA', 'TEMPORARIO'];

export default async function MinhasVagasPage({
  searchParams,
}: {
  searchParams?: { ok?: string };
}) {
  const ctx = await obterContexto();
  if (!ctx) redirect('/entrar?proximo=/painel/vagas');
  const podeGerenciar = pode(ctx.papel as Papel, 'vagas:gerenciar');

  async function publicar(formData: FormData) {
    'use server';
    const atual = await obterContexto();
    if (!atual || !pode(atual.papel as Papel, 'vagas:gerenciar')) redirect('/entrar');
    await criarVaga(atual.tenantId, atual.userId, {
      titulo: String(formData.get('titulo') ?? '').trim(),
      descricao: String(formData.get('descricao') ?? '').trim(),
      area: String(formData.get('area') ?? '').trim(),
      regiao: String(formData.get('regiao') ?? '').trim(),
      habilidades: String(formData.get('habilidades') ?? ''),
      nivel: String(formData.get('nivel') ?? 'pleno'),
      tipoContrato: String(formData.get('tipoContrato') ?? 'CLT'),
    });
    redirect('/painel/vagas?ok=1');
  }

  async function encerrar(formData: FormData) {
    'use server';
    const atual = await obterContexto();
    if (!atual || !pode(atual.papel as Papel, 'vagas:gerenciar')) redirect('/entrar');
    await fecharVaga(atual.tenantId, String(formData.get('id') ?? ''));
    redirect('/painel/vagas');
  }

  const vagas = await minhasVagas(ctx.tenantId);

  return (
    <div className="container-app py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black tracking-tight text-tinta">Minhas vagas</h1>
        <Link href="/painel/prime" className="btn-secundario !py-2">
          Ranking de candidatos (IA)
        </Link>
      </div>

      {searchParams?.ok && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          Vaga publicada.
        </p>
      )}

      {!podeGerenciar && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          Seu papel ({ctx.papel}) não pode publicar vagas — somente visualizar.
        </p>
      )}

      {/* Lista de vagas */}
      <div className="mt-8 space-y-3">
        {vagas.length === 0 && (
          <p className="cartao text-sm text-slate-500">Nenhuma vaga ainda. Publique a primeira abaixo.</p>
        )}
        {vagas.map((v) => (
          <div key={v.id} className="cartao flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-tinta">{v.titulo}</h3>
              <p className="text-xs text-slate-500">
                <span className="capitalize">{v.status}</span> · {v.candidaturas} candidatura(s)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/painel/prime?vaga=${v.id}`}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-200"
              >
                Ver candidatos
              </Link>
              {podeGerenciar && v.status === 'aberta' && (
                <form action={encerrar}>
                  <input type="hidden" name="id" value={v.id} />
                  <button className="rounded-lg px-3 py-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-50">
                    Encerrar
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Publicar vaga */}
      {podeGerenciar && (
        <form action={publicar} className="cartao mt-8 grid gap-4 sm:grid-cols-2">
          <h2 className="font-bold text-tinta sm:col-span-2">Publicar nova vaga</h2>
          <Campo nome="titulo" rotulo="Título" />
          <Campo nome="area" rotulo="Área" />
          <Campo nome="regiao" rotulo="Região" />
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-500">Nível</span>
            <select name="nivel" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm capitalize">
              {NIVEIS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-500">Contrato</span>
            <select name="tipoContrato" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
              {CONTRATOS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-500">
              Habilidades exigidas (separadas por vírgula)
            </span>
            <input
              name="habilidades"
              required
              placeholder="Figma, Social Media, Branding"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-500">Descrição</span>
            <textarea
              name="descricao"
              required
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
            />
          </label>
          <div className="sm:col-span-2">
            <button className="btn-primario">Publicar vaga</button>
          </div>
        </form>
      )}
    </div>
  );
}

function Campo({ nome, rotulo }: { nome: string; rotulo: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-500">{rotulo}</span>
      <input
        name={nome}
        required
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
      />
    </label>
  );
}
