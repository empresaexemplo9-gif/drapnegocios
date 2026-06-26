import Link from 'next/link';
import { listarVitrine } from '@/lib/server/repos';

export const metadata = { title: 'Vitrine' };
export const dynamic = 'force-dynamic';

export default async function VitrinePage({
  searchParams,
}: {
  searchParams?: { q?: string; tipo?: string; categoria?: string; regiao?: string };
}) {
  const sp = searchParams ?? {};
  const itens = await listarVitrine({
    q: sp.q,
    tipo: sp.tipo,
    categoria: sp.categoria,
    regiao: sp.regiao,
  });

  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-black tracking-tight text-tinta">Vitrine e Marketplace</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Produtos e serviços de vendedores e prestadores da plataforma. Itens de planos{' '}
        <strong>Prime</strong> ganham destaque e maior alcance.
      </p>

      {/* Filtros */}
      <form method="get" className="cartao mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          name="q"
          defaultValue={sp.q ?? ''}
          placeholder="Buscar produto ou serviço…"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500 lg:col-span-2"
        />
        <select name="tipo" defaultValue={sp.tipo ?? ''} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
          <option value="">Produto e serviço</option>
          <option value="produto">Só produtos</option>
          <option value="servico">Só serviços</option>
        </select>
        <input
          name="categoria"
          defaultValue={sp.categoria ?? ''}
          placeholder="Categoria"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
        />
        <input
          name="regiao"
          defaultValue={sp.regiao ?? ''}
          placeholder="Região"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
        />
        <div className="sm:col-span-2 lg:col-span-5">
          <button className="btn-primario">Filtrar</button>
          {(sp.q || sp.tipo || sp.categoria || sp.regiao) && (
            <Link href="/vitrine" className="btn-secundario ml-2">
              Limpar
            </Link>
          )}
        </div>
      </form>

      {itens.length === 0 ? (
        <div className="cartao mt-8 text-center text-slate-500">
          Ainda não há itens na vitrine.{' '}
          <Link href="/painel/vitrine" className="font-semibold text-marca-600">
            Cadastre o primeiro →
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {itens.map((s) => (
            <div
              key={s.id}
              className={`cartao flex flex-col !p-0 overflow-hidden ${s.destaque ? 'ring-2 ring-marca-400' : ''}`}
            >
              {s.imagemUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.imagemUrl} alt={s.nome} className="h-40 w-full object-cover" />
              ) : (
                <div className="grid h-40 w-full place-items-center bg-gradient-to-br from-ink-900 to-ink-700 text-xs text-white/50">
                  {s.tipo === 'servico' ? 'Serviço' : 'Produto'}
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-tinta">{s.nome}</h3>
                  <p className="text-sm text-slate-500">por {s.vendedor}</p>
                </div>
                {s.destaque && (
                  <span className="selo shrink-0 bg-marca-600 text-white">{s.destaque}</span>
                )}
              </div>

              <p className="mt-3 flex-1 text-sm text-slate-600">{s.descricao}</p>

              <dl className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Preço</dt>
                  <dd className="font-bold text-marca-700">{s.preco}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Categoria</dt>
                  <dd className="font-semibold text-slate-700">{s.categoria}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Região</dt>
                  <dd className="font-semibold text-slate-700">{s.regiao}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Alcance</dt>
                  <dd className="font-semibold text-slate-700">{s.alcance}</dd>
                </div>
              </dl>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
