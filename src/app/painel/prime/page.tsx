import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obterContexto } from '@/lib/server/session';
import { obterPlano, limiteCurriculos } from '@/lib/planos';
import {
  listarVagas,
  ranquearCandidatos,
  metricasPrime,
  type CandidatoRanqueado,
} from '@/lib/server/repos';

export const metadata = { title: 'Painel Prime' };

export default async function PainelPrimePage({
  searchParams,
}: {
  searchParams?: { vaga?: string };
}) {
  const ctx = await obterContexto();
  if (!ctx) redirect('/entrar?proximo=/painel/prime');

  const plano = obterPlano(ctx.plano as never);

  // Gate: Free não acessa o painel de visibilidade.
  if (!plano.prime) {
    return (
      <div className="container-app py-16">
        <div className="cartao mx-auto max-w-lg text-center">
          <span className="selo bg-marca-100 text-marca-700">Recurso Prime</span>
          <h1 className="mt-3 text-2xl font-black text-tinta">
            Desbloqueie a IA de classificação
          </h1>
          <p className="mt-2 text-slate-600">
            Assine o Prime para a IA ler e ranquear todos os currículos das suas vagas.
          </p>
          <Link href="/planos" className="btn-primario mt-6 inline-block">
            Ver planos Prime
          </Link>
        </div>
      </div>
    );
  }

  const vagas = await listarVagas(ctx.tenantId);
  const vagaSel = vagas.find((v) => v.id === searchParams?.vaga) ?? vagas[0];
  const ranking: CandidatoRanqueado[] = vagaSel
    ? await ranquearCandidatos(ctx.tenantId, vagaSel.id)
    : [];
  const metricas = await metricasPrime(ctx.tenantId);

  const analisados = Math.min(ranking.length, plano.curriculosMes);
  const visiveis = ranking.slice(0, analisados);

  // Métricas de visibilidade (derivadas do nível do plano para demonstração).
  const exibicoes = metricas.curriculosAnalisados * (40 + plano.nivel * 35);
  const cliques = Math.round(exibicoes * (0.06 + plano.nivel * 0.02));
  const ctr = exibicoes ? Math.round((cliques / exibicoes) * 1000) / 10 : 0;
  const roi = cliques * 12 - plano.preco;

  return (
    <div className="container-app py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="selo bg-marca-100 text-marca-700">{plano.nome}</span>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-tinta">
            Painel de visibilidade
          </h1>
          <p className="text-slate-500">{plano.alcance}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metrica
          rotulo="Currículos analisados"
          valor={String(metricas.curriculosAnalisados)}
          nota={`limite ${limiteCurriculos(plano)}/mês`}
        />
        <Metrica rotulo="Score médio" valor={String(metricas.scoreMedio)} nota="aderência à vaga" />
        <Metrica
          rotulo="Exibições × cliques"
          valor={`${exibicoes} · ${cliques}`}
          nota={`CTR ${ctr}%`}
        />
        <Metrica
          rotulo="ROI estimado"
          valor={roi.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          nota="no mês"
          positivo={roi >= 0}
        />
      </div>

      {vagas.length > 0 && (
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-500">Vaga analisada:</span>
          {vagas.map((v) => (
            <Link
              key={v.id}
              href={`/painel/prime?vaga=${v.id}`}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                v.id === vagaSel?.id
                  ? 'bg-marca-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {v.titulo}
            </Link>
          ))}
        </div>
      )}

      <h2 className="mt-8 text-xl font-black text-tinta">
        Talentos ranqueados pela IA {vagaSel ? `· ${vagaSel.titulo}` : ''}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        A IA avaliou aderência, experiência, certificações e referências. Análise{' '}
        {plano.profundidade}.
      </p>

      <div className="mt-5 space-y-3">
        {visiveis.length === 0 && (
          <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Ainda não há currículos classificados para esta vaga.
          </p>
        )}
        {visiveis.map((a, i) => (
          <div
            key={a.applicationId}
            className="cartao flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-marca-50 text-sm font-black text-marca-700">
                {i + 1}º
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-tinta">{a.nome}</h3>
                  {a.destaque && (
                    <span className="selo bg-marca-100 text-marca-700">{a.destaque}</span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {a.area} · {a.regiao}
                </p>
              </div>
            </div>

            <p className="flex-1 text-sm text-slate-600">{a.resumo}</p>

            <div className="flex items-center gap-3">
              <Barras criterios={a.criterios} />
              <div className="text-right">
                <div className="text-2xl font-black text-marca-600">{a.score}</div>
                <div className="text-[10px] font-semibold uppercase text-slate-400">score IA</div>
              </div>
            </div>
          </div>
        ))}
        {ranking.length > analisados && (
          <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
            +{ranking.length - analisados} currículo(s) além do limite do seu plano.{' '}
            <Link href="/planos" className="font-semibold text-marca-600">
              Aumente o alcance →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

function Metrica({
  rotulo,
  valor,
  nota,
  positivo,
}: {
  rotulo: string;
  valor: string;
  nota: string;
  positivo?: boolean;
}) {
  return (
    <div className="cartao">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{rotulo}</div>
      <div
        className={`mt-1 text-2xl font-black ${positivo === false ? 'text-rose-600' : 'text-tinta'}`}
      >
        {valor}
      </div>
      <div className="text-xs text-slate-500">{nota}</div>
    </div>
  );
}

function Barras({
  criterios,
}: {
  criterios: { aderencia: number; experiencia: number; certificacoes: number; referencias: number };
}) {
  const itens = [
    { rotulo: 'Aderência', v: criterios.aderencia, max: 40 },
    { rotulo: 'Experiência', v: criterios.experiencia, max: 25 },
    { rotulo: 'Certificações', v: criterios.certificacoes, max: 20 },
    { rotulo: 'Referências', v: criterios.referencias, max: 15 },
  ];
  return (
    <div className="hidden w-28 space-y-1 sm:block">
      {itens.map((it) => (
        <div key={it.rotulo} title={`${it.rotulo}: ${it.v}/${it.max}`}>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-marca-500"
              style={{ width: `${Math.min(100, Math.round((it.v / it.max) * 100))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
