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

/** Banner do carrossel da tela inicial (referência: app da Decolar). */
export interface BannerOferta {
  id: string;
  titulo: string;
  subtitulo: string;
  selo: string;
  imagem: string;
  categoria: Categoria;
}
