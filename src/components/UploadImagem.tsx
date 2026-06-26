'use client';

import { useState } from 'react';

type Formato = 'banner' | 'avatar' | 'item';

/**
 * Campo de imagem com upload (Vercel Blob) + fallback de URL. Mantém a URL final
 * num input escondido de nome `name`, para o form (server action) receber via
 * FormData. Se o upload estiver indisponível, dá pra colar uma URL.
 */
export function UploadImagem({
  name,
  label,
  defaultUrl = '',
  formato = 'item',
}: {
  name: string;
  label: string;
  defaultUrl?: string;
  formato?: Formato;
}) {
  const [url, setUrl] = useState(defaultUrl);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  async function enviar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEnviando(true);
    setErro('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setErro(data?.erro ?? 'Falha no upload.');
      else setUrl(data.url);
    } catch {
      setErro('Falha no upload.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-500">{label}</span>
      <input type="hidden" name={name} value={url} />

      <div className="flex items-center gap-3">
        <Preview url={url} formato={formato} />
        <div className="flex-1">
          <label className="btn-secundario !py-2 cursor-pointer text-sm">
            {enviando ? 'Enviando…' : 'Enviar imagem'}
            <input type="file" accept="image/*" onChange={enviar} className="hidden" disabled={enviando} />
          </label>
          {url && (
            <button
              type="button"
              onClick={() => setUrl('')}
              className="ml-2 text-xs font-semibold text-rose-600"
            >
              Remover
            </button>
          )}
        </div>
      </div>

      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="ou cole a URL de uma imagem"
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-marca-500"
      />
      {erro && <p className="mt-1 text-xs font-semibold text-rose-600">{erro}</p>}
    </div>
  );
}

function Preview({ url, formato }: { url: string; formato: Formato }) {
  const base = 'shrink-0 overflow-hidden bg-slate-100 border border-slate-200';
  const cls =
    formato === 'avatar'
      ? `${base} h-14 w-14 rounded-full`
      : formato === 'banner'
        ? `${base} h-14 w-28 rounded-lg`
        : `${base} h-14 w-14 rounded-lg`;
  return (
    <div className={cls}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="grid h-full w-full place-items-center text-[10px] text-slate-400">sem imagem</span>
      )}
    </div>
  );
}
