'use client';

/**
 * Botão de submit que pede confirmação antes de enviar o form (server action).
 * Usado em ações destrutivas, como excluir um perfil.
 */
export function ConfirmarSubmit({
  children,
  mensagem,
  className,
}: {
  children: React.ReactNode;
  mensagem: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(mensagem)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
