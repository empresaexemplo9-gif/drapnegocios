import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obterContexto } from '@/lib/server/session';
import { carregarUsuario } from '@/lib/server/repos';
import { feedGlobal, criarPost } from '@/lib/server/feed';
import { Composer } from './Composer';
import { PostCard } from './PostCard';

export const metadata = { title: 'Feed' };
export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const ctx = await obterContexto();
  const [u, posts] = await Promise.all([
    ctx ? carregarUsuario(ctx.tenantId, ctx.userId) : Promise.resolve(null),
    feedGlobal(),
  ]);

  async function publicar(formData: FormData) {
    'use server';
    const atual = await obterContexto();
    if (!atual) redirect('/entrar?proximo=/feed');
    await criarPost(
      atual.userId,
      atual.tenantId,
      String(formData.get('texto') ?? ''),
      String(formData.get('imagemUrl') ?? '').trim(),
    );
    redirect('/feed');
  }

  return (
    <div className="container-app py-8">
      {/* Cabeçalho social (banner + foto) — como nas redes sociais */}
      {ctx && u ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="relative aspect-[29/10] w-full bg-gradient-to-br from-ink-900 to-ink-700">
            {u.perfil?.bannerUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={u.perfil.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            )}
          </div>
          <div className="relative px-5 pb-4">
            <div className="absolute -top-9 left-5 h-[72px] w-[72px] overflow-hidden rounded-full border-4 border-white bg-marca-100">
              {u.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u.avatarUrl} alt={u.nome} className="h-full w-full object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center text-xl font-black text-marca-700">
                  {u.nome.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-end justify-between gap-2 pt-10">
              <div>
                <Link href={`/perfil/${u.id}`} className="text-lg font-black text-tinta hover:text-marca-700">
                  {u.nome}
                </Link>
                <p className="text-xs text-slate-500">
                  {u.perfil?.areaAtuacao || u.email}
                </p>
              </div>
              <Link href="/painel" className="btn-secundario !py-2">
                Editar perfil
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-black tracking-tight text-tinta">Feed</h1>
          <p className="mt-2 text-slate-600">
            <Link href="/entrar?proximo=/feed" className="font-semibold text-marca-600">
              Entre
            </Link>{' '}
            para publicar e personalizar seu perfil.
          </p>
        </div>
      )}

      {ctx && (
        <div className="mt-6">
          <Composer acao={publicar} />
        </div>
      )}

      <div className="mt-6 grid gap-4">
        {posts.length === 0 && (
          <p className="cartao text-center text-sm text-slate-500">Ainda não há publicações.</p>
        )}
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
