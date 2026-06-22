/**
 * Serviços transacionais (reserva, pagamento e autenticação) — a brecha para
 * a integração futura. No modo `mock` simulam sucesso localmente; no modo `api`
 * chamam o backend pelos caminhos de `ENDPOINTS`. O login guarda o token (JWT)
 * em `sessao`, que o cliente HTTP anexa nas requisições seguintes.
 *
 * Quando a API for liberada, ajuste os caminhos em `endpoints.ts`.
 */
import type { ItemReserva, Papel } from '../tipos';
import { API_CONFIG } from './config';
import { requisitar } from './cliente';
import { ENDPOINTS } from './endpoints';
import { login as autenticarLogin } from './auth';

export type FormaPagamento = 'pix' | 'cartao' | 'boleto';

export interface DadosViajante {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
}

export interface Comprovante {
  reservaId: string;
  status: 'confirmado' | 'pendente';
}

/** Cria a reserva a partir dos itens do carrinho. */
export async function criarReserva(itens: ItemReserva[]): Promise<{ reservaId: string }> {
  if (API_CONFIG.fonte === 'api') {
    return requisitar<{ reservaId: string }>(ENDPOINTS.pedidos.criarReserva, {
      method: 'POST',
      body: JSON.stringify({ itens }),
    });
  }
  // Mock: gera um identificador local.
  return { reservaId: `RSV-${Date.now()}` };
}

/** Processa o pagamento de uma reserva. */
export async function processarPagamento(args: {
  reservaId: string;
  forma: FormaPagamento;
  viajante?: Partial<DadosViajante>;
}): Promise<Comprovante> {
  if (API_CONFIG.fonte === 'api') {
    return requisitar<Comprovante>(ENDPOINTS.pedidos.confirmar, {
      method: 'POST',
      body: JSON.stringify(args),
    });
  }
  // Mock: simula latência de processamento e confirma.
  await new Promise((r) => setTimeout(r, 1200));
  return { reservaId: args.reservaId, status: 'confirmado' };
}

export interface SessaoUsuario {
  token: string;
  usuario: { nome: string; email: string; papel: Papel };
}

/**
 * Autentica por e-mail/senha. Delega ao serviço de auth (Vercel Functions,
 * mesma origem), que já cuida do token e do papel real.
 */
export async function autenticar(email: string, senha: string): Promise<SessaoUsuario> {
  return autenticarLogin(email, senha);
}
