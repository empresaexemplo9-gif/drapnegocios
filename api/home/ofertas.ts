/** Vercel Function — ofertas ativas da home (PÚBLICA, sem login). */
import { aplicarCors, lerQuery, responderErro, type Req, type Res } from '../_lib/http';
import { comTenant, obterSql, resolverTenantId } from '../_lib/db';

export default async function handler(req: Req, res: Res) {
  aplicarCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, erro: 'método não permitido' });

  try {
    const sql = obterSql();
    const slug = lerQuery(req, 'tenantId') ?? 'viajebrasil';
    const tid = await resolverTenantId(sql, slug);
    const [linhas] = await comTenant(sql, tid, [
      sql`select id, titulo, cidade, preco, imagem_url, badge, ordem
          from home_ofertas where ativo
          order by ordem asc, criado_em desc`,
    ]);
    return res.status(200).json({ ofertas: linhas ?? [] });
  } catch (e) {
    return responderErro(res, e);
  }
}
