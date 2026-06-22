/**
 * Vercel Function — cria o lead do chatbot de Passagens Aéreas.
 *
 * O lead vai direto para a interface do consultor (in-app). NÃO enviamos mais
 * e-mail: o consultor atende pelo chat do app. Geramos um `cliente_token`
 * (anônimo) devolvido ao app para ele conversar no lead sem precisar de login.
 * O WhatsApp é exceção: o cliente informa só se quiser (depois, via /api/chat).
 */
import { aplicarCors, corpoJson, responderErro, type Req, type Res } from './_lib/http';
import { comTenant, obterSql, resolverTenantId } from './_lib/db';

export default async function handler(req: Req, res: Res) {
  aplicarCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, erro: 'método não permitido' });

  const corpo = corpoJson(req);
  // 'inicio' (gatilho do botão) não faz mais nada — sem e-mail.
  if (corpo.tipo === 'inicio') return res.status(200).json({ ok: true });

  const tenantSlug = String(corpo.tenantId ?? 'viajebrasil');
  try {
    const r = await registrarLead(tenantSlug, corpo.lead ?? {}, String(corpo.origem ?? ''));
    return res.status(200).json({ ok: true, ...r });
  } catch (e) {
    return responderErro(res, e);
  }
}

/**
 * Insere o lead, atribui o consultor por round-robin (menos carregado) e gera
 * um `cliente_token`. Retorna `{ leadId, clienteToken }` (ou nulos sem banco).
 */
async function registrarLead(
  tenantSlug: string,
  lead: Record<string, any>,
  origem: string,
): Promise<{ leadId: string | null; clienteToken: string | null }> {
  if (!process.env.DATABASE_URL) {
    console.warn('[leads-aereo] DATABASE_URL ausente — pulando persistência');
    return { leadId: null, clienteToken: null };
  }
  const sql = obterSql();
  const tenantId = await resolverTenantId(sql, tenantSlug);

  const nomes: string[] = Array.isArray(lead.nomes) ? lead.nomes.map(String) : [];
  const numero = Number(lead.numeroPassageiros) || nomes.length || 1;
  const telefone = String(lead.telefone ?? '');
  const contatoNome = nomes[0] ?? null;
  const origemCidade = String(lead.origem ?? '') || null;
  const destinoCidade = String(lead.destino ?? '') || null;

  const [linhas] = await comTenant(sql, tenantId, [
    sql`
      with escolhido as (
        select c.id
        from consultores c
        join usuarios u on u.id = c.usuario_id
        where c.ativo and u.ativo
        order by c.carga asc, c.criado_em asc
        limit 1
      ),
      ins as (
        insert into leads_aereo
          (tenant_id, origem_cidade, destino_cidade, numero_passageiros, nomes,
           data_ida, data_volta, classe, contato_nome, contato_telefone, origem,
           consultor_id, status, cliente_token)
        values
          (${tenantId}, ${origemCidade}, ${destinoCidade}, ${numero}, ${nomes}::text[],
           ${String(lead.dataIda ?? '')}, ${lead.dataVolta ?? null}, ${String(lead.classe ?? '')},
           ${contatoNome}, ${telefone || null}, ${origem},
           (select id from escolhido),
           case when (select id from escolhido) is not null then 'atribuido' else 'novo' end,
           encode(gen_random_bytes(16), 'hex'))
        returning id, cliente_token
      ),
      upd as (
        update consultores set carga = carga + 1
        where id = (select id from escolhido)
        returning id
      )
      select id, cliente_token from ins
    `,
  ]);

  const row = linhas?.[0];
  return { leadId: (row?.id as string) ?? null, clienteToken: (row?.cliente_token as string) ?? null };
}
