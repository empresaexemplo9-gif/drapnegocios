/**
 * Upload de imagem para o Vercel Blob. Recebe um arquivo (multipart) e devolve
 * a URL pública. Exige sessão. Sem BLOB_READ_WRITE_TOKEN configurado, devolve
 * 503 e o front cai no modo "colar URL".
 *
 * Limite ~4 MB (body de função serverless). Imagens maiores: comprima antes.
 */
import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { obterContexto } from '@/lib/server/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TIPOS_OK = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];

/** Diagnóstico: diz se o Vercel Blob está configurado (sem expor o token). */
export async function GET() {
  const ativo = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  return Response.json({
    blobAtivo: ativo,
    mensagem: ativo
      ? 'Vercel Blob ativo: uploads de imagem funcionam.'
      : 'Vercel Blob NÃO configurado: defina BLOB_READ_WRITE_TOKEN na Vercel.',
  });
}

export async function POST(req: Request) {
  const ctx = await obterContexto();
  if (!ctx) return Response.json({ erro: 'Não autenticado' }, { status: 403 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ erro: 'Upload indisponível: ative o Vercel Blob.' }, { status: 503 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return Response.json({ erro: 'Arquivo ausente' }, { status: 400 });
  if (!TIPOS_OK.includes(file.type)) {
    return Response.json({ erro: 'Formato não suportado (use PNG, JPG, WEBP…)' }, { status: 400 });
  }
  if (file.size > 4 * 1024 * 1024) {
    return Response.json({ erro: 'Imagem maior que 4 MB.' }, { status: 400 });
  }

  const ext = (file.name.split('.').pop() ?? 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
  try {
    const blob = await put(`${ctx.tenantId}/${randomUUID()}.${ext}`, file, { access: 'public' });
    return Response.json({ url: blob.url });
  } catch (e) {
    return Response.json({ erro: `Falha no upload: ${(e as Error).message}` }, { status: 500 });
  }
}
