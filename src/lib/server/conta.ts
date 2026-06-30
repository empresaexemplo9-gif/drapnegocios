/**
 * Exclusão da PRÓPRIA conta (self-service).
 *
 * Regra de exclusão:
 *  - Se o usuário é o ÚNICO do negócio (tenant), apaga o NEGÓCIO inteiro — a
 *    cascata do Tenant remove usuários, perfis, vagas, produtos, propostas, etc.
 *  - Se houver outros membros, apaga só ESTA conta. Antes, remove os vínculos
 *    cuja FK para User não tem onDelete em cascata (vagas, produtos,
 *    candidaturas e reuniões criadas por ele), evitando erro de chave
 *    estrangeira. O restante (perfil, posts, grupos, chat, notificações…) sai
 *    pela cascata do próprio User.
 *
 * Tudo roda dentro de `withTenant` para respeitar o RLS (FORCE) do banco, e os
 * filtros são sempre por `tenantId` explícito — não confiamos só no RLS.
 */
import { withTenant } from './prisma';

/** Quantos usuários existem no negócio (tenant) atual. */
export async function contarUsuariosDoTenant(tenantId: string): Promise<number> {
  return withTenant(tenantId, (db) => db.user.count({ where: { tenantId } }));
}

/** Exclui a conta do usuário autenticado (e o negócio, se ele for o único). */
export async function excluirMinhaConta(tenantId: string, userId: string): Promise<void> {
  await withTenant(tenantId, async (db) => {
    const totalUsuarios = await db.user.count({ where: { tenantId } });

    // Único usuário → o negócio deixa de existir junto. Cascata limpa tudo.
    if (totalUsuarios <= 1) {
      await db.tenant.delete({ where: { id: tenantId } });
      return;
    }

    // Há outros membros → remove apenas esta conta. Limpa antes os vínculos
    // sem cascata para User (senão a FK bloqueia o delete).
    await db.application.deleteMany({ where: { tenantId, candidateId: userId } });
    await db.product.deleteMany({ where: { tenantId, sellerId: userId } });
    await db.job.deleteMany({ where: { tenantId, empresaId: userId } }); // cascateia applications dessas vagas
    await db.reuniao.deleteMany({ where: { organizadorId: userId } }); // cascateia participantes
    await db.user.delete({ where: { id: userId } }); // cascateia perfil, posts, grupos, chat, notificações…
  });
}
