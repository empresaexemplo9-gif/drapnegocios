/**
 * Schemas de validação (zod) compartilhados entre frontend e backend.
 */
import { z } from 'zod';
import { REGRA_SENHA } from './password-policy';

export const senhaSchema = z
  .string()
  .regex(REGRA_SENHA, 'Senha deve ter 8+ caracteres, 1 maiúscula, 1 número e 1 especial.');

export const emailSchema = z.string().email('E-mail inválido.').max(254);

/** Cadastro: cria um novo tenant OU entra em um existente via token de convite. */
export const cadastroSchema = z.object({
  nome: z.string().min(2, 'Informe seu nome.').max(120),
  email: emailSchema,
  senha: senhaSchema,
  // Quando presente, entra no tenant do convite; senão cria um novo tenant.
  conviteToken: z.string().min(10).optional(),
  // Necessário ao criar um novo tenant (nome da empresa/negócio).
  nomeEmpresa: z.string().min(2).max(120).optional(),
  tipoPerfil: z.enum(['pessoa_fisica', 'empresa', 'autonomo']).default('pessoa_fisica'),
});
export type CadastroInput = z.infer<typeof cadastroSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  senha: z.string().min(1, 'Informe a senha.'),
  tenantSlug: z.string().min(1).optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const otpSolicitarSchema = z.object({
  email: emailSchema,
  tenantSlug: z.string().min(1),
});

export const otpVerificarSchema = z.object({
  email: emailSchema,
  tenantSlug: z.string().min(1),
  codigo: z.string().length(6, 'O código tem 6 dígitos.'),
});
