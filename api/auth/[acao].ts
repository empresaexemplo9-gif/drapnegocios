/**
 * Vercel Function — autenticação (login / register / me) num único endpoint.
 *
 * Consolidado em uma rota dinâmica (`/api/auth/:acao`) para caber no limite de
 * Serverless Functions do plano. As URLs públicas seguem iguais:
 *   POST /api/auth/login     → { token, usuario }
 *   POST /api/auth/register  → { token, usuario } (sempre papel 'cliente')
 *   GET  /api/auth/me        → { usuario } (rehidrata a partir do JWT)
 */
import { aplicarCors, corpoJson, HttpErro, lerQuery, responderErro, type Req, type Res } from '../_lib/http';
import { comTenant, obterSql, resolverTenantId } from '../_lib/db';
import { assinarToken, conferirSenha, hashSenha, verificarRequisicao, type Papel } from '../_lib/auth';

export default async function handler(req: Req, res: Res) {
  aplicarCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const acao = lerQuery(req, 'acao');
    if (acao === 'login') return await login(req, res);
    if (acao === 'register') return await register(req, res);
    if (acao === 'me') return await me(req, res);
    return res.status(404).json({ ok: false, erro: 'ação desconhecida' });
  } catch (e) {
    return responderErro(res, e);
  }
}

/** POST /api/auth/login — e-mail/senha → { token, usuario }. */
async function login(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, erro: 'método não permitido' });
  const { email, senha, tenantId } = corpoJson(req);
  if (!email || !senha) throw new HttpErro(400, 'informe e-mail e senha');

  const sql = obterSql();
  const tid = await resolverTenantId(sql, String(tenantId ?? 'viajebrasil'));
  const [linhas] = await comTenant(sql, tid, [
    sql`select id, nome, email, papel, password_hash, ativo
          from usuarios where email = ${String(email).trim().toLowerCase()} limit 1`,
  ]);

  const u = linhas?.[0];
  if (!u || !u.password_hash) throw new HttpErro(401, 'e-mail ou senha inválidos');
  if (!u.ativo) throw new HttpErro(403, 'usuário inativo');
  const ok = await conferirSenha(String(senha), String(u.password_hash));
  if (!ok) throw new HttpErro(401, 'e-mail ou senha inválidos');

  const token = assinarToken({ sub: String(u.id), tenant_id: tid, papel: u.papel as Papel });
  return res.status(200).json({ token, usuario: { nome: u.nome ?? '', email: u.email, papel: u.papel } });
}

/** POST /api/auth/register — auto-cadastro de CLIENTE → { token, usuario }. */
async function register(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, erro: 'método não permitido' });
  const { nome, email, senha, tenantId } = corpoJson(req);
  if (!nome || !email || !senha) throw new HttpErro(400, 'informe nome, e-mail e senha');
  if (String(senha).length < 6) throw new HttpErro(400, 'senha muito curta (mínimo 6 caracteres)');

  const sql = obterSql();
  const tid = await resolverTenantId(sql, String(tenantId ?? 'viajebrasil'));
  const hash = await hashSenha(String(senha));

  let linhas: Record<string, any>[] | undefined;
  try {
    // Papel é SEMPRE 'cliente' no auto-cadastro (nunca confiar no cliente).
    [linhas] = await comTenant(sql, tid, [
      sql`insert into usuarios (tenant_id, email, papel, nome, ativo, password_hash)
          values (${tid}, ${String(email).trim().toLowerCase()}, 'cliente', ${String(nome).trim()}, true, ${hash})
          returning id, nome, email, papel`,
    ]);
  } catch (e) {
    if ((e as { code?: string })?.code === '23505') throw new HttpErro(409, 'e-mail já cadastrado');
    throw e;
  }

  const u = linhas?.[0];
  if (!u) throw new HttpErro(500, 'falha ao criar usuário');
  const token = assinarToken({ sub: String(u.id), tenant_id: tid, papel: 'cliente' });
  return res.status(200).json({ token, usuario: { nome: u.nome, email: u.email, papel: u.papel } });
}

/** GET /api/auth/me — rehidrata o usuário a partir do JWT → { usuario }. */
async function me(req: Req, res: Res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, erro: 'método não permitido' });
  const claims = verificarRequisicao(req);
  const sql = obterSql();
  const [linhas] = await comTenant(sql, claims.tenant_id, [
    sql`select id, nome, email, papel, ativo from usuarios where id = ${claims.sub} limit 1`,
  ]);
  const u = linhas?.[0];
  if (!u || !u.ativo) throw new HttpErro(401, 'sessão inválida');
  return res.status(200).json({ usuario: { nome: u.nome ?? '', email: u.email, papel: u.papel } });
}
