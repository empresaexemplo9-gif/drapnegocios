import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obterContexto } from '@/lib/server/session';
import { pode, type Papel } from '@/lib/rbac';
import { obterPlano } from '@/lib/planos';
import { alcanceLabel, rotuloDestaque } from '@/lib/visibilidade';
import { meusProdutos, criarProduto, removerProduto } from '@/lib/server/repos';
import { UploadImagem } from '@/components/UploadImagem';

export const metadata = { title: 'Minha vitrine' };
export const dynamic = 'force-dynamic';

export default async function MinhaVitrinePage({
  searchParams,
}: {
  searchParams?: { ok?: string };
}) {
  const ctx = await obterContexto();
  if (!ctx) redirect('/entrar?proximo=/painel/vitrine');
  const podeGerenciar = pode(ctx.papel as Papel, 'produtos:gerenciar');
  const plano = obterPlano(ctx.plano as never);
  const destaque = rotuloDestaque(plano.chave);

  async function publicar(formData: FormData) {
    'use server';
    const atual = await obterContexto();
    if (!atual || !pode(atual.papel as Papel, 'produtos:gerenciar')) redirect('/entrar');
    await criarProduto(atual.tenantId, atual.userId, {
      nome: String(formData.get('nome') ?? '').trim(),
      descricao: String(formData.get('descricao') ?? '').trim(),
      tipo: String(formData.get('tipo') ?? 'produto'),
      categoria: String(formData.get('categoria') ?? '').trim(),
      preco: String(formData.get('preco') ?? ''),
      regiao: String(formData.get('regiao') ?? '').trim(),
      imagemUrl: String(formData.get('imagemUrl') ?? '').trim(),
    });
    redirect('/painel/vitrine?ok=1');
  }

  async function remover(formData: FormData) {
    'use server';
    const atual = await obterContexto();
    if (!atual || !pode(atual.papel as Papel, 'produtos:gerenciar')) redirect('/entrar');
    await removerProduto(atual.tenantId, String(formData.get('id') ?? ''));
    redirect('/painel/vitrine');
  }

  const itens = await meusProdutos(ctx.tenantId);

  return (
    <div className="container-app py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black tracking-tight text-tinta">Minha vitrine</h1>
        <Link href="/vitrine" className="btn-secundario !py-2">
          Ver vitrine pública
        </Link>
      </div>

      {/* Visibilidade atual */}
      <div className="cartao mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className={`selo ${plano.prime ? 'bg-marca-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {plano.nome}
          </span>
          <p className="mt-2 text-sm text-slate-600">
            {destaque
              ? `Seus itens aparecem com selo "${destaque}" e alcance ${alcanceLabel(plano.chave)}.`
              : 'No Free seus itens têm alcance local. Suba para o Prime para ganhar destaque e mais alcance.'}
          </p>
        </div>
        {!plano.prime && (
          <Link href="/planos" className="btn-primario !py-2">
            Aumentar visibilidade
          </Link>
        )}
      </div>

      {searchParams?.ok && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          Item publicado na vitrine.
        </p>
      )}

      {!podeGerenciar && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          Seu papel ({ctx.papel}) não pode cadastrar produtos.
        </p>
      )}

      {/* Lista */}
      <div className="mt-8 space-y-3">
        {itens.length === 0 && (
          <p className="cartao text-sm text-slate-500">Nenhum item ainda. Cadastre abaixo.</p>
        )}
        {itens.map((p) => (
          <div key={p.id} className="cartao flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-tinta">{p.nome}</h3>
              <p className="text-xs text-slate-500">
                <span className="capitalize">{p.status}</span> · {p.preco}
              </p>
            </div>
            {podeGerenciar && p.status === 'ativo' && (
              <form action={remover}>
                <input type="hidden" name="id" value={p.id} />
                <button className="rounded-lg px-3 py-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-50">
                  Remover
                </button>
              </form>
            )}
          </div>
        ))}
      </div>

      {/* Cadastrar */}
      {podeGerenciar && (
        <form action={publicar} className="cartao mt-8 grid gap-4 sm:grid-cols-2">
          <h2 className="font-bold text-tinta sm:col-span-2">Cadastrar produto ou serviço</h2>
          <Campo nome="nome" rotulo="Nome" />
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-500">Tipo</span>
            <select name="tipo" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
              <option value="produto">Produto</option>
              <option value="servico">Serviço</option>
            </select>
          </label>
          <Campo nome="categoria" rotulo="Categoria" />
          <Campo nome="preco" rotulo="Preço (R$) — vazio = sob consulta" obrig={false} />
          <Campo nome="regiao" rotulo="Região de atendimento" />
          <div className="sm:col-span-2">
            <UploadImagem name="imagemUrl" label="Imagem do produto/serviço" formato="item" />
          </div>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-500">Descrição</span>
            <textarea
              name="descricao"
              required
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
            />
          </label>
          <div className="sm:col-span-2">
            <button className="btn-primario">Publicar na vitrine</button>
          </div>
        </form>
      )}
    </div>
  );
}

function Campo({ nome, rotulo, obrig = true }: { nome: string; rotulo: string; obrig?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-500">{rotulo}</span>
      <input
        name={nome}
        required={obrig}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
      />
    </label>
  );
}
