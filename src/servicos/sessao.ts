/**
 * Armazém do token de autenticação (JWT) para o modo `api`.
 *
 * Mantém o token em memória (leitura síncrona, usada a cada requisição) e o
 * persiste no AsyncStorage para sobreviver a reinícios do app. Quando o
 * backend da Buson/site for liberado, o login passa a devolver um token real;
 * este módulo já cuida de guardar, anexar e limpar — nenhuma tela muda.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE = '@viajebrasil/token';

let tokenMemoria: string | null = null;

/** Token atual (síncrono) — usado pelo cliente HTTP ao montar os cabeçalhos. */
export function tokenAtual(): string | null {
  return tokenMemoria;
}

/** Define (ou limpa, com `null`) o token e persiste a alteração. */
export async function definirToken(token: string | null): Promise<void> {
  tokenMemoria = token;
  try {
    if (token) await AsyncStorage.setItem(CHAVE, token);
    else await AsyncStorage.removeItem(CHAVE);
  } catch {
    // Persistência é melhor-esforço; o token em memória continua válido.
  }
}

/** Reidrata o token salvo (chamar uma vez no início do app). */
export async function carregarTokenPersistido(): Promise<void> {
  try {
    tokenMemoria = await AsyncStorage.getItem(CHAVE);
  } catch {
    tokenMemoria = null;
  }
}
