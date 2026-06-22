/** Vercel Function — rehidrata o usuário a partir do JWT. Retorna { usuario }. */
import { aplicarCors, HttpErro, responderErro, type Req, type Res } from '../_lib/http';
import { comTenant, obterSql } from '../_lib/db';
import { verificarRequisicao } from '../_lib/auth';

export default async function handler(req: Req, res: Res) {
  aplicarCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, erro: 'método não permitido' });

  try {
    const claims = verificarRequisicao(req);
    const sql = obterSql();
    const [linhas] = await comTenant(sql, claims.tenant_id, [
      sql`select id, nome, email, papel, ativo from usuarios where id = ${claims.sub} limit 1`,
    ]);
    const u = linhas?.[0];
    if (!u || !u.ativo) throw new HttpErro(401, 'sessão inválida');
    return res.status(200).json({ usuario: { nome: u.nome ?? '', email: u.email, papel: u.papel } });
  } catch (e) {
    return responderErro(res, e);
  }
}
