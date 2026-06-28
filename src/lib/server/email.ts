/**
 * Envio de e-mail com transporte automático:
 *   1) SMTP (Nodemailer) — qualquer provedor (Gmail, Outlook, domínio próprio).
 *   2) Resend (HTTP) — se preferir usar a API da Resend.
 *   3) Log no servidor — sem nenhuma config, o fluxo nunca quebra.
 *
 * Variáveis SMTP (recomendado, sem depender de Resend):
 *   SMTP_HOST   — ex.: smtp.gmail.com
 *   SMTP_PORT   — 587 (TLS) ou 465 (SSL). Padrão 587.
 *   SMTP_USER   — usuário/login do SMTP
 *   SMTP_PASS   — senha (no Gmail, use uma "Senha de app")
 *   SMTP_SECURE — "true" para porta 465. Padrão: true só se porta=465.
 *   EMAIL_FROM  — remetente, ex.: "DRAP Business <contato@seu-dominio>"
 *
 * Variáveis Resend (alternativa):
 *   RESEND_API_KEY, EMAIL_FROM
 */
export interface Email {
  para: string;
  assunto: string;
  html: string;
}

type Transporte = 'smtp' | 'resend' | 'nenhum';

function transporteAtivo(): Transporte {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return 'smtp';
  if (process.env.RESEND_API_KEY) return 'resend';
  return 'nenhum';
}

export function emailAtivo(): boolean {
  return transporteAtivo() !== 'nenhum';
}

function remetente(): string {
  return (
    process.env.EMAIL_FROM ??
    process.env.SMTP_USER ??
    'DRAP Business <onboarding@resend.dev>'
  );
}

export async function enviarEmail(e: Email): Promise<boolean> {
  const transporte = transporteAtivo();
  if (transporte === 'smtp') return enviarPorSmtp(e);
  if (transporte === 'resend') return enviarPorResend(e);
  console.info(`[email] (nenhum transporte configurado) para=${e.para} assunto="${e.assunto}"`);
  return false;
}

async function enviarPorSmtp(e: Email): Promise<boolean> {
  try {
    const nodemailer = (await import('nodemailer')).default;
    const porta = Number(process.env.SMTP_PORT ?? 587);
    const secure = process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === 'true'
      : porta === 465;
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: porta,
      secure,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transport.sendMail({
      from: remetente(),
      to: e.para,
      subject: e.assunto,
      html: e.html,
    });
    return true;
  } catch (err) {
    console.error('[email] SMTP falhou:', err);
    return false;
  }
}

async function enviarPorResend(e: Email): Promise<boolean> {
  const chave = process.env.RESEND_API_KEY;
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${chave}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: remetente(), to: e.para, subject: e.assunto, html: e.html }),
    });
    if (!resp.ok) {
      console.error('[email] Resend falhou:', resp.status, await resp.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[email] erro ao enviar:', err);
    return false;
  }
}
