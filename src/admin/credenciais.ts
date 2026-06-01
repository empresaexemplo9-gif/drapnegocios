/**
 * Credenciais de administrador.
 *
 * ⚠️ Protótipo: a validação acontece no cliente apenas para demonstração.
 * Segurança real depende do backend — quando os endpoints `/admin/*` e o
 * `POST /auth/login` existirem, a autenticação passa a ser validada no
 * servidor (a camada de serviços já está preparada para isso).
 */
export type Papel = 'admin' | 'cliente';

export const ADMIN_EMAIL = 'admin@viajebrasil.com';
const ADMIN_SENHA = 'viajebrasil@2026';

export function validarAdmin(email: string, senha: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL && senha === ADMIN_SENHA;
}
