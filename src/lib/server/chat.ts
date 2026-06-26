/**
 * Chat interno (conversas + mensagens), cross-tenant. Permite enviar uma
 * mensagem comum ou um CONVITE de reunião — neste caso, todos os participantes
 * da conversa entram como convidados do compromisso.
 */
import { prisma } from './prisma';

export async function participaDaConversa(conversaId: string, userId: string): Promise<boolean> {
  const c = await prisma.conversaParticipante.findFirst({ where: { conversaId, userId } });
  return Boolean(c);
}

/** Abre (ou cria) uma conversa 1:1 com o usuário do e-mail informado. */
export async function iniciarConversa(meuId: string, outroEmail: string): Promise<string | null> {
  const outro = await prisma.user.findFirst({ where: { email: outroEmail.trim().toLowerCase() } });
  if (!outro || outro.id === meuId) return null;
  const minhas = await prisma.conversaParticipante.findMany({
    where: { userId: meuId },
    include: { conversa: { include: { participantes: true } } },
  });
  const existente = minhas.find(
    (cp) =>
      cp.conversa.participantes.length === 2 &&
      cp.conversa.participantes.some((p) => p.userId === outro.id),
  );
  if (existente) return existente.conversaId;
  const c = await prisma.conversa.create({
    data: { participantes: { create: [{ userId: meuId }, { userId: outro.id }] } },
  });
  return c.id;
}

/** Abre (ou cria) uma conversa 1:1 com outro usuário pelo id. */
export async function iniciarConversaPorId(meuId: string, outroId: string): Promise<string | null> {
  if (!outroId || outroId === meuId) return null;
  const existe = await prisma.user.findUnique({ where: { id: outroId }, select: { id: true } });
  if (!existe) return null;
  const minhas = await prisma.conversaParticipante.findMany({
    where: { userId: meuId },
    include: { conversa: { include: { participantes: true } } },
  });
  const achou = minhas.find(
    (cp) =>
      cp.conversa.participantes.length === 2 &&
      cp.conversa.participantes.some((p) => p.userId === outroId),
  );
  if (achou) return achou.conversaId;
  const c = await prisma.conversa.create({
    data: { participantes: { create: [{ userId: meuId }, { userId: outroId }] } },
  });
  return c.id;
}

export interface ConversaItem {
  id: string;
  titulo: string;
  ultima: string;
  ultimaMsgEm: Date;
}

export async function minhasConversas(userId: string): Promise<ConversaItem[]> {
  const cps = await prisma.conversaParticipante.findMany({
    where: { userId },
    include: {
      conversa: {
        include: {
          participantes: { include: { user: { select: { id: true, nome: true } } } },
          mensagens: { orderBy: { criadoEm: 'desc' }, take: 1 },
        },
      },
    },
  });
  return cps
    .map((cp) => {
      const outros = cp.conversa.participantes
        .filter((p) => p.userId !== userId)
        .map((p) => p.user.nome);
      const m = cp.conversa.mensagens[0];
      const ultima = m ? (m.tipo === 'convite' ? `📅 ${m.texto}` : m.texto) : 'Sem mensagens';
      return { id: cp.conversaId, titulo: outros.join(', ') || 'Conversa', ultima, ultimaMsgEm: cp.conversa.ultimaMsgEm };
    })
    .sort((a, b) => b.ultimaMsgEm.getTime() - a.ultimaMsgEm.getTime());
}

export interface MensagemView {
  id: string;
  autorId: string;
  autor: string;
  tipo: string;
  texto: string;
  reuniaoId: string | null;
  criadoEm: string;
}

export async function mensagens(
  conversaId: string,
  userId: string,
  desde?: string,
): Promise<MensagemView[] | null> {
  if (!(await participaDaConversa(conversaId, userId))) return null;
  const desdeDt = desde ? new Date(desde) : null;
  const msgs = await prisma.mensagemChat.findMany({
    where: { conversaId, ...(desdeDt && !isNaN(desdeDt.getTime()) ? { criadoEm: { gt: desdeDt } } : {}) },
    include: { autor: { select: { nome: true } } },
    orderBy: { criadoEm: 'asc' },
    take: 200,
  });
  return msgs.map((m) => ({
    id: m.id,
    autorId: m.autorId,
    autor: m.autor.nome,
    tipo: m.tipo,
    texto: m.texto,
    reuniaoId: m.reuniaoId,
    criadoEm: m.criadoEm.toISOString(),
  }));
}

export async function enviarMensagem(
  conversaId: string,
  userId: string,
  texto: string,
): Promise<boolean> {
  const t = texto.trim();
  if (!t || !(await participaDaConversa(conversaId, userId))) return false;
  await prisma.$transaction([
    prisma.mensagemChat.create({ data: { conversaId, autorId: userId, texto: t.slice(0, 2000) } }),
    prisma.conversa.update({ where: { id: conversaId }, data: { ultimaMsgEm: new Date() } }),
  ]);
  return true;
}

/** Envia um convite de reunião na conversa e adiciona todos como convidados. */
export async function enviarConviteNoChat(
  conversaId: string,
  userId: string,
  reuniaoId: string,
): Promise<boolean> {
  if (!(await participaDaConversa(conversaId, userId))) return false;
  const r = await prisma.reuniao.findUnique({ where: { id: reuniaoId }, include: { participantes: true } });
  if (!r || r.cancelada) return false;
  const podeCompartilhar =
    r.organizadorId === userId || r.participantes.some((p) => p.userId === userId);
  if (!podeCompartilhar) return false;

  const cps = await prisma.conversaParticipante.findMany({
    where: { conversaId },
    include: { user: { select: { id: true, email: true } } },
  });
  for (const cp of cps) {
    await prisma.participante.upsert({
      where: { reuniaoId_email: { reuniaoId, email: cp.user.email } },
      update: {},
      create: { reuniaoId, email: cp.user.email, userId: cp.user.id, status: 'convidado' },
    });
  }
  await prisma.$transaction([
    prisma.mensagemChat.create({
      data: { conversaId, autorId: userId, tipo: 'convite', texto: `Convite: ${r.titulo}`, reuniaoId },
    }),
    prisma.conversa.update({ where: { id: conversaId }, data: { ultimaMsgEm: new Date() } }),
  ]);
  return true;
}
