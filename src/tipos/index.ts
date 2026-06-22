/** Papel do usuário autenticado (definido pelo backend). */
export type Papel = 'admin' | 'cliente' | 'consultor';

/** Categorias de produto vendidas no app. */
export type Categoria =
  | 'onibus'
  | 'aereo'
  | 'hospedagem'
  | 'turismo'
  | 'locacao'
  | 'seguro';

export interface Destino {
  id: string;
  cidade: string;
  uf: string;
  imagem: string;
  precoMin: number;
}

export interface PassagemOnibus {
  id: string;
  categoria: 'onibus';
  empresa: string;
  origem: string;
  destino: string;
  partida: string; // HH:mm
  chegada: string; // HH:mm
  duracaoMin: number;
  tipo: 'Convencional' | 'Executivo' | 'Semi-leito' | 'Leito';
  preco: number;
  assentos: number;
}

export interface PassagemAerea {
  id: string;
  categoria: 'aereo';
  companhia: string;
  origem: string;
  destino: string;
  partida: string;
  chegada: string;
  duracaoMin: number;
  escalas: number;
  classe: 'Econômica' | 'Executiva';
  bagagem: boolean;
  preco: number;
}

export interface Hospedagem {
  id: string;
  categoria: 'hospedagem';
  nome: string;
  cidade: string;
  uf: string;
  tipo: 'Hotel' | 'Pousada' | 'Resort' | 'Hostel';
  estrelas: number;
  avaliacao: number;
  totalAvaliacoes: number;
  precoNoite: number;
  comodidades: string[];
  imagem: string;
  descricao: string;
}

export interface PacoteTurismo {
  id: string;
  categoria: 'turismo';
  titulo: string;
  destino: string;
  uf: string;
  dias: number;
  inclui: string[];
  avaliacao: number;
  totalAvaliacoes: number;
  preco: number;
  imagem: string;
  descricao: string;
}

export interface LocacaoVeiculo {
  id: string;
  categoria: 'locacao';
  modelo: string;
  categoriaVeiculo: 'Econômico' | 'Intermediário' | 'SUV' | 'Premium';
  locadora: string;
  cidade: string;
  uf: string;
  lugares: number;
  cambio: 'Manual' | 'Automático';
  arCondicionado: boolean;
  precoDia: number;
  imagem: string;
}

export interface SeguroViagem {
  id: string;
  categoria: 'seguro';
  plano: string;
  cobertura: string;
  abrangencia: 'Nacional' | 'Internacional';
  coberturaMedica: number;
  incluiBagagem: boolean;
  incluiCancelamento: boolean;
  precoDia: number;
  beneficios: string[];
}

export type ProdutoViagem =
  | PassagemOnibus
  | PassagemAerea
  | Hospedagem
  | PacoteTurismo
  | LocacaoVeiculo
  | SeguroViagem;

/** Item adicionado ao carrinho/reservas. */
export interface ItemReserva {
  chave: string;
  categoria: Categoria;
  titulo: string;
  subtitulo: string;
  preco: number;
  produtoId: string;
}

/** Status de um lead aéreo (espelha o CHECK do banco). */
export type StatusLead = 'novo' | 'atribuido' | 'em_atendimento' | 'convertido' | 'perdido';

/** Lead aéreo como vem do banco (`leads_aereo`). */
export interface Lead {
  id: string;
  origem_cidade: string | null;
  destino_cidade: string | null;
  numero_passageiros: number;
  nomes: string[];
  data_ida: string;
  data_volta: string | null;
  classe: string;
  contato_nome: string | null;
  contato_telefone: string | null;
  origem: string | null;
  status: StatusLead;
  consultor_id: string | null;
  criado_em: string;
}

/** Seção da home onde a oferta aparece. */
export type SecaoHome = 'destaque' | 'oferta';

/** Mensagem do chat de um lead/atendimento (cliente ↔ consultor). */
export interface MensagemChat {
  id: string;
  autor: 'cliente' | 'consultor';
  texto: string;
  criado_em: string;
}

/** Status de um atendimento geral (espelha o CHECK da tabela `atendimentos`). */
export type StatusAtendimento = 'novo' | 'em_atendimento' | 'resolvido';

/**
 * Atendimento geral (chat livre cliente ↔ consultor, tabela `atendimentos`).
 * Distribuição ISOLADA dos leads aéreos (usa `consultores.carga_geral`).
 */
export interface Atendimento {
  id: string;
  status: StatusAtendimento;
  consultor_id: string | null;
  criado_em: string;
  ultima_mensagem: string | null;
  ultimo_autor: 'cliente' | 'consultor' | null;
  ultima_em: string | null;
}

/** Oferta da home (gerenciada pelo admin, tabela `home_ofertas`). */
export interface HomeOferta {
  id: string;
  titulo: string;
  cidade: string | null;
  preco: number | string | null;
  imagem_url: string | null;
  badge: string | null;
  ordem: number;
  ativo?: boolean;
  /** `destaque` = carrossel do topo; `oferta` = grade. */
  secao?: SecaoHome;
}

/** Banner do carrossel da tela inicial (referência: app da Decolar). */
export interface BannerOferta {
  id: string;
  titulo: string;
  subtitulo: string;
  selo: string;
  imagem: string;
  categoria: Categoria;
}
