/** Vercel Function — upload de imagem (admin) para o Vercel Blob. */
import { put } from '@vercel/blob';
import { aplicarCors, corpoJson, HttpErro, responderErro, type Req, type Res } from '../_lib/http';
import { exigirPapel, verificarRequisicao } from '../_lib/auth';

export default async function handler(req: Req, res: Res) {
  aplicarCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, erro: 'método não permitido' });

  try {
    const claims = verificarRequisicao(req);
    exigirPapel(claims, 'admin');

    const { nome, base64, contentType } = corpoJson(req);
    if (!base64) throw new HttpErro(400, 'arquivo ausente');
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new HttpErro(500, 'armazenamento de imagens não configurado (crie um Vercel Blob)');
    }

    const dados = Buffer.from(String(base64), 'base64');
    const ext = (String(nome ?? '').split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const chave = `ofertas/${claims.tenant_id}/${Date.now()}.${ext}`;
    const blob = await put(chave, dados, {
      access: 'public',
      contentType: String(contentType || 'image/jpeg'),
    });
    return res.status(200).json({ url: blob.url });
  } catch (e) {
    return responderErro(res, e);
  }
}
