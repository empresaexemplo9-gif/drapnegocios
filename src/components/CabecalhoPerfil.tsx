import Link from 'next/link';

/**
 * Cabeçalho social (banner + foto + nome), no estilo das redes sociais.
 * Usado no topo do feed e do painel. Sem interatividade — só apresentação.
 */
export function CabecalhoPerfil({
  id,
  nome,
  avatarUrl,
  bannerUrl,
  subtitulo,
  acaoHref,
  acaoRotulo,
}: {
  id: string;
  nome: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  subtitulo?: string | null;
  acaoHref: string;
  acaoRotulo: string;
}) {
  return (
    <div className="superficie overflow-hidden rounded-2xl border border-ink-100">
      <div className="relative aspect-[29/10] w-full bg-gradient-to-br from-ink-900 to-ink-700">
        {bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
      </div>
      <div className="relative px-5 pb-4">
        <div className="absolute -top-9 left-5 h-[72px] w-[72px] overflow-hidden rounded-full border-4 border-white bg-marca-100">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={nome} className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center text-xl font-black text-marca-700">
              {nome.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-2 pt-10">
          <div>
            <Link href={`/perfil/${id}`} className="text-lg font-black text-tinta hover:text-marca-700">
              {nome}
            </Link>
            {subtitulo && <p className="text-xs text-slate-500">{subtitulo}</p>}
          </div>
          <Link href={acaoHref} className="btn-secundario !py-2">
            {acaoRotulo}
          </Link>
        </div>
      </div>
    </div>
  );
}
