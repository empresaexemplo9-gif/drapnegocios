import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { destinoPorSlug, captarPorSlug, TIPOS_LEAD, normalizarTipo } from '@/lib/server/crm';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const d = await destinoPorSlug(params.slug);
  return { title: d ? `Fale com ${d.nome}` : 'Captação' };
}

export default async function CapturaPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { ok?: string; tipo?: string };
}) {
  const destino = await destinoPorSlug(params.slug);
  if (!destino) notFound();

  async function enviar(formData: FormData) {
    'use server';
    const nome = String(formData.get('nome') ?? '').trim();
    if (!nome) redirect(`/c/${params.slug}`);
    await captarPorSlug(params.slug, {
      nome,
      email: String(formData.get('email') ?? '').trim(),
      telefone: String(formData.get('telefone') ?? '').trim(),
      tipo: normalizarTipo(formData.get('tipo')),
      descricao: String(formData.get('descricao') ?? '').trim(),
      valor: String(formData.get('valor') ?? ''),
    });
    redirect(`/c/${params.slug}?ok=1`);
  }

  if (searchParams?.ok) {
    return (
      <div className="container-app py-16">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-2xl">✓</div>
          <h1 className="mt-4 text-2xl font-black text-tinta">Recebido! 🎉</h1>
          <p className="mt-2 text-slate-600">
            Seu contato foi enviado para <strong>{destino.nome}</strong>. Em breve retornam para você.
          </p>
          <Link href={`/c/${params.slug}`} className="btn-secundario mt-6 inline-block">
            Enviar outro contato
          </Link>
        </div>
      </div>
    );
  }

  const tipoInicial = normalizarTipo(searchParams?.tipo);

  return (
    <div className="container-app py-12">
      <div className="mx-auto max-w-lg">
        <p className="text-sm font-semibold text-marca-600">Solicitar contato</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-tinta">Fale com {destino.nome}</h1>
        <p className="mt-2 text-slate-600">
          Preencha e receba retorno. Diga o que você precisa — serviço, produto, orçamento, parceria
          ou agendamento.
        </p>

        <form action={enviar} className="cartao mt-6 grid gap-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-500">Seu nome *</span>
            <input
              name="nome"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-500">E-mail</span>
              <input
                name="email"
                type="email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-500">Telefone / WhatsApp</span>
              <input
                name="telefone"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-500">Tipo de interesse</span>
            <select
              name="tipo"
              defaultValue={tipoInicial}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
            >
              {TIPOS_LEAD.map((t) => (
                <option key={t.v} value={t.v}>
                  {t.r}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-500">O que você precisa?</span>
            <textarea
              name="descricao"
              rows={3}
              placeholder="Descreva o serviço, produto ou pedido…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
            />
          </label>
          <button className="btn-primario">Enviar contato</button>
          <p className="text-center text-[11px] text-slate-400">
            Seus dados vão direto para {destino.nome}. Sem cadastro necessário.
          </p>
        </form>
      </div>
    </div>
  );
}
