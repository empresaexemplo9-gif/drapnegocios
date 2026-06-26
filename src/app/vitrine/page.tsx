import Link from 'next/link';
import { listarVitrine } from '@/lib/server/repos';

export const metadata = { title: 'Vitrine' };
export const dynamic = 'force-dynamic';

export default async function VitrinePage() {
  const itens = await listarVitrine();

  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-black tracking-tight text-tinta">Vitrine e Marketplace</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Produtos e serviços de vendedores e prestadores da plataforma. Itens de planos{' '}
        <strong>Prime</strong> ganham destaque e maior alcance.
      </p>

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
              className={`cartao flex flex-col ${s.destaque ? 'ring-2 ring-marca-400' : ''}`}
            >
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
          ))}
        </div>
      )}
    </div>
  );
}
