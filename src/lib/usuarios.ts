/**
 * Armazenamento de usuários do MVP. Em memória (sobrevive ao hot-reload do dev
 * via globalThis), com senha protegida por hash + salt. Quando o PostgreSQL/
 * Prisma for ligado, troca-se este módulo por consultas ao banco — a API
 * (registrar/autenticar/atualizarPerfil) permanece a mesma.
 *
 * Observação: por ser em memória, não persiste entre reinícios/instâncias
 * serverless. É demonstração funcional até o banco entrar.
 */
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { TipoPerfil } from './dados';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  hash: string;
  salt: string;
  perfil: {
    tipo: TipoPerfil;
    areaAtuacao: string;
    regiao: string;
    bio: string;
  };
}

const g = globalThis as unknown as { __drapUsuarios?: Usuario[] };
g.__drapUsuarios ??= [];
const usuarios = g.__drapUsuarios;

function hashSenha(senha: string, salt: string): string {
  return scryptSync(senha, salt, 64).toString('hex');
}

export function registrar(nome: string, email: string, senha: string): Usuario {
  const e = email.trim().toLowerCase();
  if (usuarios.some((u) => u.email === e)) {
    throw new Error('Já existe uma conta com este e-mail.');
  }
  const salt = randomBytes(16).toString('hex');
  const usuario: Usuario = {
    id: randomBytes(8).toString('hex'),
    nome: nome.trim(),
    email: e,
    salt,
    hash: hashSenha(senha, salt),
    perfil: { tipo: 'pessoa', areaAtuacao: '', regiao: '', bio: '' },
  };
  usuarios.push(usuario);
  return usuario;
}

export function autenticar(email: string, senha: string): Usuario {
  const u = usuarios.find((x) => x.email === email.trim().toLowerCase());
  if (!u) throw new Error('E-mail ou senha inválidos.');
  const tentativa = Buffer.from(hashSenha(senha, u.salt), 'hex');
  const correto = Buffer.from(u.hash, 'hex');
  if (tentativa.length !== correto.length || !timingSafeEqual(tentativa, correto)) {
    throw new Error('E-mail ou senha inválidos.');
  }
  return u;
}

export function porId(id: string): Usuario | undefined {
  return usuarios.find((u) => u.id === id);
}

export function atualizarPerfil(id: string, dados: Partial<Usuario['perfil']>): void {
  const u = porId(id);
  if (u) u.perfil = { ...u.perfil, ...dados };
}
