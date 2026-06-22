/** Vercel Function — CRUD das ofertas da home (somente admin). */
import { aplicarCors, corpoJson, HttpErro, lerQuery, responderErro, type Req, type Res } from '../_lib/http';
import { comTenant, obterSql } from '../_lib/db';
import { exigirPapel, verificarRequisicao } from '../_lib/auth';

export default async function handler(req: Req, res: Res) {
  aplicarCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const claims = verificarRequisicao(req);
    exigirPapel(claims, 'admin');
    const sql = obterSql();
    const tid = claims.tenant_id;

    if (req.method === 'GET') {
      const [linhas] = await comTenant(sql, tid, [
        sql`select * from home_ofertas order by ordem asc, criado_em desc`,
      ]);
      return res.status(200).json({ ofertas: linhas ?? [] });
    }

    if (req.method === 'POST') {
      const o = corpoJson(req);
      if (!o.titulo) throw new HttpErro(400, 'título é obrigatório');
      const [linhas] = await comTenant(sql, tid, [
        sql`insert into home_ofertas (tenant_id, titulo, cidade, preco, imagem_url, badge, ordem, ativo)
            values (${tid}, ${String(o.titulo)}, ${o.cidade ?? null}, ${o.preco ?? null},
                    ${o.imagem_url ?? null}, ${o.badge ?? null}, ${Number(o.ordem) || 0},
                    ${o.ativo === false ? false : true})
            returning *`,
      ]);
      return res.status(200).json({ oferta: linhas?.[0] });
    }

    if (req.method === 'PATCH') {
      const o = corpoJson(req);
      const id = String(o.id ?? lerQuery(req, 'id') ?? '');
      if (!id) throw new HttpErro(400, 'id ausente');
      const [linhas] = await comTenant(sql, tid, [
        sql`update home_ofertas set
              titulo = coalesce(${o.titulo ?? null}, titulo),
              cidade = coalesce(${o.cidade ?? null}, cidade),
              preco = coalesce(${o.preco ?? null}, preco),
              imagem_url = coalesce(${o.imagem_url ?? null}, imagem_url),
              badge = coalesce(${o.badge ?? null}, badge),
              ordem = coalesce(${o.ordem ?? null}, ordem),
              ativo = coalesce(${typeof o.ativo === 'boolean' ? o.ativo : null}, ativo)
            where id = ${id}
            returning *`,
      ]);
      const oferta = linhas?.[0];
      if (!oferta) throw new HttpErro(404, 'oferta não encontrada');
      return res.status(200).json({ oferta });
    }

    if (req.method === 'DELETE') {
      const id = String(lerQuery(req, 'id') ?? corpoJson(req).id ?? '');
      if (!id) throw new HttpErro(400, 'id ausente');
      await comTenant(sql, tid, [sql`delete from home_ofertas where id = ${id}`]);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, erro: 'método não permitido' });
  } catch (e) {
    return responderErro(res, e);
  }
}
