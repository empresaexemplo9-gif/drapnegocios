/**
 * Central de propostas. Cria propostas com itens e gera um link público
 * (token não-adivinhável) que abre uma página imprimível → "Salvar como PDF".
 */
import { randomUUID } from 'node:crypto';
import { withTenant, prisma } from './prisma';

export interface ItemProposta {
  descricao: string;
  valor: number;
}

export function moeda(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Cada linha "descrição | valor" vira um item. */
function parseItens(texto: string): ItemProposta[] {
  return texto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const partes = l.split(/[|;]/);
      const descricao = (partes[0] ?? '').trim();
      const valor = Number(String(partes[1] ?? '').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
      return { descricao, valor };
    })
    .filter((i) => i.descricao);
}

export interface NovaProposta {
  clienteNome: string;
  clienteEmail: string;
  titulo: string;
  itensTexto: string;
  validadeDias: string;
  observacoes: string;
}

export async function criarProposta(tenantId: string, userId: string, dados: NovaProposta): Promise<string> {
  const itens = parseItens(dados.itensTexto);
  const total = itens.reduce((s, i) => s + i.valor, 0);
  const token = randomUUID().replace(/-/g, '');
  await withTenant(tenantId, (db) =>
    db.proposta.create({
      data: {
        tenantId,
        autorId: userId,
        token,
        clienteNome: dados.clienteNome,
        clienteEmail: dados.clienteEmail || null,
        titulo: dados.titulo || 'Proposta comercial',
        itens: itens as never,
        total: total > 0 ? total.toFixed(2) : null,
        validadeDias: Number(dados.validadeDias) || null,
        observacoes: dados.observacoes || null,
      },
    }),
  );
  return token;
}

/** Cria uma proposta já preenchida a partir de um lead do CRM e move-o para "Proposta". */
export async function criarPropostaDeLead(
  tenantId: string,
  userId: string,
  leadId: string,
): Promise<string | null> {
  const lead = (await withTenant(tenantId, (db) =>
    db.lead.findFirst({ where: { id: leadId, tenantId } }),
  )) as { nome: string; email: string | null; descricao: string | null; valor: unknown } | null;
  if (!lead) return null;

  const valor = Number(lead.valor ?? 0);
  const descricaoItem = (lead.descricao || lead.nome || 'Serviço/produto').trim();
  const itensTexto = valor > 0 ? `${descricaoItem} | ${valor}` : descricaoItem;

  const token = await criarProposta(tenantId, userId, {
    clienteNome: lead.nome,
    clienteEmail: lead.email ?? '',
    titulo: lead.descricao ? `Proposta — ${descricaoItem}`.slice(0, 80) : 'Proposta comercial',
    itensTexto,
    validadeDias: '15',
    observacoes: '',
  });

  await withTenant(tenantId, (db) =>
    db.lead.updateMany({ where: { id: leadId, tenantId }, data: { etapa: 'proposta' as never } }),
  );
  return token;
}

export interface PropostaItem {
  token: string;
  titulo: string;
  cliente: string;
  total: string;
  criadoEm: string;
}

export async function listarPropostas(tenantId: string): Promise<PropostaItem[]> {
  return withTenant(tenantId, async (db) => {
    const ps = await db.proposta.findMany({ where: { tenantId }, orderBy: { criadoEm: 'desc' }, take: 200 });
    return ps.map((p) => ({
      token: p.token,
      titulo: p.titulo,
      cliente: p.clienteNome,
      total: p.total ? moeda(Number(p.total)) : '—',
      criadoEm: p.criadoEm.toLocaleDateString('pt-BR'),
    }));
  });
}

export async function excluirProposta(tenantId: string, token: string): Promise<void> {
  await withTenant(tenantId, (db) => db.proposta.deleteMany({ where: { token, tenantId } }));
}

export interface PropostaPublica {
  titulo: string;
  fornecedor: string;
  fornecedorLogo: string;
  cliente: string;
  clienteEmail: string;
  itens: ItemProposta[];
  total: number;
  validadeDias: number | null;
  observacoes: string;
  criadoEm: string;
}

/** Visão pública (pelo token) — sem withTenant, pois é um link compartilhável. */
export async function propostaPorToken(token: string): Promise<PropostaPublica | null> {
  const p = await prisma.proposta.findUnique({
    where: { token },
    include: { tenant: { select: { nome: true, logoUrl: true } } },
  });
  if (!p) return null;
  const itens = Array.isArray(p.itens) ? (p.itens as unknown as ItemProposta[]) : [];
  return {
    titulo: p.titulo,
    fornecedor: p.tenant.nome,
    fornecedorLogo: p.tenant.logoUrl ?? '',
    cliente: p.clienteNome,
    clienteEmail: p.clienteEmail ?? '',
    itens,
    total: Number(p.total ?? 0),
    validadeDias: p.validadeDias,
    observacoes: p.observacoes ?? '',
    criadoEm: p.criadoEm.toLocaleDateString('pt-BR'),
  };
}
