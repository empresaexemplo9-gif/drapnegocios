/** Vercel Function — lê (GET) ou atualiza (PATCH) um lead. */
import { aplicarCors, corpoJson, HttpErro, lerQuery, responderErro, type Req, type Res } from '../_lib/http';
import { comTenant, obterSql } from '../_lib/db';
import { exigirPapel, verificarRequisicao } from '../_lib/auth';

const STATUS_VALIDOS = ['novo', 'atribuido', 'em_atendimento', 'convertido', 'perdido'];

export default async function handler(req: Req, res: Res) {
  aplicarCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const claims = verificarRequisicao(req);
    exigirPapel(claims, 'consultor', 'admin');
    const id = lerQuery(req, 'id');
    if (!id) throw new HttpErro(400, 'id ausente');
    const sql = obterSql();

    if (req.method === 'GET') {
      const consulta =
        claims.papel === 'admin'
          ? sql`select * from leads_aereo where id = ${id} limit 1`
          : sql`select l.* from leads_aereo l
                 where l.id = ${id}
                   and l.consultor_id = (select id from consultores where usuario_id = ${claims.sub})
                 limit 1`;
      const [linhas] = await comTenant(sql, claims.tenant_id, [consulta]);
      const lead = linhas?.[0];
      if (!lead) throw new HttpErro(404, 'lead não encontrado');
      return res.status(200).json({ lead });
    }

    if (req.method === 'PATCH') {
      const { status, consultorId } = corpoJson(req);
      if (status && !STATUS_VALIDOS.includes(String(status))) throw new HttpErro(400, 'status inválido');
      const novoStatus = status ? String(status) : null;

      if (claims.papel === 'consultor') {
        // Consultor só altera o status dos próprios leads.
        const [linhas] = await comTenant(sql, claims.tenant_id, [
          sql`update leads_aereo
              set status = coalesce(${novoStatus}, status)
              where id = ${id}
                and consultor_id = (select id from consultores where usuario_id = ${claims.sub})
              returning id, status, consultor_id`,
        ]);
        const lead = linhas?.[0];
        if (!lead) throw new HttpErro(404, 'lead não encontrado ou não atribuído a você');
        return res.status(200).json({ lead });
      }

      // Admin: pode alterar status E reatribuir, ajustando a carga (CTE atômica).
      const novoConsultor = consultorId ? String(consultorId) : null;
      const [linhas] = await comTenant(sql, claims.tenant_id, [
        sql`
          with alvo as (select consultor_id as antigo from leads_aereo where id = ${id}),
          upd as (
            update leads_aereo
            set status = coalesce(${novoStatus}, status),
                consultor_id = coalesce(${novoConsultor}::uuid, consultor_id)
            where id = ${id}
            returning id, status, consultor_id
          ),
          dec as (
            update consultores set carga = greatest(carga - 1, 0)
            where id = (select antigo from alvo)
              and ${novoConsultor}::uuid is not null
              and (select antigo from alvo) is distinct from ${novoConsultor}::uuid
            returning id
          ),
          inc as (
            update consultores set carga = carga + 1
            where id = ${novoConsultor}::uuid
              and ${novoConsultor}::uuid is not null
              and (select antigo from alvo) is distinct from ${novoConsultor}::uuid
            returning id
          )
          select id, status, consultor_id from upd`,
      ]);
      const lead = linhas?.[0];
      if (!lead) throw new HttpErro(404, 'lead não encontrado');
      return res.status(200).json({ lead });
    }

    return res.status(405).json({ ok: false, erro: 'método não permitido' });
  } catch (e) {
    return responderErro(res, e);
  }
}
