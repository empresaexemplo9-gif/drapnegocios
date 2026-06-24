/**
 * Planos de monetização por visibilidade (Free + Prime).
 *
 * O Prime expande o alcance da IA, o volume de currículos classificados por mês
 * e a profundidade da análise. Os preços são dinâmicos/editáveis pelo painel
 * admin — ficam em memória (globalThis) para sobreviver ao hot-reload do dev.
 * Quando o banco entrar, troca-se este módulo por uma tabela `planos`.
 */

export type ChavePlano = 'free' | 'basico' | 'pro' | 'elite';

/** Valor do enum `Plano` do banco (Prisma). */
export type PlanoDb = 'free' | 'prime_basico' | 'prime_pro' | 'prime_elite';

const DB_PARA_UI: Record<PlanoDb, ChavePlano> = {
  free: 'free',
  prime_basico: 'basico',
  prime_pro: 'pro',
  prime_elite: 'elite',
};
const UI_PARA_DB: Record<ChavePlano, PlanoDb> = {
  free: 'free',
  basico: 'prime_basico',
  pro: 'prime_pro',
  elite: 'prime_elite',
};

export function dePlanoDb(p: string): ChavePlano {
  return DB_PARA_UI[p as PlanoDb] ?? 'free';
}
export function paraPlanoDb(c: ChavePlano): PlanoDb {
  return UI_PARA_DB[c] ?? 'free';
}

/** Raio/nível de visibilidade direcionada (1–3) descrito na especificação. */
export type NivelVisibilidade = 0 | 1 | 2 | 3;

export interface Plano {
  chave: ChavePlano;
  nome: string;
  prime: boolean;
  /** Preço mensal em reais (editável no admin). */
  preco: number;
  /** Raio de alcance: 1 local/estadual, 2 regional/nacional, 3 nacional + home. */
  nivel: NivelVisibilidade;
  alcance: string;
  /** Currículos classificados pela IA por mês (Infinity = ilimitado). */
  curriculosMes: number;
  /** Profundidade da análise da IA. */
  profundidade: 'básica' | 'avançada' | 'completa';
  destaque?: boolean;
  recursos: string[];
}

const PADRAO: Record<ChavePlano, Plano> = {
  free: {
    chave: 'free',
    nome: 'Free',
    prime: false,
    preco: 0,
    nivel: 0,
    alcance: 'Visibilidade orgânica padrão',
    curriculosMes: 5,
    profundidade: 'básica',
    recursos: [
      'Perfil unificado e vitrine',
      'Publicação de vagas e produtos',
      'Até 5 currículos classificados por mês',
      'Visibilidade local para produtos, serviços e candidatura',
    ],
  },
  basico: {
    chave: 'basico',
    nome: 'Prime Básico',
    prime: true,
    preco: 49.9,
    nivel: 1,
    alcance: 'Nível 1 — destaque local e estadual',
    curriculosMes: 50,
    profundidade: 'avançada',
    recursos: [
      'Tudo do Free',
      'IA classifica até 50 currículos/mês',
      'Ranking automático com resumo por candidato',
      'Selo "Destaque" e alcance estadual: produtos, serviços e seu currículo',
      'Painel de métricas de visibilidade',
    ],
  },
  pro: {
    chave: 'pro',
    nome: 'Prime Pro',
    prime: true,
    preco: 99.9,
    nivel: 2,
    alcance: 'Nível 2 — alcance regional e nacional',
    curriculosMes: 200,
    profundidade: 'avançada',
    destaque: true,
    recursos: [
      'Tudo do Básico',
      'IA classifica até 200 currículos/mês',
      'Entrega proativa dos melhores talentos (sem candidatura ativa)',
      'Destaque Pro: vendedores e candidatos priorizados, alcance nacional',
      'Produtos com visibilidade por intenção de compra · relatório de ROI',
    ],
  },
  elite: {
    chave: 'elite',
    nome: 'Prime Elite',
    prime: true,
    preco: 199.9,
    nivel: 3,
    alcance: 'Nível 3 — alcance nacional + home',
    curriculosMes: Infinity,
    profundidade: 'completa',
    recursos: [
      'Tudo do Pro',
      'IA classifica currículos ilimitados/mês',
      'Análise completa (experiência, certificações, referências, histórico)',
      'Destaque Elite: topo da vitrine e do ranking + posição na home',
      'Curadoria proativa com maior raio de captação',
    ],
  },
};

const g = globalThis as unknown as { __drapPlanos?: Record<ChavePlano, Plano> };
g.__drapPlanos ??= structuredCloneSafe(PADRAO);
const planos = g.__drapPlanos;

function structuredCloneSafe(v: Record<ChavePlano, Plano>): Record<ChavePlano, Plano> {
  return JSON.parse(JSON.stringify(v)) as Record<ChavePlano, Plano>;
}

export const ORDEM: ChavePlano[] = ['free', 'basico', 'pro', 'elite'];

export function listarPlanos(): Plano[] {
  return ORDEM.map((c) => planos[c]);
}

export function planosPrime(): Plano[] {
  return listarPlanos().filter((p) => p.prime);
}

export function obterPlano(chave: ChavePlano): Plano {
  return planos[chave];
}

/** Atualiza o preço de um plano (painel admin). Ignora valores inválidos. */
export function definirPreco(chave: ChavePlano, preco: number): void {
  if (chave === 'free') return;
  if (!Number.isFinite(preco) || preco < 0) return;
  planos[chave].preco = Math.round(preco * 100) / 100;
}

export function precoFormatado(p: Plano): string {
  if (!p.prime || p.preco === 0) return 'Grátis';
  return p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function limiteCurriculos(p: Plano): string {
  return p.curriculosMes === Infinity ? 'Ilimitados' : String(p.curriculosMes);
}
