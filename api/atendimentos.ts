/**
 * Vercel Function — atendimento GERAL (chat livre cliente ↔ consultor).
 *
 * Diferente do lead de Passagens Aéreas: aqui o cliente manda QUALQUER dúvida.
 * A DISTRIBUIÇÃO é ISOLADA da fila de leads: usa o contador `carga_geral`
 * (round-robin próprio), separado do `carga` (usado pelos leads aéreos).
 *
 *  - POST (público): cria o atendimento, grava a 1ª mensagem do cliente,
 *    atribui um consultor por round-robin e devolve `{ atendimentoId, clienteToken }`.
 *  - GET (consultor/admin, JWT): lista os atendimentos (consultor: os seus).
 */
import { aplicarCors, corpoJson, HttpErro, responderErro, type Req, type Res } from './_lib/http';
import { comTenant, obterSql, resolverTenantId } from './_lib/db';
import { verificarRequisicao } from './_lib/auth';

export default async function handler(req: Req, res: Res) {
  aplicarCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') return await criar(req, res);
    if (req.method === 'GET') return await listar(req, res);
    return res.status(405).json({ ok: false, erro: 'método não permitido' });
  } catch (e) {
    return responderErro(res, e);
  }
}

/** Cria o atendimento (público), grava a 1ª mensagem e atribui por round-robin. */
async function criar(req: Req, res: Res) {
  const corpo = corpoJson(req);
  const texto = String(corpo.texto ?? '').trim();
  if (!texto) throw new HttpErro(400, 'mensagem vazia');

  if (!process.env.DATABASE_URL) {
    console.warn('[atendimentos] DATABASE_URL ausente — pulando persistência');
    return res.status(200).json({ ok: true, atendimentoId: null, clienteToken: null });
  }

  const sql = obterSql();
  const tenantId = await resolverTenantId(sql, String(corpo.tenantId ?? 'viajebrasil'));

  const [linhas] = await comTenant(sql, tenantId, [
    sql`
      with escolhido as (
        select c.id
        from consultores c
        join usuarios u on u.id = c.usuario_id
        where c.ativo and u.ativo
        order by c.carga_geral asc, c.criado_em asc
        limit 1
      ),
      ins as (
        insert into atendimentos (tenant_id, consultor_id, status, cliente_token)
        values (
          ${tenantId},
          (select id from escolhido),
          case when (select id from escolhido) is not null then 'em_atendimento' else 'novo' end,
          encode(gen_random_bytes(16), 'hex')
        )
        returning id, cliente_token
      ),
      msg as (
        insert into atendimento_mensagens (tenant_id, atendimento_id, autor, texto)
        values (${tenantId}, (select id from ins), 'cliente', ${texto})
        returning id
      ),
      upd as (
        update consultores set carga_geral = carga_geral + 1
        where id = (select id from escolhido)
        returning id
      )
      select id, cliente_token from ins
    `,
  ]);

  const row = linhas?.[0];
  return res.status(200).json({
    ok: true,
    atendimentoId: (row?.id as string) ?? null,
    clienteToken: (row?.cliente_token as string) ?? null,
  });
}

/** Lista os atendimentos do consultor (ou todos, se admin), com a última mensagem. */
async function listar(req: Req, res: Res) {
  const claims = verificarRequisicao(req);
  if (claims.papel !== 'consultor' && claims.papel !== 'admin') throw new HttpErro(403, 'sem permissão');
  const sql = obterSql();

  const consulta =
    claims.papel === 'admin'
      ? sql`
          select a.id, a.status, a.consultor_id, a.criado_em,
                 m.texto as ultima_mensagem, m.autor as ultimo_autor, m.criado_em as ultima_em
          from atendimentos a
          left join lateral (
            select texto, autor, criado_em from atendimento_mensagens
            where atendimento_id = a.id order by criado_em desc limit 1
          ) m on true
          order by coalesce(m.criado_em, a.criado_em) desc`
      : sql`
          select a.id, a.status, a.consultor_id, a.criado_em,
                 m.texto as ultima_mensagem, m.autor as ultimo_autor, m.criado_em as ultima_em
          from atendimentos a
          left join lateral (
            select texto, autor, criado_em from atendimento_mensagens
            where atendimento_id = a.id order by criado_em desc limit 1
          ) m on true
          where a.consultor_id = (select id from consultores where usuario_id = ${claims.sub})
          order by coalesce(m.criado_em, a.criado_em) desc`;

  const [linhas] = await comTenant(sql, claims.tenant_id, [consulta]);
  return res.status(200).json({ atendimentos: linhas ?? [] });
}
