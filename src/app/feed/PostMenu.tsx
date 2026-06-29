'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  acaoEditarPost,
  acaoExcluirPost,
  acaoDenunciarPost,
  acaoCompartilharChat,
} from './acoes';
import { Icon, type NomeIcone } from '@/components/Icon';

type Aba = 'menu' | 'editar' | 'chat' | 'externo' | 'denunciar';

/**
 * Menu de ferramentas de uma publicação: editar, excluir, enviar no chat,
 * compartilhar em mídias externas e denunciar. As opções de editar/excluir só
 * aparecem para o dono (ou superadmin, que pode excluir qualquer post).
 */
export function PostMenu({
  postId,
  texto,
  imagemUrl,
  souDono,
  souAdmin,
  logado,
}: {
  postId: string;
  texto: string;
  imagemUrl: string;
  souDono: boolean;
  souAdmin: boolean;
  logado: boolean;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [aba, setAba] = useState<Aba>('menu');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [pendente, iniciar] = useTransition();

  // campos
  const [editTexto, setEditTexto] = useState(texto);
  const [editImagem, setEditImagem] = useState(imagemUrl);
  const [emailChat, setEmailChat] = useState('');
  const [motivo, setMotivo] = useState('');

  function fechar() {
    setAberto(false);
    setAba('menu');
    setErro('');
    setAviso('');
  }

  function rodar(fn: () => Promise<{ ok: boolean; erro?: string }>, sucesso?: string) {
    setErro('');
    setAviso('');
    iniciar(async () => {
      const r = await fn();
      if (!r.ok) {
        setErro(r.erro ?? 'Não foi possível concluir.');
        return;
      }
      if (sucesso) {
        setAviso(sucesso);
        setTimeout(() => fechar(), 1200);
      } else {
        fechar();
      }
      router.refresh();
    });
  }

  const linkPublico =
    typeof window !== 'undefined' ? `${window.location.origin}/p/${postId}` : `/p/${postId}`;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Ferramentas da publicação"
        onClick={() => (aberto ? fechar() : setAberto(true))}
        className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        <Icon name="more" size={18} />
      </button>

      {aberto && (
        <div className="superficie absolute right-0 z-20 mt-1 w-64 rounded-xl border border-ink-100 p-2 shadow-lg">
          {aba === 'menu' && (
            <div className="flex flex-col">
              {souDono && (
                <Item onClick={() => setAba('editar')} icone="edit">Editar</Item>
              )}
              {(souDono || souAdmin) && (
                <Item
                  danger
                  icone="trash"
                  onClick={() => {
                    if (confirm('Excluir esta publicação? Esta ação não pode ser desfeita.')) {
                      rodar(() => acaoExcluirPost(postId));
                    }
                  }}
                >
                  Excluir{souAdmin && !souDono ? ' (admin)' : ''}
                </Item>
              )}
              {logado && <Item onClick={() => setAba('chat')} icone="send">Enviar no chat</Item>}
              <Item onClick={() => setAba('externo')} icone="share">Compartilhar</Item>
              {logado && <Item onClick={() => setAba('denunciar')} icone="flag">Denunciar</Item>}
            </div>
          )}

          {aba === 'editar' && (
            <div className="space-y-2 p-1">
              <p className="text-xs font-semibold text-slate-500">Editar publicação</p>
              <textarea
                value={editTexto}
                onChange={(e) => setEditTexto(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-marca-500"
              />
              <input
                type="url"
                value={editImagem}
                onChange={(e) => setEditImagem(e.target.value)}
                placeholder="URL da imagem (opcional)"
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-marca-500"
              />
              <Acoes
                pendente={pendente}
                onCancelar={() => setAba('menu')}
                onConfirmar={() => rodar(() => acaoEditarPost(postId, editTexto, editImagem.trim()))}
                rotulo="Salvar"
              />
            </div>
          )}

          {aba === 'chat' && (
            <div className="space-y-2 p-1">
              <p className="text-xs font-semibold text-slate-500">Enviar para um perfil (chat)</p>
              <input
                type="email"
                value={emailChat}
                onChange={(e) => setEmailChat(e.target.value)}
                placeholder="e-mail do destinatário"
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-marca-500"
              />
              <Acoes
                pendente={pendente}
                onCancelar={() => setAba('menu')}
                onConfirmar={() => rodar(() => acaoCompartilharChat(postId, emailChat), 'Enviado no chat!')}
                rotulo="Enviar"
              />
            </div>
          )}

          {aba === 'externo' && (
            <div className="space-y-1 p-1">
              <p className="text-xs font-semibold text-slate-500">Compartilhar em</p>
              <Externo rotulo="WhatsApp" href={`https://wa.me/?text=${encodeURIComponent(linkPublico)}`} />
              <Externo rotulo="X (Twitter)" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(linkPublico)}`} />
              <Externo rotulo="Facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(linkPublico)}`} />
              <Externo rotulo="LinkedIn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(linkPublico)}`} />
              <Externo rotulo="Telegram" href={`https://t.me/share/url?url=${encodeURIComponent(linkPublico)}`} />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(linkPublico);
                  setAviso('Link copiado!');
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100"
              >
                <Icon name="link" size={17} className="text-marca-500" />
                Copiar link
              </button>
              <button type="button" onClick={() => setAba('menu')} className="mt-1 text-xs text-slate-400 hover:underline">
                ← Voltar
              </button>
            </div>
          )}

          {aba === 'denunciar' && (
            <div className="space-y-2 p-1">
              <p className="text-xs font-semibold text-slate-500">Denunciar publicação</p>
              <select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-marca-500"
              >
                <option value="">Selecione o motivo…</option>
                <option value="Linguajar ofensivo">Linguajar ofensivo</option>
                <option value="Conteúdo sexual/apelativo">Conteúdo sexual/apelativo</option>
                <option value="Spam ou golpe">Spam ou golpe</option>
                <option value="Discurso de ódio">Discurso de ódio</option>
                <option value="Outro">Outro</option>
              </select>
              <Acoes
                pendente={pendente}
                onCancelar={() => setAba('menu')}
                onConfirmar={() => rodar(() => acaoDenunciarPost(postId, motivo), 'Denúncia enviada. Obrigado!')}
                rotulo="Enviar denúncia"
                desabilitado={!motivo}
              />
            </div>
          )}

          {erro && <p className="mt-1 px-1 text-xs font-semibold text-rose-600">{erro}</p>}
          {aviso && <p className="mt-1 px-1 text-xs font-semibold text-emerald-600">{aviso}</p>}
        </div>
      )}
    </div>
  );
}

function Item({
  children,
  onClick,
  danger,
  icone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  icone: NomeIcone;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-100 ${
        danger ? 'text-rose-600' : 'text-slate-700'
      }`}
    >
      <Icon name={icone} size={17} className={danger ? '' : 'text-marca-500'} />
      {children}
    </button>
  );
}

function Externo({ rotulo, href }: { rotulo: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100"
    >
      <Icon name="external" size={17} className="text-marca-500" />
      {rotulo}
    </a>
  );
}

function Acoes({
  onCancelar,
  onConfirmar,
  rotulo,
  pendente,
  desabilitado,
}: {
  onCancelar: () => void;
  onConfirmar: () => void;
  rotulo: string;
  pendente: boolean;
  desabilitado?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button type="button" onClick={onCancelar} className="text-xs text-slate-400 hover:underline">
        Cancelar
      </button>
      <button
        type="button"
        onClick={onConfirmar}
        disabled={pendente || desabilitado}
        className="btn-primario !px-3 !py-1 text-xs disabled:opacity-50"
      >
        {pendente ? '…' : rotulo}
      </button>
    </div>
  );
}
