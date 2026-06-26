import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obterContexto } from '@/lib/server/session';
import { feedGlobal, criarPost } from '@/lib/server/feed';
import { Composer } from './Composer';
import { PostCard } from './PostCard';

export const metadata = { title: 'Feed' };
export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const ctx = await obterContexto();
  const posts = await feedGlobal();

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
    <div className="container-app py-12">
      <h1 className="text-3xl font-black tracking-tight text-tinta">Feed</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Publicações de empresas, profissionais e autônomos. Mostre seu trabalho, vagas, novidades e
        conecte-se.
      </p>

      <div className="mt-6">
        {ctx ? (
          <Composer acao={publicar} />
        ) : (
          <div className="cartao text-sm text-slate-600">
            <Link href="/entrar?proximo=/feed" className="font-semibold text-marca-600">
              Entre
            </Link>{' '}
            para publicar no feed.
          </div>
        )}
      </div>

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
