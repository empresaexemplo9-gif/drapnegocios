import Link from 'next/link';
import { encerrarSessao, usuarioAtual } from '@/lib/sessao';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-app flex flex-col items-center justify-between gap-3 py-8 text-sm text-slate-500 sm:flex-row">
        <div className="flex items-center gap-3">
          {/* Inline SVG (smaller) */}
          <svg
            role="img"
            aria-label="DRAP Business Logo"
            viewBox="0 0 1600 600"
            width="160"
            height="44"
            className="block h-auto w-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="drapGradientFooter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#17356B" />
                <stop offset="100%" stopColor="#000000" />
              </linearGradient>
            </defs>

            <rect width="100%" height="100%" fill="transparent" />

            <g transform="translate(120,100)">
              <path d="M0 0 H260 C340 0 400 80 400 200 C400 320 340 400 260 400 H0 Z" fill="url(#drapGradientFooter)" />
              <path d="M165 400 L285 0" stroke="#FFFFFF" strokeWidth="24" strokeLinecap="round" />
            </g>

            <text
              x="600"
              y="320"
              fontFamily="Montserrat, Arial, sans-serif"
              fontSize="220"
              fontWeight="700"
              fill="url(#drapGradientFooter)"
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

          <p className="font-semibold text-tinta hidden sm:block">
            DRAP <span className="text-marca-600">Business</span>
          </p>
        </div>

        <p>Hub digital de negócios e conexões — MVP.</p>
        <p>© {new Date().getFullYear()} DRAP Business</p>
      </div>
    </footer>
  );
}
