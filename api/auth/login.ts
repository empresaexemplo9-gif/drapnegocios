/** Vercel Function — login por e-mail/senha. Retorna { token, usuario }. */
import { aplicarCors, corpoJson, HttpErro, responderErro, type Req, type Res } from '../_lib/http';
import { comTenant, obterSql, resolverTenantId } from '../_lib/db';
import { assinarToken, conferirSenha, type Papel } from '../_lib/auth';

export default async function handler(req: Req, res: Res) {
  aplicarCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, erro: 'método não permitido' });

  try {
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
  } catch (e) {
    return responderErro(res, e);
  }
}
