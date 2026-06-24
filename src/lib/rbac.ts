/**
 * Controle de acesso por papéis (RBAC) dentro de cada tenant.
 *
 * Papéis: super_admin > admin > manager > recruiter / seller > candidate / viewer.
 * `pode(papel, permissao)` é a verificação central usada em rotas e UI.
 *
 * Sem dependências de servidor — pode ser importado no cliente também.
 */

export type Papel =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'recruiter'
  | 'seller'
  | 'candidate'
  | 'viewer';

export type Permissao =
  | 'tenant:gerenciar'
  | 'usuarios:gerenciar'
  | 'config:editar'
  | 'vagas:ler'
  | 'vagas:gerenciar'
  | 'candidatos:ler'
  | 'candidatos:gerenciar'
  | 'produtos:ler'
  | 'produtos:gerenciar'
  | 'painel:ler';

const TODAS: Permissao[] = [
  'tenant:gerenciar',
  'usuarios:gerenciar',
  'config:editar',
  'vagas:ler',
  'vagas:gerenciar',
  'candidatos:ler',
  'candidatos:gerenciar',
  'produtos:ler',
  'produtos:gerenciar',
  'painel:ler',
];

const MATRIZ: Record<Papel, Permissao[]> = {
  super_admin: TODAS,
  admin: [
    'usuarios:gerenciar',
    'config:editar',
    'vagas:ler',
    'vagas:gerenciar',
    'candidatos:ler',
    'candidatos:gerenciar',
    'produtos:ler',
    'produtos:gerenciar',
    'painel:ler',
  ],
  manager: [
    'vagas:ler',
    'vagas:gerenciar',
    'candidatos:ler',
    'candidatos:gerenciar',
    'produtos:ler',
    'produtos:gerenciar',
    'painel:ler',
  ],
  recruiter: ['vagas:ler', 'vagas:gerenciar', 'candidatos:ler', 'candidatos:gerenciar', 'painel:ler'],
  seller: ['produtos:ler', 'produtos:gerenciar', 'painel:ler'],
  candidate: ['vagas:ler', 'produtos:ler'],
  viewer: ['vagas:ler', 'produtos:ler', 'candidatos:ler', 'painel:ler'],
};

export function pode(papel: Papel, permissao: Permissao): boolean {
  return MATRIZ[papel]?.includes(permissao) ?? false;
}

export function permissoesDe(papel: Papel): Permissao[] {
  return MATRIZ[papel] ?? [];
}

/** Papéis com acesso ao painel empresarial (excluem candidate). */
export function acessaPainelEmpresa(papel: Papel): boolean {
  return papel !== 'candidate';
}
