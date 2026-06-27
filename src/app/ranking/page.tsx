import Link from 'next/link';
import { ranking } from '@/lib/server/engajamento';

export const metadata = { title: 'Ranking' };
export const dynamic = 'force-dynamic';

const MEDALHA = ['🥇', '🥈', '🥉'];

export default async function RankingPage() {
  const lista = await ranking();

  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-black tracking-tight text-tinta">Ranking de engajamento</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Quem mais movimenta a plataforma — publica, contrata, vende, conecta. Pontos por atividade
        real; assinantes Prime ganham bônus.
      </p>

      <div className="mt-6 space-y-2">
        {lista.map((u, i) => (
          <Link
            key={u.id}
            href={`/perfil/${u.id}`}
            className={`cartao flex items-center gap-3 !py-3 ${i < 3 ? 'ring-1 ring-marca-200' : ''}`}
          >
            <span className="w-8 shrink-0 text-center text-lg font-black text-slate-400">
              {MEDALHA[i] ?? i + 1}
            </span>
            <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-marca-100">
              {u.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u.avatarUrl} alt={u.nome} className="h-full w-full object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center font-black text-marca-700">
                  {u.nome.charAt(0)}
                </span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-bold text-tinta">{u.nome}</p>
                {u.destaque && <span className="selo bg-marca-100 text-marca-700">{u.destaque}</span>}
              </div>
              {u.area && <p className="truncate text-xs text-slate-500">{u.area}</p>}
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-marca-600">{u.pontos}</div>
              <div className="text-[10px] font-semibold uppercase text-slate-400">pontos</div>
            </div>
          </Link>
        ))}
        {lista.length === 0 && (
          <p className="cartao text-center text-sm text-slate-500">
            Sem atividade ainda. Publique, candidate-se, conecte — e suba no ranking.
          </p>
        )}
      </div>
    </div>
  );
}
