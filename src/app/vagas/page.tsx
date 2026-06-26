import Link from 'next/link';
import { listarVagasPublicas } from '@/lib/server/repos';

export const metadata = { title: 'Banco de Vagas' };
export const dynamic = 'force-dynamic';

export default async function VagasPage() {
  const vagas = await listarVagasPublicas();

  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-black tracking-tight text-tinta">Banco de Vagas e Talentos</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Vagas abertas publicadas pelas empresas da plataforma. Ao se candidatar, a{' '}
        <strong>IA classifica seu currículo</strong> por aderência, experiência, certificações e
        referências.
      </p>

      {vagas.length === 0 ? (
        <div className="cartao mt-8 text-center text-slate-500">
          Ainda não há vagas abertas.{' '}
          <Link href="/painel/vagas" className="font-semibold text-marca-600">
            Publique a primeira →
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {vagas.map((v) => (
            <div key={v.id} className="cartao">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-tinta">{v.titulo}</h3>
                    <span className="selo bg-slate-100 capitalize text-slate-600">
                      {v.tipoContrato} · {v.nivel}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {v.empresa} · {v.area} · {v.regiao}
                  </p>
                </div>
                <Link href={`/vagas/${v.id}`} className="btn-primario !px-4 !py-2">
                  Ver e candidatar
                </Link>
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-slate-600">{v.descricao}</p>

              {v.habilidades.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {v.habilidades.map((h) => (
                    <span key={h} className="selo bg-marca-50 text-marca-700">
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
