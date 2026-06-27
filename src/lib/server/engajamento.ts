/**
 * Motor de engajamento — pontos por atividade real e ranking (leaderboard).
 * Pontos derivam das ações do usuário; nada inventado.
 */
import { prisma } from './prisma';
import { dePlanoDb } from '../planos';
import { rotuloDestaque, boostVisibilidade } from '../visibilidade';

const PESOS = { posts: 5, products: 8, jobs: 8, applications: 6, mensagensChat: 1, gruposMensagens: 2 };

export interface RankItem {
  id: string;
  nome: string;
  avatarUrl: string;
  area: string;
  pontos: number;
  destaque: string | null;
}

export async function ranking(limite = 50): Promise<RankItem[]> {
  const us = await prisma.user.findMany({
    where: { status: 'ativo' },
    select: {
      id: true,
      nome: true,
      avatarUrl: true,
      profile: { select: { areaAtuacao: true } },
      tenant: { select: { plano: true } },
      _count: {
        select: {
          posts: true,
          products: true,
          jobs: true,
          applications: true,
          mensagensChat: true,
          gruposMensagens: true,
        },
      },
    },
    take: 800,
  });

  return us
    .map((u) => {
      const c = u._count;
      const base =
        c.posts * PESOS.posts +
        c.products * PESOS.products +
        c.jobs * PESOS.jobs +
        c.applications * PESOS.applications +
        c.mensagensChat * PESOS.mensagensChat +
        c.gruposMensagens * PESOS.gruposMensagens;
      const plano = dePlanoDb(u.tenant.plano);
      return {
        id: u.id,
        nome: u.nome,
        avatarUrl: u.avatarUrl ?? '',
        area: u.profile?.areaAtuacao ?? '',
        // Prime soma um bônus de engajamento (recompensa por assinar).
        pontos: base + boostVisibilidade(plano),
        destaque: rotuloDestaque(plano),
      };
    })
    .filter((x) => x.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, limite);
}
