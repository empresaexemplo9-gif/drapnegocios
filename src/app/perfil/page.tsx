import Link from 'next/link';
import { buscarPerfis } from '@/lib/server/repos';

export const metadata = { title: 'Buscar perfis' };
export const dynamic = 'force-dynamic';

const TIPOS = [
  { v: '', r: 'Todos os tipos' },
  { v: 'candidato', r: 'Candidato (busca trabalho)' },
  { v: 'empresa_contratante', r: 'Empresa' },
  { v: 'vendedor', r: 'Vendedor / Prestador' },
  { v: 'comprador', r: 'Comprador' },
];

const ROTULO_TIPO: Record<string, string> = {
  candidato: 'Candidato',
  empresa_contratante: 'Empresa',
  vendedor: 'Vendedor',
  comprador: 'Comprador',
};

export default async function PerfilDiretorioPage({
  searchParams,
}: {
  searchParams?: { q?: string; tipo?: string; area?: string; regiao?: string };
}) {
  const sp = searchParams ?? {};
  const perfis = await buscarPerfis({
    q: sp.q,
    tipoProfile: sp.tipo,
    area: sp.area,
    regiao: sp.regiao,
  });

  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-black tracking-tight text-tinta">Buscar perfis</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Encontre empresas, profissionais, vendedores e candidatos. Perfis Prime aparecem em
        destaque.
      </p>

      {/* Filtros (GET) */}
      <form method="get" className="cartao mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          name="q"
          defaultValue={sp.q ?? ''}
          placeholder="Buscar por nome, marca, palavra-chave…"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500 lg:col-span-2"
        />
        <select
          name="tipo"
          defaultValue={sp.tipo ?? ''}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
        >
          {TIPOS.map((t) => (
            <option key={t.v} value={t.v}>
              {t.r}
            </option>
          ))}
        </select>
        <input
          name="area"
          defaultValue={sp.area ?? ''}
          placeholder="Área (ex.: Design)"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
        />
        <input
          name="regiao"
          defaultValue={sp.regiao ?? ''}
          placeholder="Região (ex.: SP)"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
        />
        <div className="sm:col-span-2 lg:col-span-5">
          <button className="btn-primario">Buscar</button>
          {(sp.q || sp.tipo || sp.area || sp.regiao) && (
            <Link href="/perfil" className="btn-secundario ml-2">
              Limpar
            </Link>
          )}
        </div>
      </form>

      <p className="mt-6 text-sm text-slate-500">{perfis.length} perfil(is) encontrado(s).</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {perfis.map((p) => (
          <Link
            key={p.id}
            href={`/perfil/${p.id}`}
            className={`cartao block overflow-hidden !p-0 ${p.destaque ? 'ring-2 ring-marca-400' : ''}`}
          >
            <div className="relative h-24 bg-gradient-to-br from-ink-900 to-ink-700">
              {p.bannerUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.bannerUrl} alt="" className="h-full w-full object-cover" />
              )}
              {p.destaque && (
                <span className="selo absolute right-2 top-2 bg-marca-600 text-white">{p.destaque}</span>
              )}
              <div className="absolute -bottom-6 left-4 h-14 w-14 overflow-hidden rounded-full border-4 border-white bg-marca-100">
                {p.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.avatarUrl} alt={p.nome} className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center text-base font-black text-marca-700">
                    {p.nome.charAt(0)}
                  </span>
                )}
              </div>
            </div>
            <div className="px-4 pb-4 pt-8">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-tinta">{p.nome}</h3>
                <span className="selo bg-slate-100 text-slate-600">
                  {ROTULO_TIPO[p.tipoProfile] ?? p.tipoProfile}
                </span>
                <span className="selo bg-marca-50 text-marca-700">Score {p.score}</span>
              </div>
              {p.representa && <p className="text-xs text-marca-600">{p.representa}</p>}
              <p className="mt-1 text-sm text-slate-500">
                {p.areaAtuacao || '—'} · {p.regiao || '—'}
              </p>
              {p.bio && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{p.bio}</p>}
            </div>
          </Link>
        ))}
      </div>

      {perfis.length === 0 && (
        <div className="cartao mt-4 text-center text-slate-500">
          Nenhum perfil encontrado. Ajuste os filtros ou{' '}
          <Link href="/painel" className="font-semibold text-marca-600">
            complete seu perfil
          </Link>
          .
        </div>
      )}
    </div>
  );
}
