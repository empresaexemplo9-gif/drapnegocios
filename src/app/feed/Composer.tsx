import { UploadImagem } from '@/components/UploadImagem';

export function Composer({ acao }: { acao: (formData: FormData) => Promise<void> }) {
  return (
    <form action={acao} className="cartao space-y-3">
      <textarea
        name="texto"
        rows={3}
        placeholder="Compartilhe uma novidade, vaga, produto ou serviço…"
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
      />
      <UploadImagem name="imagemUrl" label="Imagem (opcional)" formato="banner" />
      <div>
        <button className="btn-primario">Publicar</button>
      </div>
    </form>
  );
}
