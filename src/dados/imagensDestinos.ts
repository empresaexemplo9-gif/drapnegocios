/**
 * Fotos reais dos destinos da vitrine (home + padrões do admin). As 5 cidades
 * principais usam arquivos LOCAIS (`public/destinos/*.jpg`, mais confiáveis);
 * os demais destinos usam Wikimedia Commons (uso livre, créditos ao lado).
 *
 * Fonte única: tanto a home (`app/(tabs)/index.tsx`) quanto os padrões de oferta
 * (`ofertasPadrao.ts`) consomem daqui, então site e admin ficam iguais.
 */
export const URLS_DESTINOS: Record<string, string> = {
  // Imagens LOCAIS (public/destinos/*.jpg) — mais confiáveis, sem hotlink.
  'rio-de-janeiro': '/destinos/rio.jpg',
  salvador: '/destinos/salvador.jpg',
  'sao-paulo': '/destinos/sao-paulo.jpg',
  florianopolis: '/destinos/florianopolis.jpg',
  'belo-horizonte': '/destinos/belo-horizonte.jpg',
  // Demais destinos — Wikimedia Commons (uso livre; créditos ao lado).
  // Fortaleza – Praia de Iracema — Mayra P. Munerato / CC BY-SA 3.0
  fortaleza:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Praia_de_Iracema_-_Fortaleza_CE.jpg/1920px-Praia_de_Iracema_-_Fortaleza_CE.jpg',
  // Recife – Marco Zero / Recife Antigo — Hans von Manteuffel / CC BY-SA 4.0
  recife:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Bairro_de_Recife_Antigo_com_Marco_Zero.jpg/1920px-Bairro_de_Recife_Antigo_com_Marco_Zero.jpg',
  // Foz do Iguaçu – Cataratas — Esin Üstün / CC BY 2.0
  'foz-do-iguacu':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Iguazu_Falls-_Brazil_%2814858965267%29.jpg/1920px-Iguazu_Falls-_Brazil_%2814858965267%29.jpg',
  // Natal – Ponte Newton Navarro — Marinelson Almeida / CC BY 2.0
  natal:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Ponte_Newton_Navarro_-_Natal_-_Brasil_%2833616371311%29.jpg/1920px-Ponte_Newton_Navarro_-_Natal_-_Brasil_%2833616371311%29.jpg',
  // Gramado – Centro — Augusto Janiski Junior / CC BY 2.0
  gramado:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/GRAMADO_-_RIO_GRANDE_DO_SUL_-_BRASIL_BY_AUGUSTO_JANISCKI_JUNIOR_%2814445422406%29.jpg/1920px-GRAMADO_-_RIO_GRANDE_DO_SUL_-_BRASIL_BY_AUGUSTO_JANISCKI_JUNIOR_%2814445422406%29.jpg',
};

/** URL real do destino, com fallback gracioso (Lorem Picsum) por slug. */
export function imagemDestino(slug: string): string {
  return URLS_DESTINOS[slug] ?? `https://picsum.photos/seed/vb-${slug}/900/594`;
}
