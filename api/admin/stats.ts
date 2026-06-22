/** Vercel Function — estatísticas gerais (somente admin). */
import { aplicarCors, responderErro, type Req, type Res } from '../_lib/http';
import { comTenant, obterSql } from '../_lib/db';
import { exigirPapel, verificarRequisicao } from '../_lib/auth';

export default async function handler(req: Req, res: Res) {
  aplicarCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, erro: 'método não permitido' });

  try {
    const claims = verificarRequisicao(req);
    exigirPapel(claims, 'admin');
    const sql = obterSql();

    const [porStatus, totais, porConsultor, serie] = await comTenant(sql, claims.tenant_id, [
      sql`select status, count(*)::int as n from leads_aereo group by status`,
      sql`select count(*)::int as total,
                 count(*) filter (where status = 'convertido')::int as convertidos
          from leads_aereo`,
      sql`select c.id, u.nome, u.email, c.carga,
                 count(l.id)::int as leads
          from consultores c
          join usuarios u on u.id = c.usuario_id
          left join leads_aereo l on l.consultor_id = c.id
          where c.ativo and u.ativo
          group by c.id, u.nome, u.email, c.carga
          order by leads desc`,
      sql`select to_char(date_trunc('day', criado_em), 'YYYY-MM-DD') as dia, count(*)::int as n
          from leads_aereo
          where criado_em > now() - interval '14 days'
          group by 1 order by 1`,
    ]);

    const total = (totais?.[0]?.total as number) ?? 0;
    const convertidos = (totais?.[0]?.convertidos as number) ?? 0;
    const conversao = total > 0 ? Math.round((convertidos / total) * 100) : 0;

    return res.status(200).json({
      total,
      convertidos,
      conversao,
      porStatus: porStatus ?? [],
      porConsultor: porConsultor ?? [],
      serie: serie ?? [],
    });
  } catch (e) {
    return responderErro(res, e);
  }
}
