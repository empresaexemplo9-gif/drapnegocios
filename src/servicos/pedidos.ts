/**
 * Serviços transacionais (reserva, pagamento e autenticação) — a brecha para
 * a integração futura. No modo `mock` simulam sucesso localmente; no modo `api`
 * chamam o backend pelos caminhos de `ENDPOINTS`. O login guarda o token (JWT)
 * em `sessao`, que o cliente HTTP anexa nas requisições seguintes.
 *
 * Quando a API for liberada, ajuste os caminhos em `endpoints.ts`.
 */
import type { ItemReserva } from '../tipos';
import { validarAdmin, type Papel } from '../admin/credenciais';
import { API_CONFIG } from './config';
import { requisitar } from './cliente';
import { ENDPOINTS } from './endpoints';
import { definirToken } from './sessao';
import { clienteSupabase } from './supabase';

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
    return requisitar<{ reservaId: string }>(ENDPOINTS.pedidos.reservas, {
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
    return requisitar<Comprovante>(ENDPOINTS.pedidos.pagamentos, {
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

/** Autentica por e-mail/senha. */
export async function autenticar(email: string, senha: string): Promise<SessaoUsuario> {
  if (API_CONFIG.fonte === 'supabase') {
    const sb = clienteSupabase();
    const { data, error } = await sb.auth.signInWithPassword({ email, password: senha });
    if (error || !data.user) throw new Error('Credenciais inválidas');
    const { data: perfil } = await sb
      .from('perfis')
      .select('papel, nome')
      .eq('id', data.user.id)
      .single();
    const papel: Papel = perfil?.papel === 'admin' ? 'admin' : 'cliente';
    const nome = (perfil?.nome as string | undefined) ?? email.split('@')[0] ?? 'Viajante';
    const token = data.session?.access_token ?? '';
    await definirToken(token || null);
    return { token, usuario: { nome, email, papel } };
  }
  if (API_CONFIG.fonte === 'api') {
    const sessao = await requisitar<SessaoUsuario>(ENDPOINTS.auth.login, {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    await definirToken(sessao.token || null);
    return sessao;
  }
  // Mock: define o papel pela credencial de administrador.
  const nome = email.split('@')[0] ?? 'Viajante';
  const papel: Papel = validarAdmin(email, senha) ? 'admin' : 'cliente';
  return { token: 'mock-token', usuario: { nome, email, papel } };
}
