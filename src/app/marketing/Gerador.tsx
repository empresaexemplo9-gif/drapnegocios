'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { gerarAction, type EstadoGerador } from './actions';

const inicial: EstadoGerador = { texto: '', viaIA: false };
const redesDisponiveis = ['Instagram', 'LinkedIn', 'WhatsApp', 'TikTok'];

export function Gerador() {
  const [estado, acao] = useFormState(gerarAction, inicial);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form action={acao} className="cartao space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Tipo de conteúdo</span>
          <select name="objetivo" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500">
            <option>post</option>
            <option>anúncio</option>
            <option>story</option>
            <option>e-mail</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Tema / produto</span>
          <textarea
            name="tema"
            rows={3}
            placeholder="Ex.: lançamento do nosso plano anual com 20% de desconto"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Tom</span>
          <select name="tom" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500">
            <option>profissional</option>
            <option>descontraído</option>
            <option>inspirador</option>
            <option>urgente</option>
          </select>
        </label>

        <fieldset>
          <span className="mb-2 block text-xs font-semibold text-slate-500">Publicar em</span>
          <div className="flex flex-wrap gap-3">
            {redesDisponiveis.map((r) => (
              <label key={r} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" name="redes" value={r} defaultChecked className="h-4 w-4 rounded border-slate-300 text-marca-600" />
                {r}
              </label>
            ))}
          </div>
        </fieldset>

        {estado.erro && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{estado.erro}</p>
        )}

        <Botao />
      </form>

      <div className="cartao">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-tinta">Pré-visualização</h2>
          {estado.texto &&
            (estado.viaIA ? (
              <span className="selo bg-emerald-100 text-emerald-700">Gerado com IA</span>
            ) : (
              <span className="selo bg-amber-100 text-amber-700">Rascunho (sem chave de IA)</span>
            ))}
        </div>

        {estado.texto ? (
          <>
            <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 font-sans text-sm text-slate-700">
              {estado.texto}
            </pre>
            <button
              type="button"
              disabled
              className="btn-primario mt-4 w-full cursor-not-allowed opacity-60"
              title="Disponível ao conectar as redes (fase 2)"
            >
              Publicar nas redes conectadas
            </button>
            <p className="mt-2 text-center text-xs text-slate-400">
              A publicação automática chega ao conectar as redes (OAuth) — fase 2.
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            Preencha o briefing e clique em <strong>Gerar com IA</strong> para ver o conteúdo aqui.
          </p>
        )}
      </div>
    </div>
  );
}

function Botao() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primario w-full" disabled={pending}>
      {pending ? 'Gerando…' : 'Gerar com IA'}
    </button>
  );
}
