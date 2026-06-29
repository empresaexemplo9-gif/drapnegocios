import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server/auth';
import { contarNaoLidas } from '@/lib/server/notificacoes';
import { ehAdminPlataforma } from '@/lib/server/admin';
import { SairBotao } from './SairBotao';
import { MenuDrawer } from './MenuDrawer';
import { Icon } from './Icon';

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
    <header className="sticky top-0 z-30 border-b border-ink-800 bg-ink-950/95 text-creme backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Menu lateral (≡) com todas as opções — estilo redes sociais */}
          <MenuDrawer logado={Boolean(usuario)} admin={admin} nome={usuario?.name} />
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/drap-logo.svg" alt="DRAP Business" className="h-9 w-auto" />
          </Link>
        </div>

        <nav className="hidden items-center gap-1 sm:flex">
          {navItens.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-100 transition hover:bg-white/10 hover:text-white"
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
              className="relative rounded-lg p-2 text-marca-400 hover:bg-white/10 hover:text-marca-300"
            >
              <Icon name="bell" size={20} />
              {naoLidas > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-marca-500 px-1 text-[10px] font-bold text-white">
                  {naoLidas > 9 ? '9+' : naoLidas}
                </span>
              )}
            </Link>
            <Link
              href="/painel"
              className="hidden rounded-lg px-3 py-2 text-sm font-bold text-ink-100 hover:bg-white/10 hover:text-white sm:block"
            >
              {(usuario.name ?? 'Conta').split(' ')[0]}
            </Link>
            <SairBotao />
          </div>
        ) : (
          <Link href="/entrar" className="btn-acento !px-4 !py-2">
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
}
