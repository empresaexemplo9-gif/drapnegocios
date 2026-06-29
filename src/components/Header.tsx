import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server/auth';
import { contarNaoLidas } from '@/lib/server/notificacoes';
import { ehAdminPlataforma } from '@/lib/server/admin';
import { SairBotao } from './SairBotao';
import { MenuDrawer } from './MenuDrawer';

const navItens = [
  { href: '/feed', rotulo: 'Feed' },
  { href: '/perfil', rotulo: 'Perfis' },
  { href: '/vagas', rotulo: 'Vagas' },
  { href: '/vitrine', rotulo: 'Vitrine' },
  { href: '/painel/agenda', rotulo: 'Agenda' },
  { href: '/painel/chat', rotulo: 'Chat' },
  { href: '/planos', rotulo: 'Planos' },
];

export async function Header() {
  // Tolerante a má configuração: se a sessão falhar (ex.: sem NEXTAUTH_SECRET),
  // renderiza como deslogado em vez de quebrar todas as páginas.
  let usuario: { name?: string | null; id?: string; email?: string | null } | null = null;
  try {
    const session = await getServerSession(authOptions);
    usuario = session?.user ?? null;
  } catch {
    usuario = null;
  }

  const naoLidas = usuario?.id ? await contarNaoLidas(usuario.id) : 0;
  const admin = ehAdminPlataforma(usuario?.email);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Menu lateral (≡) com todas as opções — estilo redes sociais */}
          <MenuDrawer logado={Boolean(usuario)} admin={admin} nome={usuario?.name} />
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/drap-logo-ink.svg" alt="DRAP Business" className="h-9 w-auto" />
          </Link>
        </div>

        <nav className="hidden items-center gap-1 sm:flex">
          {navItens.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-marca-700"
            >
              {i.rotulo}
            </Link>
          ))}
        </nav>

        {usuario ? (
          <div className="flex items-center gap-2">
            <Link
              href="/painel/notificacoes"
              aria-label="Notificações"
              className="relative rounded-lg px-2 py-2 text-lg leading-none hover:bg-slate-100"
            >
              🔔
              {naoLidas > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                  {naoLidas > 9 ? '9+' : naoLidas}
                </span>
              )}
            </Link>
            <Link
              href="/painel"
              className="hidden rounded-lg px-3 py-2 text-sm font-bold text-marca-700 hover:bg-marca-50 sm:block"
            >
              {(usuario.name ?? 'Conta').split(' ')[0]}
            </Link>
            <SairBotao />
          </div>
        ) : (
          <Link href="/entrar" className="btn-primario !px-4 !py-2">
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
}
