export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-app flex flex-col items-center justify-between gap-3 py-8 text-sm text-ink-400 sm:flex-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/drap-logo-ink.svg" alt="DRAP Business" className="h-7 w-auto" />
        <p>Hub digital de negócios e conexões.</p>
        <p>© {new Date().getFullYear()} DRAP Business</p>
      </div>
    </footer>
  );
}
