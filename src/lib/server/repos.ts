/**
 * Repositórios de domínio — todas as leituras/escritas passam por `withTenant`,
 * ficando sujeitas ao RLS. Devolvem tipos simples (sem Decimal/enum cru) para a
 * UI. Esta camada substitui os mocks em memória (dados.ts/usuarios.ts/planos.ts)
 * pelas tabelas reais.
 */
import { withTenant, prisma } from './prisma';
import { dePlanoDb, paraPlanoDb, type ChavePlano } from '../planos';
import { classificarComIA } from './classificacao-ia';
import { ordenarPorVisibilidade, rotuloDestaque, alcanceLabel } from '../visibilidade';
import { pontuarPerfil } from './score';
import type { Candidato } from '../candidatos';
import type { Vaga as VagaMock } from '../dados';

export interface UsuarioView {
  id: string;
  nome: string;
  email: string;
  papel: string;
  tipoPerfil: string;
  scoreIa: number;
  plano: ChavePlano;
  avatarUrl: string;
  perfil: {
    tipo: string;
    areaAtuacao: string;
    regiao: string;
    bio: string;
    bannerUrl: string;
    representa: string;
    visibilidadePublica: boolean;
  } | null;
}

/** Usuário + perfil + plano do tenant (para /painel). */
export async function carregarUsuario(
  tenantId: string,
  userId: string,
): Promise<UsuarioView | null> {
  return withTenant(tenantId, async (db) => {
    const u = await db.user.findFirst({
      where: { id: userId, tenantId },
      include: { profile: true, tenant: true },
    });
    if (!u) return null;
    return {
      id: u.id,
      nome: u.nome,
      email: u.email,
      papel: u.papel,
      tipoPerfil: u.tipoPerfil,
      scoreIa: u.scoreIa,
      plano: dePlanoDb(u.tenant.plano),
      avatarUrl: u.avatarUrl ?? '',
      perfil: u.profile
        ? {
            tipo: u.profile.tipo,
            areaAtuacao: u.profile.areaAtuacao ?? '',
            regiao: u.profile.regiao ?? '',
            bio: u.profile.bio ?? '',
            bannerUrl: u.profile.bannerUrl ?? '',
            representa: u.profile.representa ?? '',
            visibilidadePublica: u.profile.visibilidadePublica,
          }
        : null,
    };
  });
}

export interface DadosPerfil {
  areaAtuacao: string;
  regiao: string;
  bio: string;
  bannerUrl: string;
  representa: string;
  avatarUrl: string;
  visibilidadePublica: boolean;
}

export async function salvarPerfil(
  tenantId: string,
  userId: string,
  dados: DadosPerfil,
): Promise<void> {
  await withTenant(tenantId, async (db) => {
    await db.user.update({ where: { id: userId }, data: { avatarUrl: dados.avatarUrl || null } });
    const campos = {
      areaAtuacao: dados.areaAtuacao,
      regiao: dados.regiao,
      bio: dados.bio,
      bannerUrl: dados.bannerUrl || null,
      representa: dados.representa || null,
      visibilidadePublica: dados.visibilidadePublica,
    };
    const existe = await db.profile.findFirst({ where: { userId, tenantId } });
    if (existe) {
      await db.profile.update({ where: { id: existe.id }, data: campos });
    } else {
      await db.profile.create({ data: { tenantId, userId, tipo: 'empresa_contratante', ...campos } });
    }
  });
}

// ───────────────────────── Diretório de perfis (busca pública) ─────────────────────────

export interface PerfilPublico {
  id: string; // userId
  nome: string;
  avatarUrl: string;
  bannerUrl: string;
  tipoPerfil: string; // pessoa_fisica | empresa | autonomo
  tipoProfile: string; // candidato | empresa_contratante | vendedor | comprador
  areaAtuacao: string;
  regiao: string;
  representa: string;
  bio: string;
  destaque: string | null;
  score: number;
}

export interface FiltrosPerfil {
  q?: string;
  tipoPerfil?: string; // User.tipoPerfil
  tipoProfile?: string; // Profile.tipo
  area?: string;
  regiao?: string;
}

/** Busca pública de perfis (visíveis), ordenada por destaque do plano. */
export async function buscarPerfis(f: FiltrosPerfil): Promise<PerfilPublico[]> {
  const q = f.q?.trim();
  const profs = await prisma.profile.findMany({
    where: {
      visibilidadePublica: true,
      ...(f.tipoProfile ? { tipo: f.tipoProfile as never } : {}),
      ...(f.area ? { areaAtuacao: { contains: f.area, mode: 'insensitive' } } : {}),
      ...(f.regiao ? { regiao: { contains: f.regiao, mode: 'insensitive' } } : {}),
      ...(f.tipoPerfil ? { user: { is: { tipoPerfil: f.tipoPerfil as never } } } : {}),
      ...(q
        ? {
            OR: [
              { user: { is: { nome: { contains: q, mode: 'insensitive' } } } },
              { representa: { contains: q, mode: 'insensitive' } },
              { areaAtuacao: { contains: q, mode: 'insensitive' } },
              { bio: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      user: {
        select: {
          nome: true,
          avatarUrl: true,
          tipoPerfil: true,
          _count: { select: { posts: true, products: true, jobs: true } },
        },
      },
      tenant: { select: { plano: true } },
    },
    take: 120,
  });
  const mapeado = profs.map((p) => {
    const { score } = pontuarPerfil({
      avatar: Boolean(p.user.avatarUrl),
      banner: Boolean(p.bannerUrl),
      bio: Boolean(p.bio),
      area: Boolean(p.areaAtuacao),
      regiao: Boolean(p.regiao),
      representa: Boolean(p.representa),
      posts: p.user._count.posts,
      itens: p.user._count.products + p.user._count.jobs,
    });
    return {
      perfil: {
        id: p.userId,
        nome: p.user.nome,
        avatarUrl: p.user.avatarUrl ?? '',
        bannerUrl: p.bannerUrl ?? '',
        tipoPerfil: p.user.tipoPerfil,
        tipoProfile: p.tipo,
        areaAtuacao: p.areaAtuacao ?? '',
        regiao: p.regiao ?? '',
        representa: p.representa ?? '',
        bio: p.bio ?? '',
        destaque: rotuloDestaque(dePlanoDb(p.tenant.plano)),
        score,
      } as PerfilPublico,
      plano: dePlanoDb(p.tenant.plano),
    };
  });
  // Ordena por score do perfil + boost do plano.
  return ordenarPorVisibilidade(mapeado, (x) => x.perfil.score, (x) => x.plano).map((x) => x.perfil);
}

export async function perfilPublicoPorId(userId: string): Promise<PerfilPublico | null> {
  const p = await prisma.profile.findFirst({
    where: { userId, visibilidadePublica: true },
    include: {
      user: {
        select: {
          nome: true,
          avatarUrl: true,
          tipoPerfil: true,
          _count: { select: { posts: true, products: true, jobs: true } },
        },
      },
      tenant: { select: { plano: true } },
    },
  });
  if (!p) return null;
  const { score } = pontuarPerfil({
    avatar: Boolean(p.user.avatarUrl),
    banner: Boolean(p.bannerUrl),
    bio: Boolean(p.bio),
    area: Boolean(p.areaAtuacao),
    regiao: Boolean(p.regiao),
    representa: Boolean(p.representa),
    posts: p.user._count.posts,
    itens: p.user._count.products + p.user._count.jobs,
  });
  return {
    id: p.userId,
    nome: p.user.nome,
    avatarUrl: p.user.avatarUrl ?? '',
    bannerUrl: p.bannerUrl ?? '',
    tipoPerfil: p.user.tipoPerfil,
    tipoProfile: p.tipo,
    areaAtuacao: p.areaAtuacao ?? '',
    regiao: p.regiao ?? '',
    representa: p.representa ?? '',
    bio: p.bio ?? '',
    destaque: rotuloDestaque(dePlanoDb(p.tenant.plano)),
    score,
  };
}

export interface VagaView {
  id: string;
  titulo: string;
  status: string;
}

export async function listarVagas(tenantId: string): Promise<VagaView[]> {
  return withTenant(tenantId, (db) =>
    db.job
      .findMany({ where: { tenantId }, orderBy: { criadoEm: 'desc' }, take: 50 })
      .then((vs) => vs.map((v) => ({ id: v.id, titulo: v.titulo, status: v.status }))),
  );
}

export interface CandidatoRanqueado {
  applicationId: string;
  nome: string;
  area: string;
  regiao: string;
  score: number;
  resumo: string;
  criterios: { aderencia: number; experiencia: number; certificacoes: number; referencias: number };
  /** Plano do candidato (do tenant dele) e selo de destaque, se houver. */
  planoCandidato: ChavePlano;
  destaque: string | null;
}

/**
 * Ranking de candidatos de uma vaga. Ordena por mérito (score da IA) + boost de
 * visibilidade do plano do candidato — o score exibido continua sendo o mérito
 * real; o plano só melhora o posicionamento e adiciona o selo de destaque.
 */
export async function ranquearCandidatos(
  tenantId: string,
  jobId: string,
): Promise<CandidatoRanqueado[]> {
  return withTenant(tenantId, async (db) => {
    const apps = await db.application.findMany({
      where: { jobId, tenantId },
      include: { candidate: { include: { profile: true, tenant: { select: { plano: true } } } } },
      orderBy: { scoreIa: 'desc' },
    });
    // Resumos de IA por referência (application.id).
    const analises = await db.aiAnalysis.findMany({
      where: { tenantId, tipo: 'curriculo', referenciaId: { in: apps.map((a) => a.id) } },
    });
    const resumoPorRef = new Map(analises.map((a) => [a.referenciaId, a.resumo ?? '']));

    const lista: CandidatoRanqueado[] = apps.map((a) => {
      const c = (a.classificacaoIa as Record<string, number> | null) ?? {};
      const planoCandidato = dePlanoDb(a.candidate.tenant.plano);
      return {
        applicationId: a.id,
        nome: a.candidate.nome,
        area: a.candidate.profile?.areaAtuacao ?? '—',
        regiao: a.candidate.profile?.regiao ?? '—',
        score: a.scoreIa ?? 0,
        resumo: resumoPorRef.get(a.id) ?? '',
        criterios: {
          aderencia: Number(c.aderencia ?? 0),
          experiencia: Number(c.experiencia ?? 0),
          certificacoes: Number(c.certificacoes ?? 0),
          referencias: Number(c.referencias ?? 0),
        },
        planoCandidato,
        destaque: rotuloDestaque(planoCandidato),
      };
    });

    // Reordena por mérito + boost de visibilidade do plano do candidato.
    return ordenarPorVisibilidade(
      lista,
      (x) => x.score,
      (x) => x.planoCandidato,
    );
  });
}

export interface MetricasPrime {
  curriculosAnalisados: number;
  scoreMedio: number;
}

export async function metricasPrime(tenantId: string): Promise<MetricasPrime> {
  return withTenant(tenantId, async (db) => {
    const agg = await db.application.aggregate({
      _count: { _all: true },
      _avg: { scoreIa: true },
      where: { tenantId, scoreIa: { not: null } },
    });
    return {
      curriculosAnalisados: agg._count._all,
      scoreMedio: Math.round(agg._avg.scoreIa ?? 0),
    };
  });
}

/** Assina/troca o plano: atualiza o tenant e registra a assinatura. */
export async function assinarPlano(
  tenantId: string,
  chave: ChavePlano,
  trialDias = 0,
): Promise<void> {
  const planoDb = paraPlanoDb(chave);
  await withTenant(tenantId, async (db) => {
    await db.tenant.update({
      where: { id: tenantId },
      data: { plano: planoDb, statusAssinatura: trialDias > 0 ? 'trial' : 'ativa' },
    });
    await db.subscription.create({
      data: {
        tenantId,
        plano: planoDb,
        status: trialDias > 0 ? 'trial' : 'ativa',
        renovaEm: new Date(Date.now() + (trialDias > 0 ? trialDias : 30) * 864e5),
      },
    });
  });
}

/** Plano atual do tenant (para gates de UI). */
export async function planoDoTenant(tenantId: string): Promise<ChavePlano> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { plano: true } });
  return dePlanoDb(t?.plano ?? 'free');
}

// ───────────────────────── Marketplace de vagas ─────────────────────────

export interface VagaPublica {
  id: string;
  titulo: string;
  empresa: string;
  area: string;
  regiao: string;
  nivel: string;
  tipoContrato: string;
  descricao: string;
  habilidades: string[];
}

function listaSeparada(v: string): string[] {
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export interface FiltrosVaga {
  q?: string;
  area?: string;
  regiao?: string;
  tipoContrato?: string;
}

/** Board público: vagas abertas de todos os negócios (com filtros opcionais). */
export async function listarVagasPublicas(f: FiltrosVaga = {}): Promise<VagaPublica[]> {
  const q = f.q?.trim();
  const jobs = await prisma.job.findMany({
    where: {
      status: 'aberta',
      ...(f.area ? { area: { contains: f.area, mode: 'insensitive' } } : {}),
      ...(f.regiao ? { regiao: { contains: f.regiao, mode: 'insensitive' } } : {}),
      ...(f.tipoContrato ? { tipoContrato: f.tipoContrato as never } : {}),
      ...(q
        ? {
            OR: [
              { titulo: { contains: q, mode: 'insensitive' } },
              { descricao: { contains: q, mode: 'insensitive' } },
              { habilidades: { has: q } },
            ],
          }
        : {}),
    },
    include: { tenant: { select: { nome: true } } },
    orderBy: { criadoEm: 'desc' },
    take: 100,
  });
  return jobs.map((j) => ({
    id: j.id,
    titulo: j.titulo,
    empresa: j.tenant.nome,
    area: j.area ?? '—',
    regiao: j.regiao ?? 'Remoto',
    nivel: j.nivel,
    tipoContrato: j.tipoContrato,
    descricao: j.descricao,
    habilidades: j.habilidades,
  }));
}

export async function vagaPublicaPorId(id: string): Promise<VagaPublica | null> {
  const j = await prisma.job.findFirst({
    where: { id, status: 'aberta' },
    include: { tenant: { select: { nome: true } } },
  });
  if (!j) return null;
  return {
    id: j.id,
    titulo: j.titulo,
    empresa: j.tenant.nome,
    area: j.area ?? '—',
    regiao: j.regiao ?? 'Remoto',
    nivel: j.nivel,
    tipoContrato: j.tipoContrato,
    descricao: j.descricao,
    habilidades: j.habilidades,
  };
}

export interface NovaVaga {
  titulo: string;
  descricao: string;
  area: string;
  regiao: string;
  habilidades: string; // separadas por vírgula
  nivel: string;
  tipoContrato: string;
}

export async function criarVaga(tenantId: string, userId: string, dados: NovaVaga): Promise<void> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { plano: true } });
  await withTenant(tenantId, (db) =>
    db.job.create({
      data: {
        tenantId,
        empresaId: userId,
        titulo: dados.titulo,
        descricao: dados.descricao,
        area: dados.area || null,
        regiao: dados.regiao || null,
        habilidades: listaSeparada(dados.habilidades),
        nivel: (dados.nivel || 'pleno') as never,
        tipoContrato: (dados.tipoContrato || 'CLT') as never,
        planoNaPublicacao: (t?.plano ?? 'free') as never,
      },
    }),
  );
}

export interface MinhaVaga {
  id: string;
  titulo: string;
  status: string;
  candidaturas: number;
}

export async function minhasVagas(tenantId: string): Promise<MinhaVaga[]> {
  return withTenant(tenantId, async (db) => {
    const jobs = await db.job.findMany({
      where: { tenantId },
      include: { _count: { select: { applications: true } } },
      orderBy: { criadoEm: 'desc' },
    });
    return jobs.map((j) => ({
      id: j.id,
      titulo: j.titulo,
      status: j.status,
      candidaturas: j._count.applications,
    }));
  });
}

export async function fecharVaga(tenantId: string, jobId: string): Promise<void> {
  await withTenant(tenantId, (db) =>
    db.job.updateMany({ where: { id: jobId, tenantId }, data: { status: 'fechada' } }),
  );
}

export interface DadosCandidatura {
  habilidades: string; // separadas por vírgula
  anosExperiencia: number;
  certificacoes: number;
  referencias: number;
  formacao?: string;
  curriculoUrl?: string;
}

/**
 * Candidatura a uma vaga + classificação pela IA (heurística determinística;
 * aprofunda com a Anthropic quando a chave estiver ativa). Grava a application
 * sob o tenant da vaga e cria o registro de análise para o ranking do Prime.
 */
export async function candidatar(
  jobId: string,
  candidateId: string,
  candidateNome: string,
  dados: DadosCandidatura,
): Promise<{ ok: boolean; erro?: string; score?: number }> {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.status !== 'aberta') return { ok: false, erro: 'Vaga indisponível.' };

  const jaExiste = await prisma.application.findUnique({
    where: { jobId_candidateId: { jobId, candidateId } },
  });
  if (jaExiste) return { ok: false, erro: 'Você já se candidatou a esta vaga.' };

  const candidato: Candidato = {
    id: candidateId,
    nome: candidateNome,
    area: job.area ?? '',
    regiao: job.regiao ?? '',
    anosExperiencia: dados.anosExperiencia,
    formacao: dados.formacao ?? '',
    certificacoes: Array.from({ length: dados.certificacoes }, (_, i) => `Certificação ${i + 1}`),
    habilidades: listaSeparada(dados.habilidades),
    referencias: dados.referencias,
    resumo: '',
  };
  const vaga: VagaMock = {
    id: job.id,
    titulo: job.titulo,
    empresa: '',
    tipo: 'PJ',
    area: job.area ?? '',
    regiao: job.regiao ?? '',
    habilidades: job.habilidades,
    descricao: job.descricao,
    salario: '',
  };
  const aval = await classificarComIA(candidato, vaga);
  const tenantId = job.tenantId;

  await withTenant(tenantId, async (db) => {
    const app = await db.application.create({
      data: {
        tenantId,
        jobId,
        candidateId,
        curriculoUrl: dados.curriculoUrl || null,
        scoreIa: aval.score,
        classificacaoIa: {
          aderencia: aval.criterios.aderencia,
          experiencia: aval.criterios.experiencia,
          certificacoes: aval.criterios.certificacoes,
          referencias: aval.criterios.referencias,
        },
        status: 'em_analise',
      },
    });
    await db.aiAnalysis.create({
      data: {
        tenantId,
        tipo: 'curriculo',
        referenciaId: app.id,
        score: aval.score,
        resumo: aval.resumo,
        modelo: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6' : 'heuristica-v1',
      },
    });
  });

  return { ok: true, score: aval.score };
}

// ───────────────────────── Vitrine (produtos e serviços) ─────────────────────────

export interface ItemVitrine {
  id: string;
  nome: string;
  vendedor: string;
  vendedorId: string; // userId do vendedor (p/ captação de lead)
  tipo: string; // produto | servico
  categoria: string;
  preco: string;
  regiao: string;
  descricao: string;
  imagemUrl: string;
  /** Visibilidade por plano do vendedor (selo e alcance). */
  destaque: string | null;
  alcance: string;
}

function precoFmt(preco: unknown): string {
  const n = Number(preco);
  if (!Number.isFinite(n) || n <= 0) return 'Sob consulta';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function primeiraImagem(imagens: unknown): string {
  return Array.isArray(imagens) && typeof imagens[0] === 'string' ? imagens[0] : '';
}

export interface FiltrosVitrine {
  q?: string;
  tipo?: string; // produto | servico
  categoria?: string;
  regiao?: string;
}

/** Vitrine pública: produtos/serviços ativos, ordenados por relevância + plano. */
export async function listarVitrine(f: FiltrosVitrine = {}): Promise<ItemVitrine[]> {
  const q = f.q?.trim();
  const produtos = await prisma.product.findMany({
    where: {
      status: 'ativo',
      ...(f.tipo ? { tipo: f.tipo as never } : {}),
      ...(f.categoria ? { categoria: { contains: f.categoria, mode: 'insensitive' } } : {}),
      ...(f.regiao ? { regiaoAtendimento: { contains: f.regiao, mode: 'insensitive' } } : {}),
      ...(q
        ? {
            OR: [
              { nome: { contains: q, mode: 'insensitive' } },
              { descricao: { contains: q, mode: 'insensitive' } },
              { categoria: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: { seller: { select: { nome: true } }, tenant: { select: { nome: true, plano: true } } },
    orderBy: { criadoEm: 'desc' },
    take: 100,
  });
  const mapeado = produtos.map((p) => {
    const plano = dePlanoDb(p.tenant.plano);
    return {
      item: {
        id: p.id,
        nome: p.nome,
        vendedor: p.seller?.nome ?? p.tenant.nome,
        vendedorId: p.sellerId,
        tipo: p.tipo,
        categoria: p.categoria ?? 'Geral',
        preco: precoFmt(p.preco),
        regiao: p.regiaoAtendimento ?? 'Remoto',
        descricao: p.descricao,
        imagemUrl: primeiraImagem(p.imagens),
        destaque: rotuloDestaque(plano),
        alcance: alcanceLabel(plano),
      } as ItemVitrine,
      relevancia: p.scoreRelevancia,
      plano,
    };
  });
  // Ordena por relevância + boost do plano; devolve só o item.
  return ordenarPorVisibilidade(mapeado, (x) => x.relevancia, (x) => x.plano).map((x) => x.item);
}

export interface NovoProduto {
  nome: string;
  descricao: string;
  tipo: string; // produto | servico
  categoria: string;
  preco: string;
  regiao: string;
  imagemUrl: string;
}

export async function criarProduto(tenantId: string, userId: string, dados: NovoProduto): Promise<void> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { plano: true } });
  const precoNum = Number(String(dados.preco).replace(',', '.'));
  await withTenant(tenantId, (db) =>
    db.product.create({
      data: {
        tenantId,
        sellerId: userId,
        nome: dados.nome,
        descricao: dados.descricao,
        tipo: (dados.tipo === 'servico' ? 'servico' : 'produto') as never,
        categoria: dados.categoria || null,
        preco: Number.isFinite(precoNum) && precoNum > 0 ? precoNum.toFixed(2) : null,
        regiaoAtendimento: dados.regiao || null,
        imagens: dados.imagemUrl ? [dados.imagemUrl] : [],
        planoNoCadastro: (t?.plano ?? 'free') as never,
        // Relevância base; cresce com engajamento/atualizações na fase seguinte.
        scoreRelevancia: 50,
      },
    }),
  );
}

export interface MeuProduto {
  id: string;
  nome: string;
  status: string;
  preco: string;
}

export async function meusProdutos(tenantId: string): Promise<MeuProduto[]> {
  return withTenant(tenantId, async (db) => {
    const ps = await db.product.findMany({ where: { tenantId }, orderBy: { criadoEm: 'desc' } });
    return ps.map((p) => ({ id: p.id, nome: p.nome, status: p.status, preco: precoFmt(p.preco) }));
  });
}

export async function removerProduto(tenantId: string, id: string): Promise<void> {
  await withTenant(tenantId, (db) =>
    db.product.updateMany({ where: { id, tenantId }, data: { status: 'inativo' } }),
  );
}

/** Itens públicos de um perfil: seus produtos/serviços ativos e vagas abertas. */
export async function itensDoPerfil(
  userId: string,
): Promise<{ produtos: ItemVitrine[]; vagas: VagaPublica[] }> {
  const [prods, jobs] = await Promise.all([
    prisma.product.findMany({
      where: { sellerId: userId, status: 'ativo' },
      include: { seller: { select: { nome: true } }, tenant: { select: { nome: true, plano: true } } },
      take: 50,
    }),
    prisma.job.findMany({
      where: { empresaId: userId, status: 'aberta' },
      include: { tenant: { select: { nome: true } } },
      take: 50,
    }),
  ]);
  const produtos: ItemVitrine[] = prods.map((p) => {
    const plano = dePlanoDb(p.tenant.plano);
    return {
      id: p.id,
      nome: p.nome,
      vendedor: p.seller?.nome ?? p.tenant.nome,
      vendedorId: p.sellerId,
      tipo: p.tipo,
      categoria: p.categoria ?? 'Geral',
      preco: precoFmt(p.preco),
      regiao: p.regiaoAtendimento ?? 'Remoto',
      descricao: p.descricao,
      imagemUrl: primeiraImagem(p.imagens),
      destaque: rotuloDestaque(plano),
      alcance: alcanceLabel(plano),
    };
  });
  const vagas: VagaPublica[] = jobs.map((j) => ({
    id: j.id,
    titulo: j.titulo,
    empresa: j.tenant.nome,
    area: j.area ?? '—',
    regiao: j.regiao ?? 'Remoto',
    nivel: j.nivel,
    tipoContrato: j.tipoContrato,
    descricao: j.descricao,
    habilidades: j.habilidades,
  }));
  return { produtos, vagas };
}
