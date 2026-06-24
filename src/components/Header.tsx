import Link from 'next/link';
import { redirect } from 'next/navigation';
import { encerrarSessao, usuarioAtual } from '@/lib/sessao';

const navItens = [
  { href: '/perfil', rotulo: 'Perfil' },
  { href: '/vagas', rotulo: 'Vagas' },
  { href: '/vitrine', rotulo: 'Vitrine' },
  { href: '/feed', rotulo: 'Captação' },
  { href: '/marketing', rotulo: 'Marketing' },
  { href: '/planos', rotulo: 'Planos' },
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
        <Link href="/" className="flex items-center gap-3">
          <span className="sr-only">DRAP Business — Home</span>

          {/* Inline SVG logo (controls colors/gradients via CSS if needed) */}
          <svg
            role="img"
            aria-label="DRAP Business Logo"
            viewBox="0 0 1600 600"
            width="220"
            height="60"
            className="block h-auto w-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="drapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#17356B" />
                <stop offset="100%" stopColor="#000000" />
              </linearGradient>
            </defs>

            <rect width="100%" height="100%" fill="transparent" />

            <g transform="translate(120,100)">
              <path d="M0 0 H260 C340 0 400 80 400 200 C400 320 340 400 260 400 H0 Z" fill="url(#drapGradient)" />
              <path d="M165 400 L285 0" stroke="#FFFFFF" strokeWidth="24" strokeLinecap="round" />
            </g>

            <text
              x="600"
              y="320"
              fontFamily="Montserrat, Arial, sans-serif"
              fontSize="220"
              fontWeight="700"
              fill="url(#drapGradient)"
            >
              DRAP
            </text>

            <text
              x="610"
              y="470"
              fontFamily="Georgia, Times New Roman, serif"
              fontSize="95"
              fontWeight="700"
              letterSpacing="18"
              fill="#17356B"
            >
              BUSINESS
            </text>
          </svg>
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
