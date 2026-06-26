/**
 * Hashing de senha (bcryptjs). A política de senha pura vive em
 * `src/lib/password-policy.ts` (segura para o cliente).
 */
import bcrypt from 'bcryptjs';

export { REGRA_SENHA, politicaSenha, type ResultadoSenha } from '../password-policy';

export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 12);
}

export async function conferirSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}
