/**
 * Agenda de compromissos + sala de call (Jitsi).
 *
 * Compromissos cruzam tenants (participantes de empresas diferentes), então
 * usam `prisma` direto e são controlados por userId/email. A sala é um nome
 * não-adivinhável; quem foi convidado e aceitou (ou é organizador) vê o link.
 */
import { randomUUID } from 'node:crypto';
import { prisma } from './prisma';

export type TipoCompromisso = 'reuniao' | 'negociacao' | 'apresentacao' | 'entrevista';

export interface Organizador {
  id: string;
  tenantId: string;
  email?: string | null;
}

export interface DadosReuniao {
  titulo: string;
  tipo: TipoCompromisso;
  descricao: string;
  inicioEm: Date;
  duracaoMin: number;
}

export async function criarReuniao(
  org: Organizador,
  dados: DadosReuniao,
  emails: string[],
): Promise<string> {
  const orgEmail = (org.email ?? `org-${org.id}`).toLowerCase();
  const limpos = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))].filter(
    (e) => e !== orgEmail,
  );
  const convidados = await Promise.all(
    limpos.map(async (email) => {
      const u = await prisma.user.findFirst({ where: { email } });
      return { email, userId: u?.id ?? null, status: 'convidado' as const, organizador: false };
    }),
  );

  const r = await prisma.reuniao.create({
    data: {
      organizadorId: org.id,
      organizadorTenantId: org.tenantId,
      titulo: dados.titulo,
      tipo: dados.tipo as never,
      descricao: dados.descricao || null,
      inicioEm: dados.inicioEm,
      duracaoMin: dados.duracaoMin,
      sala: `drap-${randomUUID()}`,
      participantes: {
        create: [
          { email: orgEmail, userId: org.id, status: 'aceito', organizador: true },
          ...convidados,
        ],
      },
    },
  });
  return r.id;
}

export interface ReuniaoItem {
  id: string;
  titulo: string;
  tipo: string;
  inicioEm: Date;
  duracaoMin: number;
  organizador: string;
  souOrganizador: boolean;
  meuStatus: string;
  totalParticipantes: number;
}

export async function minhasReunioes(userId: string, email: string): Promise<ReuniaoItem[]> {
  const e = email.toLowerCase();
  const parts = await prisma.participante.findMany({
    where: { OR: [{ userId }, { email: e }] },
    include: {
      reuniao: {
        include: {
          organizador: { select: { nome: true } },
          _count: { select: { participantes: true } },
        },
      },
    },
  });
  return parts
    .filter((p) => !p.reuniao.cancelada)
    .map((p) => ({
      id: p.reuniao.id,
      titulo: p.reuniao.titulo,
      tipo: p.reuniao.tipo,
      inicioEm: p.reuniao.inicioEm,
      duracaoMin: p.reuniao.duracaoMin,
      organizador: p.reuniao.organizador.nome,
      souOrganizador: p.organizador,
      meuStatus: p.status,
      totalParticipantes: p.reuniao._count.participantes,
    }))
    .sort((a, b) => a.inicioEm.getTime() - b.inicioEm.getTime());
}

export async function responderConvite(
  reuniaoId: string,
  userId: string,
  email: string,
  aceitar: boolean,
): Promise<boolean> {
  const p = await prisma.participante.findFirst({
    where: { reuniaoId, OR: [{ userId }, { email: email.toLowerCase() }] },
  });
  if (!p) return false;
  await prisma.participante.update({
    where: { id: p.id },
    data: { status: aceitar ? 'aceito' : 'recusado', userId: userId ?? p.userId },
  });
  return true;
}

export interface ParticipanteView {
  nome: string;
  email: string;
  status: string;
  organizador: boolean;
}

export interface ReuniaoDetalhe {
  id: string;
  titulo: string;
  tipo: string;
  descricao: string;
  inicioEm: Date;
  duracaoMin: number;
  sala: string;
  organizador: string;
  participantes: ParticipanteView[];
  meuStatus: string | null;
  souOrganizador: boolean;
  acesso: boolean;
}

export async function reuniaoDetalhe(
  reuniaoId: string,
  userId: string,
  email: string,
): Promise<ReuniaoDetalhe | null> {
  const r = await prisma.reuniao.findUnique({
    where: { id: reuniaoId },
    include: {
      organizador: { select: { nome: true } },
      participantes: { include: { user: { select: { nome: true } } } },
    },
  });
  if (!r || r.cancelada) return null;
  const e = email.toLowerCase();
  const eu = r.participantes.find((p) => p.userId === userId || p.email === e);
  const acesso = Boolean(eu && (eu.organizador || eu.status === 'aceito'));
  return {
    id: r.id,
    titulo: r.titulo,
    tipo: r.tipo,
    descricao: r.descricao ?? '',
    inicioEm: r.inicioEm,
    duracaoMin: r.duracaoMin,
    sala: r.sala,
    organizador: r.organizador.nome,
    participantes: r.participantes.map((p) => ({
      nome: p.user?.nome ?? p.email,
      email: p.email,
      status: p.status,
      organizador: p.organizador,
    })),
    meuStatus: eu?.status ?? null,
    souOrganizador: Boolean(eu?.organizador),
    acesso,
  };
}

export async function adicionarParticipante(
  reuniaoId: string,
  organizadorId: string,
  email: string,
): Promise<boolean> {
  const r = await prisma.reuniao.findFirst({ where: { id: reuniaoId, organizadorId } });
  if (!r) return false;
  const e = email.trim().toLowerCase();
  if (!e) return false;
  const u = await prisma.user.findFirst({ where: { email: e } });
  await prisma.participante.upsert({
    where: { reuniaoId_email: { reuniaoId, email: e } },
    update: {},
    create: { reuniaoId, email: e, userId: u?.id ?? null, status: 'convidado' },
  });
  return true;
}

export async function emailDoUsuario(userId: string): Promise<string | null> {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  return u?.email ?? null;
}

export async function cancelarReuniao(reuniaoId: string, organizadorId: string): Promise<void> {
  await prisma.reuniao.updateMany({
    where: { id: reuniaoId, organizadorId },
    data: { cancelada: true },
  });
}
