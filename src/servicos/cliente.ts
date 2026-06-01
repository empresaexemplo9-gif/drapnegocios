import { API_CONFIG } from './config';
import { tokenAtual } from './sessao';

/** Erro de resposta da API, com o status HTTP para tratamento nas telas. */
export class ErroApi extends Error {
  constructor(
    readonly status: number,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = 'ErroApi';
  }
}

/**
 * Cliente HTTP enxuto (fetch) usado pelos serviços quando a fonte é `'api'`.
 *
 * Ainda não há backend ligado; ao integrar, este é o único lugar que precisa
 * de ajustes de transporte (cabeçalhos de autenticação, refresh de token,
 * tratamento de erros padronizado, etc.).
 */
export async function requisitar<T>(
  caminho: string,
  init: RequestInit = {},
): Promise<T> {
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), API_CONFIG.timeoutMs);

  const token = tokenAtual();

  try {
    const resposta = await fetch(`${API_CONFIG.baseUrl}${caminho}`, {
      ...init,
      signal: controle.signal,
      headers: {
        'Content-Type': 'application/json',
        // Anexa o JWT do login quando houver sessão ativa (modo `api`).
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });

    if (!resposta.ok) {
      throw new ErroApi(resposta.status, `Falha na requisição (${resposta.status})`);
    }
    return (await resposta.json()) as T;
  } finally {
    clearTimeout(limite);
  }
}
