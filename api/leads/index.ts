/** Vercel Function — lista leads (consultor vê os seus; admin vê todos). */
import { aplicarCors, lerQuery, responderErro, type Req, type Res } from '../_lib/http';
import { comTenant, obterSql } from '../_lib/db';
import { exigirPapel, verificarRequisicao } from '../_lib/auth';

const STATUS_VALIDOS = ['novo', 'atribuido', 'em_atendimento', 'convertido', 'perdido'];

export default async function handler(req: Req, res: Res) {
  aplicarCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, erro: 'método não permitido' });

  try {
    const claims = verificarRequisicao(req);
    exigirPapel(claims, 'consultor', 'admin');

    const sql = obterSql();
    const statusRaw = lerQuery(req, 'status');
    const status = statusRaw && STATUS_VALIDOS.includes(statusRaw) ? statusRaw : null;
    const limit = Math.min(Number(lerQuery(req, 'limit')) || 50, 200);
    const offset = Math.max(Number(lerQuery(req, 'offset')) || 0, 0);

    const consulta =
      claims.papel === 'admin'
        ? (() => {
            const consultorId = lerQuery(req, 'consultorId') ?? null;
            return sql`
              select * from leads_aereo
              where (${status}::text is null or status = ${status})
                and (${consultorId}::uuid is null or consultor_id = ${consultorId})
              order by criado_em desc
              limit ${limit} offset ${offset}`;
          })()
        : sql`
            select l.* from leads_aereo l
            where l.consultor_id = (select id from consultores where usuario_id = ${claims.sub})
              and (${status}::text is null or l.status = ${status})
            order by l.criado_em desc
            limit ${limit} offset ${offset}`;

    const [leads] = await comTenant(sql, claims.tenant_id, [consulta]);
    return res.status(200).json({ leads: leads ?? [] });
  } catch (e) {
    return responderErro(res, e);
  }
}
