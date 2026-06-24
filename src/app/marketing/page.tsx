import { redirect } from 'next/navigation';
import { usuarioAtual } from '@/lib/sessao';
import { Gerador } from './Gerador';

export const metadata = { title: 'Marketing' };

export default function MarketingPage() {
  if (!usuarioAtual()) redirect('/entrar');

  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-black tracking-tight text-tinta">Marketing Automatizado</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Crie um post ou campanha uma vez, com ajuda da <strong>IA</strong>, e distribua para as
        redes conectadas. (A distribuição automática chega na fase 2.)
      </p>

      <div className="mt-8">
        <Gerador />
      </div>
    </div>
  );
}
