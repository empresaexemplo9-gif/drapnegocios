/**
 * Vercel Function — chat de um lead (cliente ↔ consultor).
 *
 * Dois modos de acesso:
 *  - CLIENTE (anônimo): `?token=<cliente_token>&tenantId=<slug>` (sem Authorization).
 *  - CONSULTOR/ADMIN: header `Authorization: Bearer <jwt>` (precisa ser dono do lead).
 *
 * GET  → lista as mensagens. POST `{ texto }` → envia mensagem.
 * POST `{ telefone }` → cliente informa WhatsApp (exceção, opcional).
 */
import { aplicarCors, corpoJson, HttpErro, lerHeader, lerQuery, responderErro, type Req, type Res } from '../_lib/http';
import { comTenant, obterSql, resolverTenantId, type Sql } from '../_lib/db';
import { verificarRequisicao } from '../_lib/auth';

type Autor = 'cliente' | 'consultor';

export default async function handler(req: Req, res: Res) {
  aplicarCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const id = lerQuery(req, 'id');
    if (!id) throw new HttpErro(400, 'id ausente');
    const sql = obterSql();

    // Autoriza o acesso ao lead e descobre o tenant + quem escreve.
    const { tenantId, autor } = await autorizar(req, sql, id);

    if (req.method === 'GET') {
      const [msgs] = await comTenant(sql, tenantId, [
        sql`select id, autor, texto, criado_em from lead_mensagens where lead_id = ${id} order by criado_em asc`,
      ]);
      return res.status(200).json({ mensagens: msgs ?? [] });
    }

    if (req.method === 'POST') {
      const corpo = corpoJson(req);

      // Cliente informando WhatsApp (exceção).
      if (corpo.telefone !== undefined) {
        await comTenant(sql, tenantId, [
          sql`update leads_aereo set contato_telefone = ${String(corpo.telefone)} where id = ${id}`,
        ]);
        return res.status(200).json({ ok: true });
      }

      const texto = String(corpo.texto ?? '').trim();
      if (!texto) throw new HttpErro(400, 'mensagem vazia');
      const [linhas] = await comTenant(sql, tenantId, [
        sql`insert into lead_mensagens (tenant_id, lead_id, autor, texto)
            values (${tenantId}, ${id}, ${autor}, ${texto})
            returning id, autor, texto, criado_em`,
      ]);
      // Quando o consultor responde, o lead entra em atendimento.
      if (autor === 'consultor') {
        await comTenant(sql, tenantId, [
          sql`update leads_aereo set status = 'em_atendimento'
              where id = ${id} and status in ('novo', 'atribuido')`,
        ]);
      }
      return res.status(200).json({ mensagem: linhas?.[0] });
    }

    return res.status(405).json({ ok: false, erro: 'método não permitido' });
  } catch (e) {
    return responderErro(res, e);
  }
}

/** Resolve tenant + autor e garante que quem chama tem acesso ao lead. */
async function autorizar(req: Req, sql: Sql, id: string): Promise<{ tenantId: string; autor: Autor }> {
  const temBearer = !!lerHeader(req, 'authorization');

  if (temBearer) {
    const claims = verificarRequisicao(req);
    if (claims.papel !== 'consultor' && claims.papel !== 'admin') throw new HttpErro(403, 'sem permissão');
    const consulta =
      claims.papel === 'admin'
        ? sql`select id from leads_aereo where id = ${id} limit 1`
        : sql`select id from leads_aereo where id = ${id}
               and consultor_id = (select id from consultores where usuario_id = ${claims.sub}) limit 1`;
    const [v] = await comTenant(sql, claims.tenant_id, [consulta]);
    if (!v?.[0]) throw new HttpErro(403, 'sem acesso a este lead');
    return { tenantId: claims.tenant_id, autor: 'consultor' };
  }

  // Modo cliente (anônimo) via token.
  const token = lerQuery(req, 'token');
  if (!token) throw new HttpErro(401, 'token ausente');
  const tenantId = await resolverTenantId(sql, lerQuery(req, 'tenantId') ?? 'viajebrasil');
  const [v] = await comTenant(sql, tenantId, [
    sql`select id from leads_aereo where id = ${id} and cliente_token = ${token} limit 1`,
  ]);
  if (!v?.[0]) throw new HttpErro(403, 'conversa não encontrada');
  return { tenantId, autor: 'cliente' };
}
