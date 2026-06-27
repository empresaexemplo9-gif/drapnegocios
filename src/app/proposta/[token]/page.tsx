import { notFound } from 'next/navigation';
import { propostaPorToken, moeda } from '@/lib/server/propostas';
import { BotaoImprimir } from '@/components/BotaoImprimir';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Proposta' };

export default async function PropostaPublicaPage({ params }: { params: { token: string } }) {
  const p = await propostaPorToken(params.token);
  if (!p) notFound();

  return (
    <div className="container-app py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="no-print selo bg-slate-100 text-slate-600">Proposta comercial</span>
          <BotaoImprimir />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <h1 className="text-2xl font-black text-tinta">{p.titulo}</h1>
              <p className="mt-1 text-sm text-slate-500">Emitida em {p.criadoEm}</p>
            </div>
            <div className="text-right">
              {p.fornecedorLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.fornecedorLogo} alt={p.fornecedor} className="ml-auto h-10 w-auto" />
              ) : (
                <p className="font-black text-tinta">{p.fornecedor}</p>
              )}
            </div>
          </div>

          {/* Partes */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">De</p>
              <p className="font-bold text-tinta">{p.fornecedor}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Para</p>
              <p className="font-bold text-tinta">{p.cliente}</p>
              {p.clienteEmail && <p className="text-sm text-slate-500">{p.clienteEmail}</p>}
            </div>
          </div>

          {/* Itens */}
          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                <th className="py-2">Item</th>
                <th className="py-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {p.itens.map((it, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 text-slate-700">{it.descricao}</td>
                  <td className="py-2 text-right font-semibold text-tinta">{moeda(it.valor)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="py-3 text-right font-black text-tinta">Total</td>
                <td className="py-3 text-right text-lg font-black text-marca-600">{moeda(p.total)}</td>
              </tr>
            </tfoot>
          </table>

          {p.validadeDias && (
            <p className="mt-4 text-sm text-slate-500">Validade da proposta: {p.validadeDias} dias.</p>
          )}
          {p.observacoes && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase text-slate-400">Observações</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{p.observacoes}</p>
            </div>
          )}

          <p className="mt-8 text-center text-xs text-slate-400">Gerado na DRAP Business</p>
        </div>
      </div>
    </div>
  );
}
