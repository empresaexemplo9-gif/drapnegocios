/**
 * Política de senha e hashing. A mesma regra (`politicaSenha`) é usada no
 * frontend e no backend. O hash usa bcryptjs (JS puro, sem binário nativo).
 */
import bcrypt from 'bcryptjs';

/** Mín. 8 caracteres, 1 maiúscula, 1 número e 1 caractere especial. */
export const REGRA_SENHA = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export interface ResultadoSenha {
  ok: boolean;
  erros: string[];
}

export function politicaSenha(senha: string): ResultadoSenha {
  const erros: string[] = [];
  if (senha.length < 8) erros.push('Mínimo de 8 caracteres.');
  if (!/[A-Z]/.test(senha)) erros.push('Pelo menos uma letra maiúscula.');
  if (!/\d/.test(senha)) erros.push('Pelo menos um número.');
  if (!/[^A-Za-z0-9]/.test(senha)) erros.push('Pelo menos um caractere especial.');
  return { ok: erros.length === 0, erros };
}

export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 12);
}

export async function conferirSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}
