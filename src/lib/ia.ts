/**
 * Geração de conteúdo de marketing com IA (Anthropic).
 *
 * Roda no servidor. Quando `ANTHROPIC_API_KEY` está definido, chama a API de
 * Messages da Anthropic; sem a chave (ou em falha), devolve um rascunho-modelo
 * para a tela continuar funcionando. Sem SDK — usa fetch.
 */

export interface BriefingConteudo {
  objetivo: string; // post, anúncio, story...
  tema: string;
  tom: string;
  redes: string[];
}

export interface ResultadoIA {
  texto: string;
  viaIA: boolean;
}

const MODELO = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';

export async function gerarConteudo(b: BriefingConteudo): Promise<ResultadoIA> {
  const chave = process.env.ANTHROPIC_API_KEY;
  if (!chave) return { texto: rascunho(b), viaIA: false };

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': chave,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODELO,
        max_tokens: 700,
        messages: [{ role: 'user', content: prompt(b) }],
      }),
    });
    if (!resp.ok) return { texto: rascunho(b), viaIA: false };
    const data = (await resp.json()) as { content?: { text?: string }[] };
    const texto = (data.content?.[0]?.text ?? '').trim();
    return texto ? { texto, viaIA: true } : { texto: rascunho(b), viaIA: false };
  } catch {
    return { texto: rascunho(b), viaIA: false };
  }
}

function prompt(b: BriefingConteudo): string {
  const redes = b.redes.length ? b.redes.join(', ') : 'redes sociais';
  return [
    `Você é um redator de marketing brasileiro. Crie um ${b.objetivo} para publicar em ${redes}.`,
    `Tema/produto: ${b.tema}.`,
    `Tom: ${b.tom}.`,
    'Escreva em português do Brasil, direto e persuasivo. Inclua uma chamada para ação e de 3 a 5 hashtags relevantes ao final.',
  ].join('\n');
}

function rascunho(b: BriefingConteudo): string {
  const redes = b.redes.length ? b.redes.join(', ') : 'suas redes';
  return [
    `✨ ${b.tema}`,
    '',
    `Uma novidade pensada para você. Com um tom ${b.tom}, queremos te mostrar como isso pode fazer a diferença no seu dia a dia.`,
    '',
    `👉 Saiba mais e fale com a gente — publicado para ${redes}.`,
    '',
    '#DRAPBusiness #Negocios #Oportunidade',
    '',
    '— rascunho gerado sem IA (defina ANTHROPIC_API_KEY para conteúdo com IA).',
  ].join('\n');
}
