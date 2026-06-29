import { BotaoInstalar } from '@/components/BotaoInstalar';

export const metadata = { title: 'Baixar o app' };

export default function InstalarPage() {
  return (
    <div className="container-app py-12">
      <div className="mx-auto max-w-lg text-center">
        <span className="superficie grid mx-auto h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-ink-100 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="DRAP" className="h-full w-full" />
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-tinta">Baixar o app DRAP</h1>
        <p className="mt-2 text-slate-600">
          A DRAP funciona como aplicativo no seu celular — sem loja, sem ocupar espaço. Instale e
          abra direto da tela inicial, em tela cheia.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-lg space-y-4">
        <BotaoInstalar />
        <p className="text-center text-xs text-slate-400">
          Funciona em Android (Chrome) e iPhone (Safari). É a mesma conta do site.
        </p>
      </div>
    </div>
  );
}
