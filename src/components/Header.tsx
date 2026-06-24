import Link from 'next/link';
import { redirect } from 'next/navigation';
import { encerrarSessao, usuarioAtual } from '@/lib/sessao';

const navItens = [
  { href: '/perfil', rotulo: 'Perfil' },
  { href: '/vagas', rotulo: 'Vagas' },
  { href: '/vitrine', rotulo: 'Vitrine' },
  { href: '/feed', rotulo: 'Captação' },
];

export function Header() {
  const usuario = usuarioAtual();

  async function sair() {
    'use server';
    encerrarSessao();
    redirect('/');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-marca-600 text-sm font-black text-white">
            D
          </span>
          <span className="text-lg font-black tracking-tight text-tinta">
            DRAP <span className="text-marca-600">Business</span>
          </span>
        </Link>

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
              href="/painel"
              className="hidden rounded-lg px-3 py-2 text-sm font-bold text-marca-700 hover:bg-marca-50 sm:block"
            >
              {usuario.nome.split(' ')[0]}
            </Link>
            <form action={sair}>
              <button className="btn-secundario !px-4 !py-2">Sair</button>
            </form>
          </div>
        ) : (
          <Link href="/entrar" className="btn-primario !px-4 !py-2">
            Entrar
          </Link>
        )}
      </div>

      {/* Navegação mobile */}
      <nav className="container-app flex items-center gap-1 overflow-x-auto pb-2 sm:hidden">
        {usuario && (
          <Link
            href="/painel"
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-bold text-marca-700 hover:bg-marca-50"
          >
            Painel
          </Link>
        )}
        {navItens.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            {i.rotulo}
          </Link>
        ))}
      </nav>
    </header>
  );
}
