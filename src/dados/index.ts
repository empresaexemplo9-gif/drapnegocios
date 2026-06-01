import type {
  BannerOferta,
  Destino,
  Hospedagem,
  LocacaoVeiculo,
  PacoteTurismo,
  PassagemAerea,
  PassagemOnibus,
  ProdutoViagem,
  SeguroViagem,
} from '../tipos';

/** Imagens de domínio público (Unsplash) usadas como ilustração no protótipo. */
const img = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

/** Banners do carrossel da tela inicial (inspirado no app da Decolar). */
export const banners: BannerOferta[] = [
  {
    id: 'b1',
    titulo: 'Verão no Nordeste',
    subtitulo: 'Voos + hotel com até 40% OFF',
    selo: 'Oferta relâmpago',
    categoria: 'turismo',
    imagem: img('photo-1559825481-12a05cc00344'),
  },
  {
    id: 'b2',
    titulo: 'Rio de Janeiro',
    subtitulo: 'Passagens aéreas a partir de R$ 189',
    selo: 'Voos',
    categoria: 'aereo',
    imagem: img('photo-1483729558449-99ef09a8c325'),
  },
  {
    id: 'b3',
    titulo: 'Serra Gaúcha',
    subtitulo: 'Pousadas charmosas em Gramado',
    selo: 'Hospedagem',
    categoria: 'hospedagem',
    imagem: img('photo-1610641818989-c2051b5e2cfd'),
  },
  {
    id: 'b4',
    titulo: 'Rodando o Brasil',
    subtitulo: 'Passagens de ônibus com cashback',
    selo: 'Ônibus',
    categoria: 'onibus',
    imagem: img('photo-1544620347-c4fd4a3d5957'),
  },
];

export const destinos: Destino[] = [
  { id: 'd1', cidade: 'Rio de Janeiro', uf: 'RJ', precoMin: 189, imagem: img('photo-1483729558449-99ef09a8c325', 500) },
  { id: 'd2', cidade: 'Salvador', uf: 'BA', precoMin: 159, imagem: img('photo-1591622180420-1b6e4d5b8e0a', 500) },
  { id: 'd3', cidade: 'Foz do Iguaçu', uf: 'PR', precoMin: 220, imagem: img('photo-1548675232-3bba9bf03f02', 500) },
  { id: 'd4', cidade: 'Gramado', uf: 'RS', precoMin: 240, imagem: img('photo-1610641818989-c2051b5e2cfd', 500) },
  { id: 'd5', cidade: 'Bonito', uf: 'MS', precoMin: 310, imagem: img('photo-1516815231560-8f41ec531527', 500) },
  { id: 'd6', cidade: 'Fortaleza', uf: 'CE', precoMin: 175, imagem: img('photo-1593958812614-2db6a598c71c', 500) },
  { id: 'd7', cidade: 'Florianópolis', uf: 'SC', precoMin: 199, imagem: img('photo-1559128010-7c1ad6e1b6a5', 500) },
  { id: 'd8', cidade: 'Manaus', uf: 'AM', precoMin: 280, imagem: img('photo-1591556250140-3a4e1e6b1f6a', 500) },
];

export const passagensOnibus: PassagemOnibus[] = [
  { id: 'o1', categoria: 'onibus', empresa: 'Cometa', origem: 'São Paulo', destino: 'Rio de Janeiro', partida: '07:00', chegada: '13:00', duracaoMin: 360, tipo: 'Executivo', preco: 129.9, assentos: 23 },
  { id: 'o2', categoria: 'onibus', empresa: 'Itapemirim', origem: 'São Paulo', destino: 'Rio de Janeiro', partida: '09:30', chegada: '15:45', duracaoMin: 375, tipo: 'Leito', preco: 189.9, assentos: 8 },
  { id: 'o3', categoria: 'onibus', empresa: '1001', origem: 'São Paulo', destino: 'Rio de Janeiro', partida: '23:00', chegada: '05:00', duracaoMin: 360, tipo: 'Semi-leito', preco: 149.9, assentos: 14 },
  { id: 'o4', categoria: 'onibus', empresa: 'Gontijo', origem: 'São Paulo', destino: 'Belo Horizonte', partida: '08:00', chegada: '16:30', duracaoMin: 510, tipo: 'Convencional', preco: 119.9, assentos: 31 },
  { id: 'o5', categoria: 'onibus', empresa: 'Util', origem: 'Rio de Janeiro', destino: 'Belo Horizonte', partida: '14:00', chegada: '20:30', duracaoMin: 390, tipo: 'Executivo', preco: 139.9, assentos: 19 },
  { id: 'o6', categoria: 'onibus', empresa: 'Catarinense', origem: 'Curitiba', destino: 'Florianópolis', partida: '06:15', chegada: '11:00', duracaoMin: 285, tipo: 'Executivo', preco: 99.9, assentos: 27 },
];

export const passagensAereas: PassagemAerea[] = [
  { id: 'a1', categoria: 'aereo', companhia: 'LATAM', origem: 'São Paulo', destino: 'Rio de Janeiro', partida: '06:20', chegada: '07:25', duracaoMin: 65, escalas: 0, classe: 'Econômica', bagagem: false, preco: 189.0 },
  { id: 'a2', categoria: 'aereo', companhia: 'GOL', origem: 'São Paulo', destino: 'Rio de Janeiro', partida: '10:10', chegada: '11:15', duracaoMin: 65, escalas: 0, classe: 'Econômica', bagagem: true, preco: 239.0 },
  { id: 'a3', categoria: 'aereo', companhia: 'Azul', origem: 'São Paulo', destino: 'Salvador', partida: '08:00', chegada: '10:35', duracaoMin: 155, escalas: 0, classe: 'Econômica', bagagem: true, preco: 359.0 },
  { id: 'a4', categoria: 'aereo', companhia: 'LATAM', origem: 'São Paulo', destino: 'Salvador', partida: '13:40', chegada: '17:50', duracaoMin: 250, escalas: 1, classe: 'Econômica', bagagem: false, preco: 299.0 },
  { id: 'a5', categoria: 'aereo', companhia: 'GOL', origem: 'Brasília', destino: 'Fortaleza', partida: '09:25', chegada: '12:05', duracaoMin: 160, escalas: 0, classe: 'Executiva', bagagem: true, preco: 689.0 },
  { id: 'a6', categoria: 'aereo', companhia: 'Azul', origem: 'São Paulo', destino: 'Foz do Iguaçu', partida: '07:45', chegada: '09:25', duracaoMin: 100, escalas: 0, classe: 'Econômica', bagagem: true, preco: 279.0 },
  { id: 'a7', categoria: 'aereo', companhia: 'LATAM', origem: 'São Paulo', destino: 'Buenos Aires', partida: '08:30', chegada: '11:25', duracaoMin: 175, escalas: 0, classe: 'Econômica', bagagem: true, preco: 1290.0 },
  { id: 'a8', categoria: 'aereo', companhia: 'TAP', origem: 'São Paulo', destino: 'Lisboa', partida: '22:10', chegada: '12:40', duracaoMin: 630, escalas: 0, classe: 'Econômica', bagagem: true, preco: 3490.0 },
];

export const locacoes: LocacaoVeiculo[] = [
  { id: 'l1', categoria: 'locacao', modelo: 'Fiat Mobi', categoriaVeiculo: 'Econômico', locadora: 'Localiza', cidade: 'Rio de Janeiro', uf: 'RJ', lugares: 5, cambio: 'Manual', arCondicionado: true, precoDia: 99.9, imagem: img('photo-1503376780353-7e6692767b70') },
  { id: 'l2', categoria: 'locacao', modelo: 'VW Polo', categoriaVeiculo: 'Intermediário', locadora: 'Movida', cidade: 'São Paulo', uf: 'SP', lugares: 5, cambio: 'Automático', arCondicionado: true, precoDia: 149.9, imagem: img('photo-1549924231-f129b911e442') },
  { id: 'l3', categoria: 'locacao', modelo: 'Jeep Compass', categoriaVeiculo: 'SUV', locadora: 'Unidas', cidade: 'Salvador', uf: 'BA', lugares: 5, cambio: 'Automático', arCondicionado: true, precoDia: 239.9, imagem: img('photo-1606664515524-ed2f786a0bd6') },
  { id: 'l4', categoria: 'locacao', modelo: 'Toyota Corolla', categoriaVeiculo: 'Premium', locadora: 'Localiza', cidade: 'Foz do Iguaçu', uf: 'PR', lugares: 5, cambio: 'Automático', arCondicionado: true, precoDia: 199.9, imagem: img('photo-1621007947382-bb3c3994e3fb') },
];

export const seguros: SeguroViagem[] = [
  { id: 's1', categoria: 'seguro', plano: 'Nacional Essencial', cobertura: 'Cobertura básica para viagens dentro do Brasil', abrangencia: 'Nacional', coberturaMedica: 20000, incluiBagagem: false, incluiCancelamento: false, precoDia: 9.9, beneficios: ['Assistência médica 24h', 'Remoção médica', 'Suporte por telefone'] },
  { id: 's2', categoria: 'seguro', plano: 'Nacional Plus', cobertura: 'Cobertura ampliada com bagagem', abrangencia: 'Nacional', coberturaMedica: 40000, incluiBagagem: true, incluiCancelamento: true, precoDia: 16.9, beneficios: ['Assistência médica 24h', 'Bagagem extraviada', 'Cancelamento de viagem', 'Traslado médico'] },
  { id: 's3', categoria: 'seguro', plano: 'Internacional 30k', cobertura: 'Ideal para América do Sul', abrangencia: 'Internacional', coberturaMedica: 30000, incluiBagagem: true, incluiCancelamento: false, precoDia: 24.9, beneficios: ['Cobertura médica USD 30 mil', 'Bagagem extraviada', 'Assistência odontológica'] },
  { id: 's4', categoria: 'seguro', plano: 'Internacional 60k', cobertura: 'Cobertura premium para qualquer destino', abrangencia: 'Internacional', coberturaMedica: 60000, incluiBagagem: true, incluiCancelamento: true, precoDia: 39.9, beneficios: ['Cobertura médica USD 60 mil', 'Bagagem extraviada', 'Cancelamento de viagem', 'Cobertura para esportes'] },
];

export const hospedagens: Hospedagem[] = [
  { id: 'h1', categoria: 'hospedagem', nome: 'Hotel Copacabana Vista Mar', cidade: 'Rio de Janeiro', uf: 'RJ', tipo: 'Hotel', estrelas: 4, avaliacao: 9.1, totalAvaliacoes: 1240, precoNoite: 459, comodidades: ['Wi-Fi grátis', 'Café da manhã', 'Piscina', 'Vista para o mar'], imagem: img('photo-1566073771259-6a8506099945'), descricao: 'Hotel pé na areia em Copacabana, com piscina na cobertura e café da manhã incluso.' },
  { id: 'h2', categoria: 'hospedagem', nome: 'Pousada Recanto da Serra', cidade: 'Gramado', uf: 'RS', tipo: 'Pousada', estrelas: 4, avaliacao: 9.4, totalAvaliacoes: 860, precoNoite: 389, comodidades: ['Wi-Fi grátis', 'Café colonial', 'Lareira', 'Estacionamento'], imagem: img('photo-1618773928121-c32242e63f39'), descricao: 'Pousada aconchegante no centro de Gramado, a poucos passos da Rua Coberta.' },
  { id: 'h3', categoria: 'hospedagem', nome: 'Resort Praia dos Sonhos', cidade: 'Salvador', uf: 'BA', tipo: 'Resort', estrelas: 5, avaliacao: 9.0, totalAvaliacoes: 2010, precoNoite: 720, comodidades: ['All inclusive', 'Piscinas', 'Spa', 'Kids club'], imagem: img('photo-1571896349842-33c89424de2d'), descricao: 'Resort all inclusive de frente para o mar, ideal para famílias.' },
  { id: 'h4', categoria: 'hospedagem', nome: 'Hostel Centro Histórico', cidade: 'Salvador', uf: 'BA', tipo: 'Hostel', estrelas: 3, avaliacao: 8.5, totalAvaliacoes: 540, precoNoite: 95, comodidades: ['Wi-Fi grátis', 'Cozinha compartilhada', 'Café da manhã'], imagem: img('photo-1555854877-bab0e564b8d5'), descricao: 'Hostel descolado no Pelourinho, perto dos principais pontos turísticos.' },
  { id: 'h5', categoria: 'hospedagem', nome: 'Hotel Cataratas Garden', cidade: 'Foz do Iguaçu', uf: 'PR', tipo: 'Hotel', estrelas: 4, avaliacao: 8.9, totalAvaliacoes: 980, precoNoite: 410, comodidades: ['Wi-Fi grátis', 'Café da manhã', 'Piscina', 'Traslado'], imagem: img('photo-1568084680786-a84f91d1153c'), descricao: 'A poucos minutos das Cataratas, com traslado para o parque nacional.' },
];

export const pacotes: PacoteTurismo[] = [
  { id: 'p1', categoria: 'turismo', titulo: 'Salvador Histórica', destino: 'Salvador', uf: 'BA', dias: 5, inclui: ['Aéreo ida e volta', '4 noites de hotel', 'City tour no Pelourinho', 'Café da manhã'], avaliacao: 9.2, totalAvaliacoes: 430, preco: 1890, imagem: img('photo-1591622180420-1b6e4d5b8e0a'), descricao: 'Pacote completo para conhecer o centro histórico, praias e a culinária baiana.' },
  { id: 'p2', categoria: 'turismo', titulo: 'Bonito Ecoturismo', destino: 'Bonito', uf: 'MS', dias: 4, inclui: ['Aéreo + traslados', '3 noites de pousada', 'Flutuação no Rio da Prata', 'Gruta do Lago Azul'], avaliacao: 9.6, totalAvaliacoes: 310, preco: 2450, imagem: img('photo-1516815231560-8f41ec531527'), descricao: 'Águas cristalinas, grutas e trilhas no paraíso do ecoturismo brasileiro.' },
  { id: 'p3', categoria: 'turismo', titulo: 'Cataratas do Iguaçu', destino: 'Foz do Iguaçu', uf: 'PR', dias: 3, inclui: ['Aéreo ida e volta', '2 noites de hotel', 'Parque das Cataratas', 'Parque das Aves'], avaliacao: 9.3, totalAvaliacoes: 720, preco: 1390, imagem: img('photo-1548675232-3bba9bf03f02'), descricao: 'Uma das sete maravilhas da natureza em um pacote curto e inesquecível.' },
  { id: 'p4', categoria: 'turismo', titulo: 'Natal & Praias', destino: 'Natal', uf: 'RN', dias: 6, inclui: ['Aéreo ida e volta', '5 noites de resort', 'Passeio de buggy', 'All inclusive'], avaliacao: 9.0, totalAvaliacoes: 560, preco: 2990, imagem: img('photo-1559825481-12a05cc00344'), descricao: 'Dunas, praias e sol o ano inteiro na capital potiguar.' },
];

/** Busca produtos por categoria, aplicando filtro simples de origem/destino. */
export function buscarPorCategoria(
  categoria: string,
  filtro?: { origem?: string; destino?: string },
): ProdutoViagem[] {
  const norm = (s?: string) => (s ?? '').trim().toLowerCase();
  const destinoBusca = norm(filtro?.destino);
  const origemBusca = norm(filtro?.origem);

  switch (categoria) {
    case 'onibus':
      return passagensOnibus.filter(
        (p) =>
          (!origemBusca || norm(p.origem).includes(origemBusca)) &&
          (!destinoBusca || norm(p.destino).includes(destinoBusca)),
      );
    case 'aereo':
      return passagensAereas.filter(
        (p) =>
          (!origemBusca || norm(p.origem).includes(origemBusca)) &&
          (!destinoBusca || norm(p.destino).includes(destinoBusca)),
      );
    case 'hospedagem':
      return hospedagens.filter(
        (h) => !destinoBusca || norm(h.cidade).includes(destinoBusca),
      );
    case 'turismo':
      return pacotes.filter(
        (p) => !destinoBusca || norm(p.destino).includes(destinoBusca),
      );
    case 'locacao':
      return locacoes.filter(
        (l) => !destinoBusca || norm(l.cidade).includes(destinoBusca),
      );
    case 'seguro':
      return seguros;
    default:
      return [];
  }
}

/** Localiza um produto pelo id em todas as categorias. */
export function buscarProduto(id: string) {
  return (
    [
      ...passagensOnibus,
      ...passagensAereas,
      ...hospedagens,
      ...pacotes,
      ...locacoes,
      ...seguros,
    ].find((p) => p.id === id) ?? null
  );
}
