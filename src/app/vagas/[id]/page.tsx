import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { obterContexto } from '@/lib/server/session';
import { vagaPublicaPorId, candidatar } from '@/lib/server/repos';

export const dynamic = 'force-dynamic';

export default async function VagaDetalhePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { erro?: string; score?: string };
}) {
  const vaga = await vagaPublicaPorId(params.id);
  if (!vaga) notFound();

  const ctx = await obterContexto();

  async function aplicar(formData: FormData) {
    'use server';
    const atual = await obterContexto();
    if (!atual) redirect(`/entrar?proximo=/vagas/${params.id}`);
    const r = await candidatar(params.id, atual.userId, atual.nome ?? 'Candidato(a)', {
      habilidades: String(formData.get('habilidades') ?? ''),
      anosExperiencia: Number(formData.get('anosExperiencia') ?? 0) || 0,
      certificacoes: Number(formData.get('certificacoes') ?? 0) || 0,
      referencias: Number(formData.get('referencias') ?? 0) || 0,
      formacao: String(formData.get('formacao') ?? ''),
      curriculoUrl: String(formData.get('curriculoUrl') ?? ''),
    });
    if (!r.ok) redirect(`/vagas/${params.id}?erro=${encodeURIComponent(r.erro ?? 'Falha')}`);
    redirect(`/vagas/${params.id}?score=${r.score}`);
  }

  return (
    <div className="container-app py-12">
      <Link href="/vagas" className="text-sm font-semibold text-marca-600">
        ← Todas as vagas
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-tinta">{vaga.titulo}</h1>
          <p className="mt-1 text-slate-500">
            {vaga.empresa} · {vaga.area} · {vaga.regiao}
          </p>
          <span className="selo mt-2 bg-slate-100 capitalize text-slate-600">
            {vaga.tipoContrato} · {vaga.nivel}
          </span>
        </div>
      </div>

      <p className="mt-5 max-w-2xl whitespace-pre-line text-slate-700">{vaga.descricao}</p>

      {vaga.habilidades.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {vaga.habilidades.map((h) => (
            <span key={h} className="selo bg-marca-50 text-marca-700">
              {h}
            </span>
          ))}
        </div>
      )}

      {searchParams?.score && (
        <p className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          Candidatura enviada! A IA avaliou seu currículo com score{' '}
          <strong>{searchParams.score}/100</strong>. A empresa já vê você no ranking.
        </p>
      )}
      {searchParams?.erro && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {searchParams.erro}
        </p>
      )}

      {/* Formulário de candidatura */}
      <div className="cartao mt-8 max-w-2xl">
        <h2 className="font-bold text-tinta">Candidatar-se</h2>
        {!ctx && (
          <p className="mt-1 text-sm text-slate-500">
            Você precisa{' '}
            <Link href={`/entrar?proximo=/vagas/${params.id}`} className="font-semibold text-marca-600">
              entrar
            </Link>{' '}
            para se candidatar. A IA usa estes dados para pontuar sua aderência.
          </p>
        )}
        <form action={aplicar} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-500">
              Habilidades (separadas por vírgula)
            </span>
            <input
              name="habilidades"
              placeholder="Figma, Social Media, Branding"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
            />
          </label>
          <Campo nome="anosExperiencia" rotulo="Anos de experiência" tipo="number" />
          <Campo nome="formacao" rotulo="Formação" tipo="text" />
          <Campo nome="certificacoes" rotulo="Nº de certificações" tipo="number" />
          <Campo nome="referencias" rotulo="Nº de referências" tipo="number" />
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-500">
              Link do currículo (opcional)
            </span>
            <input
              name="curriculoUrl"
              placeholder="https://…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
            />
          </label>
          <div className="sm:col-span-2">
            <button className="btn-primario w-full sm:w-auto">Enviar candidatura</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Campo({ nome, rotulo, tipo }: { nome: string; rotulo: string; tipo: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-500">{rotulo}</span>
      <input
        name={nome}
        type={tipo}
        min={tipo === 'number' ? 0 : undefined}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
      />
    </label>
  );
}
