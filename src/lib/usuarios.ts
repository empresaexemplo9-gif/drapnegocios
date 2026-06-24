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
import type { ChavePlano } from './planos';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  hash: string;
  salt: string;
  /** Plano de assinatura. Free por padrão; Prime libera a IA de classificação. */
  plano: ChavePlano;
  /** Fim do teste grátis (timestamp ms). Indefinido = sem trial ativo. */
  trialAte?: number;
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

/**
 * Conta de demonstração semeada na carga do módulo. Como o armazenamento é em
 * memória, ela é recriada em cada instância serverless — garantindo que o login
 * de demonstração SEMPRE funcione, mesmo sem banco. Cadastros de usuários novos
 * só persistem de verdade quando o PostgreSQL entrar (fase 2).
 */
function semearDemo(): void {
  const email = 'demo@drap.business';
  if (usuarios.some((u) => u.email === email)) return;
  const salt = 'drapdemosalt0000';
  usuarios.push({
    id: 'demo',
    nome: 'Conta Demonstração',
    email,
    salt,
    hash: hashSenha('demo1234', salt),
    plano: 'pro',
    perfil: {
      tipo: 'empresa',
      areaAtuacao: 'Tecnologia',
      regiao: 'Goiânia - GO',
      bio: 'Conta de demonstração da DRAP Business com plano Prime Pro ativo.',
    },
  });
}
semearDemo();

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
    plano: 'free',
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

/** Assina/troca o plano. `trialDias > 0` inicia um teste grátis. */
export function definirPlano(id: string, plano: ChavePlano, trialDias = 0): void {
  const u = porId(id);
  if (!u) return;
  u.plano = plano;
  u.trialAte = trialDias > 0 ? Date.now() + trialDias * 24 * 60 * 60 * 1000 : undefined;
}

export function cancelarPlano(id: string): void {
  const u = porId(id);
  if (!u) return;
  u.plano = 'free';
  u.trialAte = undefined;
}

/** Considera o plano ativo respeitando o fim do trial (se houver). */
export function planoVigente(u: Usuario): ChavePlano {
  if (u.trialAte && Date.now() > u.trialAte) return 'free';
  return u.plano;
}

export function emTrial(u: Usuario): boolean {
  return Boolean(u.trialAte && Date.now() <= u.trialAte);
}
