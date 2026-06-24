/**
 * OTP por e-mail.
 *  POST  ?acao=solicitar  → gera e envia o código.
 *  POST  ?acao=verificar  → confere o código e marca o e-mail como verificado.
 *
 * Não revela se o e-mail existe (resposta neutra) para evitar enumeração.
 * Rate limited por IP + e-mail.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { gerarOtp, verificarOtp, enviarOtp } from '@/lib/server/otp';
import { rateLimit } from '@/lib/server/rate-limit';
import { otpSolicitarSchema, otpVerificarSchema } from '@/lib/validation';

function ipDe(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'desconhecido';
}

async function acharUser(email: string, tenantSlug: string) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return null;
  return prisma.user.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email: email.toLowerCase() } },
  });
}

export async function POST(req: Request) {
  const acao = new URL(req.url).searchParams.get('acao');
  const ip = ipDe(req);
  const corpo = await req.json().catch(() => null);

  if (acao === 'solicitar') {
    const parse = otpSolicitarSchema.safeParse(corpo);
    if (!parse.success) return NextResponse.json({ erro: 'Dados inválidos' }, { status: 400 });
    if (!rateLimit(`otp:${ip}:${parse.data.email}`, 3, 60_000).permitido) {
      return NextResponse.json({ erro: 'Aguarde antes de pedir outro código.' }, { status: 429 });
    }
    const user = await acharUser(parse.data.email, parse.data.tenantSlug);
    if (user) {
      const codigo = await gerarOtp(user.id);
      await enviarOtp(parse.data.email, codigo);
    }
    // Resposta neutra independentemente de o usuário existir.
    return NextResponse.json({ ok: true });
  }

  if (acao === 'verificar') {
    const parse = otpVerificarSchema.safeParse(corpo);
    if (!parse.success) return NextResponse.json({ erro: 'Dados inválidos' }, { status: 400 });
    const user = await acharUser(parse.data.email, parse.data.tenantSlug);
    if (!user || !(await verificarOtp(user.id, parse.data.codigo))) {
      return NextResponse.json({ erro: 'Código inválido ou expirado.' }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificadoEm: new Date(), status: user.status === 'pendente' ? 'ativo' : user.status },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ erro: 'Ação desconhecida.' }, { status: 400 });
}
