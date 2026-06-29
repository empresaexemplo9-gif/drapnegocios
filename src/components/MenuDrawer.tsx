'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

type ItemMenu = { href: string; rotulo: string; icone: string };

const PRINCIPAL: ItemMenu[] = [
  { href: '/feed', rotulo: 'Feed', icone: '📰' },
  { href: '/perfil', rotulo: 'Perfis', icone: '👥' },
  { href: '/vagas', rotulo: 'Vagas', icone: '💼' },
  { href: '/vitrine', rotulo: 'Vitrine', icone: '🛍️' },
  { href: '/ranking', rotulo: 'Ranking', icone: '🏆' },
  { href: '/planos', rotulo: 'Planos', icone: '⭐' },
];

const CONTA: ItemMenu[] = [
  { href: '/painel', rotulo: 'Meu painel', icone: '🏠' },
  { href: '/painel/notificacoes', rotulo: 'Notificações', icone: '🔔' },
  { href: '/painel/chat', rotulo: 'Chat', icone: '💬' },
  { href: '/painel/agenda', rotulo: 'Agenda e calls', icone: '📅' },
  { href: '/painel/grupos', rotulo: 'Grupos', icone: '👨‍👩‍👧' },
  { href: '/painel/crm', rotulo: 'CRM', icone: '📈' },
  { href: '/painel/clientes', rotulo: 'Clientes', icone: '🤝' },
  { href: '/painel/vagas', rotulo: 'Minhas vagas', icone: '📋' },
  { href: '/painel/vitrine', rotulo: 'Minha vitrine', icone: '🏪' },
  { href: '/painel/propostas', rotulo: 'Propostas', icone: '📄' },
  { href: '/painel/prime', rotulo: 'Prime (IA)', icone: '🤖' },
];

/**
 * Menu lateral (drawer) acionado pelo botão de três barras (≡), no estilo das
 * redes sociais. Reúne todas as seções da plataforma num só lugar.
 */
export function MenuDrawer({
  logado,
  admin,
  nome,
}: {
  logado: boolean;
  admin: boolean;
  nome?: string | null;
}) {
  const [aberto, setAberto] = useState(false);
  const fechar = () => setAberto(false);

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menu"
        onClick={() => setAberto(true)}
        className="grid h-10 w-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
      >
        <span className="flex flex-col gap-[5px]">
          <span className="block h-0.5 w-5 rounded bg-current" />
          <span className="block h-0.5 w-5 rounded bg-current" />
          <span className="block h-0.5 w-5 rounded bg-current" />
        </span>
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <button
            aria-label="Fechar menu"
            onClick={fechar}
            className="absolute inset-0 h-full w-full bg-black/40 backdrop-blur-sm"
          />
          {/* Painel */}
          <aside className="absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <Link href="/" onClick={fechar} className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/drap-logo-ink.svg" alt="DRAP Business" className="h-8 w-auto" />
              </Link>
              <button
                onClick={fechar}
                aria-label="Fechar"
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-3">
              {logado && nome && (
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Olá, {nome.split(' ')[0]}
                </p>
              )}

              <Secao titulo="Explorar" itens={PRINCIPAL} onNavegar={fechar} />

              {logado && <Secao titulo="Minha conta" itens={CONTA} onNavegar={fechar} />}

              <div className="my-2 border-t border-slate-100" />
              <ItemLink item={{ href: '/diretrizes', rotulo: 'Diretrizes da comunidade', icone: '📜' }} onNavegar={fechar} />
              {admin && (
                <ItemLink item={{ href: '/admin', rotulo: 'Admin da plataforma', icone: '🛠️' }} onNavegar={fechar} />
              )}
            </nav>

            <div className="border-t border-slate-200 p-3">
              {logado ? (
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Sair
                </button>
              ) : (
                <Link
                  href="/entrar"
                  onClick={fechar}
                  className="block w-full rounded-lg bg-marca-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-marca-700"
                >
                  Entrar
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function Secao({ titulo, itens, onNavegar }: { titulo: string; itens: ItemMenu[]; onNavegar: () => void }) {
  return (
    <div className="mb-1">
      <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{titulo}</p>
      {itens.map((item) => (
        <ItemLink key={item.href} item={item} onNavegar={onNavegar} />
      ))}
    </div>
  );
}

function ItemLink({ item, onNavegar }: { item: ItemMenu; onNavegar: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onNavegar}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-marca-700"
    >
      <span className="text-base">{item.icone}</span>
      {item.rotulo}
    </Link>
  );
}
