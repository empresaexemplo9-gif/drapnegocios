'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Icon, type NomeIcone } from './Icon';

type ItemMenu = { href: string; rotulo: string; icone: NomeIcone };

const PRINCIPAL: ItemMenu[] = [
  { href: '/feed', rotulo: 'Feed', icone: 'feed' },
  { href: '/perfil', rotulo: 'Perfis', icone: 'users' },
  { href: '/vagas', rotulo: 'Vagas', icone: 'briefcase' },
  { href: '/vitrine', rotulo: 'Vitrine', icone: 'store' },
  { href: '/ranking', rotulo: 'Ranking', icone: 'trophy' },
  { href: '/planos', rotulo: 'Planos', icone: 'star' },
];

const CONTA: ItemMenu[] = [
  { href: '/painel', rotulo: 'Meu painel', icone: 'home' },
  { href: '/painel/notificacoes', rotulo: 'Notificações', icone: 'bell' },
  { href: '/painel/chat', rotulo: 'Chat', icone: 'message' },
  { href: '/painel/agenda', rotulo: 'Agenda e calls', icone: 'calendar' },
  { href: '/painel/grupos', rotulo: 'Grupos', icone: 'users' },
  { href: '/painel/crm', rotulo: 'CRM', icone: 'chart' },
  { href: '/painel/clientes', rotulo: 'Clientes', icone: 'users' },
  { href: '/painel/vagas', rotulo: 'Minhas vagas', icone: 'briefcase' },
  { href: '/painel/vitrine', rotulo: 'Minha vitrine', icone: 'store' },
  { href: '/painel/propostas', rotulo: 'Propostas', icone: 'doc' },
  { href: '/painel/prime', rotulo: 'Prime (IA)', icone: 'bot' },
];

// Configurações do acesso cliente
const CONFIG: ItemMenu[] = [
  { href: '/painel', rotulo: 'Editar meu perfil', icone: 'gear' },
  { href: '/planos', rotulo: 'Planos e assinatura', icone: 'card' },
  { href: '/instalar', rotulo: 'Instalar o app', icone: 'download' },
  { href: '/recuperar-senha', rotulo: 'Alterar/recuperar senha', icone: 'key' },
];

// Ferramentas de edição do superadministrador
const ADMIN_ITENS: ItemMenu[] = [
  { href: '/admin', rotulo: 'Painel do admin', icone: 'shield' },
  { href: '/admin#denuncias', rotulo: 'Moderação / Denúncias', icone: 'flag' },
  { href: '/admin/planos', rotulo: 'Editar preços dos planos', icone: 'tag' },
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
        className="grid h-10 w-10 place-items-center rounded-lg text-creme hover:bg-white/10"
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
          <aside className="superficie absolute left-0 top-0 flex h-screen w-full max-w-md flex-col shadow-2xl">
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
                <Icon name="x" size={18} />
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

              {logado && <Secao titulo="Configurações" itens={CONFIG} onNavegar={fechar} />}

              {admin && (
                <Secao titulo="Administração (superadmin)" itens={ADMIN_ITENS} onNavegar={fechar} />
              )}

              <div className="my-2 border-t border-slate-100" />
              <ItemLink
                item={{ href: '/diretrizes', rotulo: 'Diretrizes da comunidade', icone: 'doc' }}
                onNavegar={fechar}
              />
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
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-marca-700"
    >
      <Icon name={item.icone} className="shrink-0 text-marca-500" size={19} />
      {item.rotulo}
    </Link>
  );
}
