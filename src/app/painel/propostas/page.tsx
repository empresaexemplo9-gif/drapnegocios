import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obterContexto } from '@/lib/server/session';
import { listarPropostas, criarProposta, excluirProposta } from '@/lib/server/propostas';

export const metadata = { title: 'Propostas' };
export const dynamic = 'force-dynamic';

export default async function PropostasPage({ searchParams }: { searchParams?: { ok?: string } }) {
  const ctx = await obterContexto();
  if (!ctx) redirect('/entrar?proximo=/painel/propostas');

  async function criar(formData: FormData) {
    'use server';
    const a = await obterContexto();
    if (!a) redirect('/entrar');
    const token = await criarProposta(a.tenantId, a.userId, {
      clienteNome: String(formData.get('clienteNome') ?? '').trim(),
      clienteEmail: String(formData.get('clienteEmail') ?? '').trim(),
      titulo: String(formData.get('titulo') ?? '').trim(),
      itensTexto: String(formData.get('itensTexto') ?? ''),
      validadeDias: String(formData.get('validadeDias') ?? ''),
      observacoes: String(formData.get('observacoes') ?? '').trim(),
    });
    redirect(`/proposta/${token}`);
  }
  async function remover(formData: FormData) {
    'use server';
    const a = await obterContexto();
    if (!a) redirect('/entrar');
    await excluirProposta(a.tenantId, String(formData.get('token') ?? ''));
    redirect('/painel/propostas');
  }

  const propostas = await listarPropostas(ctx.tenantId);

  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-black tracking-tight text-tinta">Central de propostas</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Monte uma proposta, gere um <strong>link</strong> pro cliente e ele salva em <strong>PDF</strong>.
      </p>

      <div className="mt-6 space-y-2">
        {propostas.map((p) => (
          <div key={p.token} className="cartao flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-tinta">{p.titulo}</h3>
              <p className="text-xs text-slate-500">{p.cliente} · {p.total} · {p.criadoEm}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/proposta/${p.token}`} className="btn-secundario !py-2" target="_blank">
                Abrir / PDF
              </Link>
              <form action={remover}>
                <input type="hidden" name="token" value={p.token} />
                <button className="text-sm font-semibold text-rose-600">excluir</button>
              </form>
            </div>
          </div>
        ))}
        {propostas.length === 0 && <p className="cartao text-sm text-slate-500">Nenhuma proposta ainda.</p>}
      </div>

      <form action={criar} className="cartao mt-8 grid gap-4 sm:grid-cols-2">
        <h2 className="font-bold text-tinta sm:col-span-2">Nova proposta</h2>
        <Campo nome="titulo" rotulo="Título da proposta" />
        <Campo nome="validadeDias" rotulo="Validade (dias)" tipo="number" />
        <Campo nome="clienteNome" rotulo="Cliente" obrig />
        <Campo nome="clienteEmail" rotulo="E-mail do cliente" tipo="email" />
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-slate-500">
            Itens — um por linha, formato: <code>descrição | valor</code>
          </span>
          <textarea
            name="itensTexto"
            rows={4}
            required
            placeholder={'Identidade visual | 1800\nGestão de tráfego (mês) | 1500'}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Observações</span>
          <textarea name="observacoes" rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500" />
        </label>
        <div className="sm:col-span-2">
          <button className="btn-primario">Gerar proposta</button>
        </div>
      </form>
    </div>
  );
}

function Campo({ nome, rotulo, tipo = 'text', obrig = false }: { nome: string; rotulo: string; tipo?: string; obrig?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-500">{rotulo}</span>
      <input name={nome} type={tipo} required={obrig} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500" />
    </label>
  );
}
