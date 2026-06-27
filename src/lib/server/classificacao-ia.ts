/**
 * Classificação de currículo com IA REAL (Anthropic). Avalia o candidato contra
 * a vaga e devolve score 0–100 + critérios + resumo. Sem ANTHROPIC_API_KEY (ou
 * em falha), cai na heurística determinística — a tela funciona dos dois jeitos.
 */
import { classificar, type Avaliacao } from '../classificacao';
import type { Candidato } from '../candidatos';
import type { Vaga } from '../dados';

const MODELO = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';

const clamp = (v: unknown, min: number, max: number): number => {
  const n = Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
};

function extrairJson(texto: string): Record<string, unknown> | null {
  const m = texto.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function prompt(c: Candidato, vaga: Vaga): string {
  return [
    'Você é um recrutador sênior. Avalie a aderência do candidato à vaga e responda APENAS com um JSON válido (sem texto fora do JSON), no formato:',
    '{"score":0-100,"aderencia":0-40,"experiencia":0-25,"certificacoes":0-20,"referencias":0-15,"resumo":"2 frases em pt-BR"}',
    '',
    `VAGA: ${vaga.titulo} | Área: ${vaga.area} | Habilidades exigidas: ${vaga.habilidades.join(', ') || '—'} | Descrição: ${vaga.descricao}`,
    '',
    `CANDIDATO: ${c.nome} | Área: ${c.area} | Anos de experiência: ${c.anosExperiencia} | Formação: ${c.formacao || '—'} | Habilidades: ${c.habilidades.join(', ') || '—'} | Certificações: ${c.certificacoes.length} | Referências: ${c.referencias}`,
    '',
    'Pontue aderência (habilidades x exigidas), experiência (anos), certificações e referências. O score total deve refletir a soma ponderada.',
  ].join('\n');
}

export async function classificarComIA(c: Candidato, vaga: Vaga): Promise<Avaliacao> {
  const heuristica = classificar(c, vaga); // baseline + fallback
  const chave = process.env.ANTHROPIC_API_KEY;
  if (!chave) return heuristica;

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
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt(c, vaga) }],
      }),
    });
    if (!resp.ok) return heuristica;
    const data = (await resp.json()) as { content?: { text?: string }[] };
    const json = extrairJson(data.content?.[0]?.text ?? '');
    if (!json) return heuristica;

    const aderencia = clamp(json.aderencia, 0, 40);
    const experiencia = clamp(json.experiencia, 0, 25);
    const certificacoes = clamp(json.certificacoes, 0, 20);
    const referencias = clamp(json.referencias, 0, 15);
    const score = clamp(json.score ?? aderencia + experiencia + certificacoes + referencias, 0, 100);
    const resumo = typeof json.resumo === 'string' && json.resumo.trim() ? json.resumo.trim().slice(0, 500) : heuristica.resumo;

    return { candidato: c, score, criterios: { aderencia, experiencia, certificacoes, referencias }, resumo };
  } catch {
    return heuristica;
  }
}
