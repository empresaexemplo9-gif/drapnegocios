'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface Msg {
  id: string;
  autorId: string;
  autor: string;
  tipo: string;
  texto: string;
  reuniaoId: string | null;
  criadoEm: string;
}

export function Chat({ conversaId, meuId }: { conversaId: string; meuId: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const desdeRef = useRef<string | undefined>(undefined);
  const fimRef = useRef<HTMLDivElement>(null);

  const buscar = useCallback(async () => {
    const url = `/api/chat/${conversaId}${desdeRef.current ? `?desde=${encodeURIComponent(desdeRef.current)}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json().catch(() => ({}));
    const novas: Msg[] = data?.mensagens ?? [];
    if (novas.length) {
      desdeRef.current = novas[novas.length - 1].criadoEm;
      setMsgs((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        return [...prev, ...novas.filter((m) => !ids.has(m.id))];
      });
    }
  }, [conversaId]);

  useEffect(() => {
    buscar();
    const t = setInterval(buscar, 4000);
    return () => clearInterval(t);
  }, [buscar]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const t = texto.trim();
    if (!t) return;
    setEnviando(true);
    setTexto('');
    await fetch(`/api/chat/${conversaId}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ texto: t }),
    });
    await buscar();
    setEnviando(false);
  }

  return (
    <div className="cartao flex h-[60vh] flex-col !p-0">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {msgs.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">Comece a conversa 👋</p>
        )}
        {msgs.map((m) => {
          const meu = m.autorId === meuId;
          if (m.tipo === 'convite') {
            return (
              <div key={m.id} className="flex justify-center">
                <Link
                  href={m.reuniaoId ? `/painel/agenda/${m.reuniaoId}` : '/painel/agenda'}
                  className="rounded-xl border border-marca-200 bg-marca-50 px-4 py-2 text-sm font-semibold text-marca-700"
                >
                  📅 {m.texto} · abrir →
                </Link>
              </div>
            );
          }
          return (
            <div key={m.id} className={`flex ${meu ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  meu ? 'bg-marca-600 text-white' : 'bg-slate-100 text-slate-800'
                }`}
              >
                {!meu && <span className="mb-0.5 block text-[10px] font-bold opacity-70">{m.autor}</span>}
                <span className="whitespace-pre-wrap break-words">{m.texto}</span>
              </div>
            </div>
          );
        })}
        <div ref={fimRef} />
      </div>

      <form onSubmit={enviar} className="flex gap-2 border-t border-slate-200 p-3">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreva uma mensagem…"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-marca-500"
        />
        <button disabled={enviando} className="btn-primario !py-2">
          Enviar
        </button>
      </form>
    </div>
  );
}
