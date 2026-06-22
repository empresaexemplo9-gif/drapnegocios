/** Vercel Function — auto-cadastro de CLIENTE. Retorna { token, usuario }. */
import { aplicarCors, corpoJson, HttpErro, responderErro, type Req, type Res } from '../_lib/http';
import { comTenant, obterSql, resolverTenantId } from '../_lib/db';
import { assinarToken, hashSenha } from '../_lib/auth';

export default async function handler(req: Req, res: Res) {
  aplicarCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, erro: 'método não permitido' });

  try {
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
  } catch (e) {
    return responderErro(res, e);
  }
}
