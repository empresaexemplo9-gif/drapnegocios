/**
 * Repositórios de domínio — todas as leituras/escritas passam por `withTenant`,
 * ficando sujeitas ao RLS. Devolvem tipos simples (sem Decimal/enum cru) para a
 * UI. Esta camada substitui os mocks em memória (dados.ts/usuarios.ts/planos.ts)
 * pelas tabelas reais.
 */
import { withTenant, prisma } from './prisma';
import { dePlanoDb, paraPlanoDb, type ChavePlano } from '../planos';
import { classificar } from '../classificacao';
import { ordenarPorVisibilidade, rotuloDestaque, alcanceLabel } from '../visibilidade';
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
  perfil: {
    tipo: string;
    areaAtuacao: string;
    regiao: string;
    bio: string;
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
      perfil: u.profile
        ? {
            tipo: u.profile.tipo,
            areaAtuacao: u.profile.areaAtuacao ?? '',
            regiao: u.profile.regiao ?? '',
            bio: u.profile.bio ?? '',
            visibilidadePublica: u.profile.visibilidadePublica,
          }
        : null,
    };
  });
}

export async function salvarPerfil(
  tenantId: string,
  userId: string,
  dados: { areaAtuacao: string; regiao: string; bio: string },
): Promise<void> {
  await withTenant(tenantId, async (db) => {
    const existe = await db.profile.findFirst({ where: { userId, tenantId } });
    if (existe) {
      await db.profile.update({ where: { id: existe.id }, data: dados });
    } else {
      await db.profile.create({
        data: { tenantId, userId, tipo: 'empresa_contratante', ...dados },
      });
    }
  });
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

/** Board público: vagas abertas de todos os negócios. */
export async function listarVagasPublicas(): Promise<VagaPublica[]> {
  const jobs = await prisma.job.findMany({
    where: { status: 'aberta' },
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
  const aval = classificar(candidato, vaga);
  const tenantId = job.tenantId;

  await withTenant(tenantId, async (db) => {
    const app = await db.application.create({
      data: {
        tenantId,
        jobId,
        candidateId,
        curriculoUrl: dados.curriculoUrl || null,
        scoreIa: aval.score,
        classificacaoIa: aval.criterios,
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
        modelo: 'heuristica-v1',
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
  categoria: string;
  preco: string;
  regiao: string;
  descricao: string;
  /** Visibilidade por plano do vendedor (selo e alcance). */
  destaque: string | null;
  alcance: string;
}

function precoFmt(preco: unknown): string {
  const n = Number(preco);
  if (!Number.isFinite(n) || n <= 0) return 'Sob consulta';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Vitrine pública: produtos/serviços ativos, ordenados por relevância + plano. */
export async function listarVitrine(): Promise<ItemVitrine[]> {
  const produtos = await prisma.product.findMany({
    where: { status: 'ativo' },
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
        categoria: p.categoria ?? 'Geral',
        preco: precoFmt(p.preco),
        regiao: p.regiaoAtendimento ?? 'Remoto',
        descricao: p.descricao,
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
  categoria: string;
  preco: string;
  regiao: string;
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
        categoria: dados.categoria || null,
        preco: Number.isFinite(precoNum) && precoNum > 0 ? precoNum.toFixed(2) : null,
        regiaoAtendimento: dados.regiao || null,
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
