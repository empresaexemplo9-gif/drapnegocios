import Link from 'next/link';
import { Icon } from './Icon';

export function Footer() {
  return (
    <footer className="border-t border-ink-800 bg-ink-950 text-ink-300">
      <div className="container-app flex flex-col items-center justify-between gap-3 py-8 text-sm sm:flex-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/drap-logo.svg" alt="DRAP Business" className="h-7 w-auto" />
        <div className="flex items-center gap-4">
          <Link
            href="/instalar"
            className="inline-flex items-center gap-1.5 font-semibold text-marca-400 hover:text-marca-300"
          >
            <Icon name="download" size={16} />
            Baixar o app
          </Link>
          <span>Hub digital de negócios e conexões.</span>
        </div>
        <p>© {new Date().getFullYear()} DRAP Business</p>
      </div>
    </footer>
  );
}
