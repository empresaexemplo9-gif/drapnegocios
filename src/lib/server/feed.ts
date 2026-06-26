/**
 * Feed de publicações. Posts são públicos: aparecem no feed global e no perfil
 * do autor, visíveis para qualquer visitante.
 */
import { prisma } from './prisma';

export interface PostView {
  id: string;
  autorId: string;
  autorNome: string;
  autorAvatar: string;
  texto: string;
  imagemUrl: string;
  criadoEm: string;
}

function mapear(p: {
  id: string;
  autorId: string;
  texto: string;
  imagemUrl: string | null;
  criadoEm: Date;
  autor: { nome: string; avatarUrl: string | null };
}): PostView {
  return {
    id: p.id,
    autorId: p.autorId,
    autorNome: p.autor.nome,
    autorAvatar: p.autor.avatarUrl ?? '',
    texto: p.texto,
    imagemUrl: p.imagemUrl ?? '',
    criadoEm: p.criadoEm.toISOString(),
  };
}

export async function criarPost(
  userId: string,
  tenantId: string,
  texto: string,
  imagemUrl: string,
): Promise<boolean> {
  const t = texto.trim();
  if (!t && !imagemUrl) return false;
  await prisma.post.create({
    data: { autorId: userId, tenantId, texto: t.slice(0, 2000), imagemUrl: imagemUrl || null },
  });
  return true;
}

export async function feedGlobal(limit = 60): Promise<PostView[]> {
  const posts = await prisma.post.findMany({
    include: { autor: { select: { nome: true, avatarUrl: true } } },
    orderBy: { criadoEm: 'desc' },
    take: limit,
  });
  return posts.map(mapear);
}

export async function postsDoPerfil(userId: string, limit = 30): Promise<PostView[]> {
  const posts = await prisma.post.findMany({
    where: { autorId: userId },
    include: { autor: { select: { nome: true, avatarUrl: true } } },
    orderBy: { criadoEm: 'desc' },
    take: limit,
  });
  return posts.map(mapear);
}

export async function excluirPost(userId: string, id: string): Promise<void> {
  await prisma.post.deleteMany({ where: { id, autorId: userId } });
}
