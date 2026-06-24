import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obterContexto } from '@/lib/server/session';
import { assinarPlano } from '@/lib/server/repos';
import {
  listarPlanos,
  precoFormatado,
  limiteCurriculos,
  dePlanoDb,
  type ChavePlano,
} from '@/lib/planos';

export const metadata = { title: 'Planos e visibilidade' };

const TRIAL_DIAS = 7;

export default async function PlanosPage({
  searchParams,
}: {
  searchParams?: { ok?: string };
}) {
  const usuario = await obterContexto();
  const planos = listarPlanos();

  async function assinar(formData: FormData) {
    'use server';
    const atual = await obterContexto();
    if (!atual) redirect('/entrar?proximo=/planos');
    const chave = String(formData.get('plano') ?? 'free') as ChavePlano;
    const trial = String(formData.get('trial') ?? '') === '1';
    await assinarPlano(atual.tenantId, chave, trial ? TRIAL_DIAS : 0);
    redirect(`/painel/prime?ok=${trial ? 'trial' : 'assinado'}`);
  }

  return (
    <div className="container-app py-12">
      <span className="selo bg-marca-100 text-marca-700">Monetização por visibilidade</span>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-tinta sm:text-4xl">
        Apareça primeiro. Contrate com IA.
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        No plano <strong>Prime</strong>, a IA lê e classifica todos os currículos da sua vaga,
        entrega os melhores talentos proativamente e dá visibilidade direcionada aos seus produtos.
        Comece com <strong>{TRIAL_DIAS} dias grátis</strong>.
      </p>

      {searchParams?.ok && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          Plano atualizado com sucesso.
        </p>
      )}

      {/* Para quem é a visibilidade */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Publico
          titulo="Empresas que contratam"
          desc="A IA lê e ranqueia todos os currículos das suas vagas e entrega os melhores proativamente."
        />
        <Publico
          titulo="Vendedores e prestadores"
          desc="Seus produtos e serviços ganham selo de destaque e mais alcance na vitrine, por demanda."
        />
        <Publico
          titulo="Quem busca trabalho (CLT)"
          desc="Seu currículo aparece em destaque e melhor posicionado no ranking que as empresas veem."
        />
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-4 sm:grid-cols-2">
        {planos.map((p) => {
          const atual = usuario ? dePlanoDb(usuario.plano) === p.chave : false;
          return (
            <div
              key={p.chave}
              className={`cartao flex h-full flex-col ${
                p.destaque ? 'ring-2 ring-marca-500' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-black text-tinta">{p.nome}</h2>
                {p.destaque && (
                  <span className="selo bg-marca-600 text-white">Mais popular</span>
                )}
              </div>

              <div className="mt-3">
                <span className="text-3xl font-black text-tinta">{precoFormatado(p)}</span>
                {p.prime && <span className="text-sm text-slate-500"> /mês</span>}
              </div>
              <p className="mt-1 text-xs font-semibold text-marca-600">{p.alcance}</p>

              <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
                <li className="font-semibold text-slate-700">
                  {limiteCurriculos(p)} currículos/mês · análise {p.profundidade}
                </li>
                {p.recursos.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="text-marca-600">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {atual ? (
                  <span className="block rounded-lg bg-slate-100 px-4 py-2.5 text-center text-sm font-bold text-slate-500">
                    Seu plano atual
                  </span>
                ) : p.prime ? (
                  <form action={assinar} className="space-y-2">
                    <input type="hidden" name="plano" value={p.chave} />
                    <button name="trial" value="1" className="btn-primario w-full">
                      Testar {TRIAL_DIAS} dias grátis
                    </button>
                    <button
                      name="trial"
                      value="0"
                      className="btn-secundario w-full !py-2 text-sm"
                    >
                      Assinar agora
                    </button>
                  </form>
                ) : (
                  <form action={assinar}>
                    <input type="hidden" name="plano" value={p.chave} />
                    <button className="btn-secundario w-full">Usar o Free</button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Já é Prime?{' '}
        <Link href="/painel/prime" className="font-semibold text-marca-600">
          Abrir o painel de visibilidade →
        </Link>
      </p>
    </div>
  );
}

function Publico({ titulo, desc }: { titulo: string; desc: string }) {
  return (
    <div className="cartao">
      <h3 className="font-bold text-tinta">{titulo}</h3>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
    </div>
  );
}
