import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { perfilPublicoPorId, itensDoPerfil } from '@/lib/server/repos';
import { obterContexto } from '@/lib/server/session';
import { iniciarConversaPorId } from '@/lib/server/chat';

export const dynamic = 'force-dynamic';

const ROTULO_TIPO: Record<string, string> = {
  candidato: 'Candidato',
  empresa_contratante: 'Empresa',
  vendedor: 'Vendedor / Prestador',
  comprador: 'Comprador',
};

export default async function PerfilPublicoPage({ params }: { params: { id: string } }) {
  const p = await perfilPublicoPorId(params.id);
  if (!p) notFound();
  const { produtos, vagas } = await itensDoPerfil(params.id);
  const ctx = await obterContexto();
  const souEu = ctx?.userId === params.id;

  async function conversar() {
    'use server';
    const atual = await obterContexto();
    if (!atual) redirect(`/entrar?proximo=/perfil/${params.id}`);
    const id = await iniciarConversaPorId(atual.userId, params.id);
    redirect(id ? `/painel/chat/${id}` : '/painel/chat');
  }

  return (
    <div className="container-app py-8">
      <Link href="/perfil" className="text-sm font-semibold text-marca-600">
        ← Buscar perfis
      </Link>

      {/* Banner + avatar */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
        {/* Banner adaptável (~2.9:1, cobre 1750×570 até 1900×680) */}
        <div className="relative aspect-[29/10] w-full bg-gradient-to-br from-ink-900 to-ink-700">
          {p.bannerUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          {p.destaque && (
            <span className="selo absolute right-3 top-3 bg-marca-600 text-white">{p.destaque}</span>
          )}
        </div>
        <div className="relative px-5 pb-5">
          <div className="absolute -top-10 left-5 h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-marca-100">
            {p.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.avatarUrl} alt={p.nome} className="h-full w-full object-cover" />
            ) : (
              <span className="grid h-full w-full place-items-center text-2xl font-black text-marca-700">
                {p.nome.charAt(0)}
              </span>
            )}
          </div>
          <div className="pt-12">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-tinta">{p.nome}</h1>
                <span className="selo bg-slate-100 text-slate-600">
                  {ROTULO_TIPO[p.tipoProfile] ?? p.tipoProfile}
                </span>
              </div>
              {!souEu && (
                <form action={conversar}>
                  <button className="btn-primario !py-2">Conversar</button>
                </form>
              )}
            </div>
            {p.representa && <p className="text-sm font-semibold text-marca-600">{p.representa}</p>}
            <p className="mt-1 text-sm text-slate-500">
              {p.areaAtuacao || '—'} · {p.regiao || '—'}
            </p>
            {p.bio && <p className="mt-4 max-w-2xl whitespace-pre-line text-slate-700">{p.bio}</p>}
          </div>
        </div>
      </div>

      {/* Produtos / serviços do perfil */}
      {produtos.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-black text-tinta">Vitrine</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {produtos.map((s) => (
              <div key={s.id} className="cartao">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-tinta">{s.nome}</h3>
                  <span className="selo bg-slate-100 capitalize text-slate-600">{s.tipo}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{s.descricao}</p>
                <p className="mt-3 text-sm font-bold text-marca-700">{s.preco}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Vagas do perfil */}
      {vagas.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-black text-tinta">Vagas abertas</h2>
          <div className="mt-4 space-y-3">
            {vagas.map((v) => (
              <Link key={v.id} href={`/vagas/${v.id}`} className="cartao block">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-tinta">{v.titulo}</h3>
                  <span className="selo bg-slate-100 capitalize text-slate-600">
                    {v.tipoContrato} · {v.nivel}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {v.area} · {v.regiao}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
