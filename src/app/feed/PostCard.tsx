import Link from 'next/link';
import type { PostView } from '@/lib/server/feed';

function quando(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  return d.toLocaleDateString('pt-BR');
}

export function PostCard({ post }: { post: PostView }) {
  return (
    <div className="cartao">
      <div className="flex items-center gap-3">
        <Link
          href={`/perfil/${post.autorId}`}
          className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-marca-100"
        >
          {post.autorAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.autorAvatar} alt={post.autorNome} className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center font-black text-marca-700">
              {post.autorNome.charAt(0)}
            </span>
          )}
        </Link>
        <div>
          <Link href={`/perfil/${post.autorId}`} className="font-bold text-tinta hover:text-marca-700">
            {post.autorNome}
          </Link>
          <p className="text-xs text-slate-400">{quando(post.criadoEm)}</p>
        </div>
      </div>

      {post.texto && (
        <p className="mt-3 whitespace-pre-wrap break-words text-slate-700">{post.texto}</p>
      )}
      {post.imagemUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.imagemUrl} alt="" className="mt-3 w-full rounded-xl border border-slate-200 object-cover" />
      )}
    </div>
  );
}
