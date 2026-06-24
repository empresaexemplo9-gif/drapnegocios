import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { encerrarSessao, usuarioAtual } from '@/lib/sessao';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-app flex flex-col items-center justify-between gap-3 py-8 text-sm text-slate-500 sm:flex-row">
        <div className="flex items-center gap-3">
          <Image src="/download.svg" alt="DRAP Business" width={160} height={44} className="block" />
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
