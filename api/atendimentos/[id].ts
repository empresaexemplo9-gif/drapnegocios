/**
 * Vercel Function — chat de um atendimento geral (cliente ↔ consultor).
 *
 * Dois modos de acesso (espelha `api/chat/[id].ts`):
 *  - CLIENTE (anônimo): `?token=<cliente_token>&tenantId=<slug>` (sem Authorization).
 *  - CONSULTOR/ADMIN: header `Authorization: Bearer <jwt>` (precisa ser dono).
 *
 * GET  → lista as mensagens. POST `{ texto }` → envia mensagem.
 * POST `{ status }` → consultor/admin muda o status ('em_atendimento'|'resolvido').
 */
import { aplicarCors, corpoJson, HttpErro, lerHeader, lerQuery, responderErro, type Req, type Res } from '../_lib/http';
import { comTenant, obterSql, resolverTenantId, type Sql } from '../_lib/db';
import { verificarRequisicao } from '../_lib/auth';

type Autor = 'cliente' | 'consultor';
const STATUS_VALIDOS = ['novo', 'em_atendimento', 'resolvido'] as const;

export default async function handler(req: Req, res: Res) {
  aplicarCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const id = lerQuery(req, 'id');
    if (!id) throw new HttpErro(400, 'id ausente');
    const sql = obterSql();

    const { tenantId, autor } = await autorizar(req, sql, id);

    if (req.method === 'GET') {
      const [msgs] = await comTenant(sql, tenantId, [
        sql`select id, autor, texto, criado_em from atendimento_mensagens
            where atendimento_id = ${id} order by criado_em asc`,
      ]);
      return res.status(200).json({ mensagens: msgs ?? [] });
    }

    if (req.method === 'POST') {
      const corpo = corpoJson(req);

      // Consultor/admin muda o status (ex.: marcar como resolvido).
      if (corpo.status !== undefined) {
        if (autor !== 'consultor') throw new HttpErro(403, 'sem permissão');
        const status = String(corpo.status);
        if (!STATUS_VALIDOS.includes(status as (typeof STATUS_VALIDOS)[number])) {
          throw new HttpErro(400, 'status inválido');
        }
        await comTenant(sql, tenantId, [
          sql`update atendimentos set status = ${status} where id = ${id}`,
        ]);
        return res.status(200).json({ ok: true, status });
      }

      const texto = String(corpo.texto ?? '').trim();
      if (!texto) throw new HttpErro(400, 'mensagem vazia');
      const [linhas] = await comTenant(sql, tenantId, [
        sql`insert into atendimento_mensagens (tenant_id, atendimento_id, autor, texto)
            values (${tenantId}, ${id}, ${autor}, ${texto})
            returning id, autor, texto, criado_em`,
      ]);
      // Quando o consultor responde, o atendimento entra em andamento.
      if (autor === 'consultor') {
        await comTenant(sql, tenantId, [
          sql`update atendimentos set status = 'em_atendimento' where id = ${id} and status = 'novo'`,
        ]);
      }
      return res.status(200).json({ mensagem: linhas?.[0] });
    }

    return res.status(405).json({ ok: false, erro: 'método não permitido' });
  } catch (e) {
    return responderErro(res, e);
  }
}

/** Resolve tenant + autor e garante que quem chama tem acesso ao atendimento. */
async function autorizar(req: Req, sql: Sql, id: string): Promise<{ tenantId: string; autor: Autor }> {
  const temBearer = !!lerHeader(req, 'authorization');

  if (temBearer) {
    const claims = verificarRequisicao(req);
    if (claims.papel !== 'consultor' && claims.papel !== 'admin') throw new HttpErro(403, 'sem permissão');
    const consulta =
      claims.papel === 'admin'
        ? sql`select id from atendimentos where id = ${id} limit 1`
        : sql`select id from atendimentos where id = ${id}
               and consultor_id = (select id from consultores where usuario_id = ${claims.sub}) limit 1`;
    const [v] = await comTenant(sql, claims.tenant_id, [consulta]);
    if (!v?.[0]) throw new HttpErro(403, 'sem acesso a este atendimento');
    return { tenantId: claims.tenant_id, autor: 'consultor' };
  }

  // Modo cliente (anônimo) via token.
  const token = lerQuery(req, 'token');
  if (!token) throw new HttpErro(401, 'token ausente');
  const tenantId = await resolverTenantId(sql, lerQuery(req, 'tenantId') ?? 'viajebrasil');
  const [v] = await comTenant(sql, tenantId, [
    sql`select id from atendimentos where id = ${id} and cliente_token = ${token} limit 1`,
  ]);
  if (!v?.[0]) throw new HttpErro(403, 'conversa não encontrada');
  return { tenantId, autor: 'cliente' };
}
