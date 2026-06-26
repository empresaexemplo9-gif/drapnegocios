/**
 * Criação de tenant e geração de slug único (com fallback numérico).
 */
import { prisma } from './prisma';

export function slugify(nome: string): string {
  return (
    nome
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // remove acentos
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'tenant'
  );
}

/** Gera um slug livre: base, base-2, base-3, ... */
export async function slugUnico(nome: string): Promise<string> {
  const base = slugify(nome);
  let candidato = base;
  let n = 1;
  // Loop pequeno: na prática converge em 1–2 tentativas.
  while (await prisma.tenant.findUnique({ where: { slug: candidato } })) {
    n += 1;
    candidato = `${base}-${n}`;
  }
  return candidato;
}
