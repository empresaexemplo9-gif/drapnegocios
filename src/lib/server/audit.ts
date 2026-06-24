/**
 * Trilha de auditoria. Registra ações sensíveis (login, alterações de dados,
 * mudanças de papel/assinatura) na tabela audit_logs, com dados antes/depois.
 * Retenção sugerida: 90 dias (ver `limparAuditAntigos`).
 */
import { prisma } from './prisma';

export interface EntradaAudit {
  tenantId: string;
  userId?: string | null;
  acao: string;
  tabelaAfetada?: string;
  dadosAnteriores?: unknown;
  dadosNovos?: unknown;
  ip?: string | null;
  userAgent?: string | null;
}

export async function registrarAudit(e: EntradaAudit): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: e.tenantId,
        userId: e.userId ?? null,
        acao: e.acao,
        tabelaAfetada: e.tabelaAfetada,
        dadosAnteriores: e.dadosAnteriores as object | undefined,
        dadosNovos: e.dadosNovos as object | undefined,
        ip: e.ip ?? null,
        userAgent: e.userAgent ?? null,
      },
    });
  } catch (err) {
    // Auditoria nunca deve quebrar o fluxo principal.
    console.error('Falha ao registrar audit log:', err);
  }
}

/** Remove logs além da retenção (chamar via cron/route agendada). */
export async function limparAuditAntigos(diasRetencao = 90): Promise<number> {
  const limite = new Date(Date.now() - diasRetencao * 24 * 60 * 60 * 1000);
  const { count } = await prisma.auditLog.deleteMany({ where: { timestamp: { lt: limite } } });
  return count;
}
