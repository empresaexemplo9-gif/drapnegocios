import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obterContexto } from '@/lib/server/session';
import { minhasNotificacoes, marcarTodasLidas } from '@/lib/server/notificacoes';
import { Icon, type NomeIcone } from '@/components/Icon';

export const metadata = { title: 'Notificações' };
export const dynamic = 'force-dynamic';

function quando(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  return d.toLocaleDateString('pt-BR');
}

const ICONE: Record<string, NomeIcone> = {
  chat: 'message',
  compartilhamento: 'megaphone',
};

export default async function NotificacoesPage() {
  const ctx = await obterContexto();
  if (!ctx) redirect('/entrar?proximo=/painel/notificacoes');

  // Carrega já com o estado de leitura e, em seguida, marca tudo como lido
  // (assim o sino zera na próxima navegação).
  const notificacoes = await minhasNotificacoes(ctx.userId);
  await marcarTodasLidas(ctx.userId);

  return (
    <div className="container-app py-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tight text-tinta">Notificações</h1>
          <Link href="/painel" className="text-sm font-semibold text-marca-600 hover:underline">
            ← Painel
          </Link>
        </div>

        <div className="mt-6 grid gap-2">
          {notificacoes.length === 0 && (
            <p className="cartao text-center text-sm text-slate-500">Você não tem notificações.</p>
          )}
          {notificacoes.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                n.lido ? 'border-ink-100 superficie' : 'border-marca-200 bg-marca-50'
              }`}
            >
              <Icon name={ICONE[n.tipo] ?? 'bell'} size={18} className="mt-0.5 text-marca-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-700">{n.conteudo}</p>
                <p className="mt-0.5 text-xs text-slate-400">{quando(n.criadoEm)}</p>
              </div>
              {!n.lido && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-marca-500" />}
            </div>
          ))}
        </div>

        {notificacoes.some((n) => n.tipo === 'chat') && (
          <p className="mt-6 text-center text-xs text-slate-400">
            <Link href="/painel/chat" className="font-semibold text-marca-600 hover:underline">
              Abrir o chat
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
