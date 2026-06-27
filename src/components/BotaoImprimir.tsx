'use client';

export function BotaoImprimir() {
  return (
    <button onClick={() => window.print()} className="btn-primario no-print" type="button">
      Imprimir / Salvar como PDF
    </button>
  );
}
