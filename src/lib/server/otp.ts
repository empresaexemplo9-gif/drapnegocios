/**
 * Login por código (OTP) de 6 dígitos. O código é guardado com hash (nunca em
 * texto puro) e expira em 10 minutos. O envio por e-mail é abstraído em
 * `enviarOtp` — em produção, plugue um provedor (Resend, SES, SMTP).
 */
import { createHash, randomInt } from 'node:crypto';
import { prisma } from './prisma';

const VALIDADE_MS = 10 * 60 * 1000;

function hashCodigo(codigo: string): string {
  return createHash('sha256').update(codigo).digest('hex');
}

export async function gerarOtp(userId: string): Promise<string> {
  const codigo = String(randomInt(0, 1_000_000)).padStart(6, '0');
  await prisma.otpCode.create({
    data: {
      userId,
      codigoHash: hashCodigo(codigo),
      expiraEm: new Date(Date.now() + VALIDADE_MS),
    },
  });
  return codigo;
}

export async function verificarOtp(userId: string, codigo: string): Promise<boolean> {
  const registro = await prisma.otpCode.findFirst({
    where: { userId, consumido: false, expiraEm: { gt: new Date() } },
    orderBy: { criadoEm: 'desc' },
  });
  if (!registro || registro.codigoHash !== hashCodigo(codigo)) return false;
  await prisma.otpCode.update({ where: { id: registro.id }, data: { consumido: true } });
  return true;
}

/** Plugue aqui o provedor de e-mail. Por ora, registra no log do servidor. */
export async function enviarOtp(email: string, codigo: string): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[OTP] ${email} → ${codigo}`);
  }
  // TODO: integração real de e-mail (Resend/SES/SMTP) usando ANTHROPIC-free infra.
}
