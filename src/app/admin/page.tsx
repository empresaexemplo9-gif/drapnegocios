import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obterContexto } from '@/lib/server/session';
import {
  ehAdminPlataforma,
  estatisticasPlataforma,
  listarTenantsAdmin,
  listarUsuariosAdmin,
  excluirTenant,
  excluirUsuario,
  alterarStatusUsuario,
} from '@/lib/server/admin';

export const metadata = { title: 'Admin da plataforma' };
export const dynamic = 'force-dynamic';

function quando(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default async function AdminPlataformaPage() {
  const ctx = await obterContexto();
  if (!ctx) redirect('/entrar?proximo=/admin');
  if (!ehAdminPlataforma(ctx.email)) {
    return (
      <div className="container-app py-16">
        <div className="cartao mx-auto max-w-md text-center">
          <h1 className="text-2xl font-black text-tinta">Acesso restrito</h1>
          <p className="mt-2 text-slate-600">
            Esta é a administração da plataforma. Seu e-mail não está autorizado.
          </p>
          <p className="mt-3 text-xs text-slate-400">
            Para liberar, adicione seu e-mail na variável <code>ADMIN_EMAILS</code> (Vercel) e refaça o deploy.
          </p>
        </div>
      </div>
    );
  }

  async function removerNegocio(formData: FormData) {
    'use server';
    const a = await obterContexto();
    if (!a || !ehAdminPlataforma(a.email)) redirect('/entrar');
    await excluirTenant(String(formData.get('id') ?? ''));
    redirect('/admin');
  }
  async function removerUsuario(formData: FormData) {
    'use server';
    const a = await obterContexto();
    if (!a || !ehAdminPlataforma(a.email)) redirect('/entrar');
    await excluirUsuario(String(formData.get('id') ?? ''));
    redirect('/admin');
  }
  async function alternarStatus(formData: FormData) {
    'use server';
    const a = await obterContexto();
    if (!a || !ehAdminPlataforma(a.email)) redirect('/entrar');
    await alterarStatusUsuario(String(formData.get('id') ?? ''), String(formData.get('suspender')) === '1');
    redirect('/admin');
  }

  const [stats, tenants, usuarios] = await Promise.all([
    estatisticasPlataforma(),
    listarTenantsAdmin(),
    listarUsuariosAdmin(),
  ]);

  return (
    <div className="container-app py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="selo bg-ink-900 text-white">Admin da plataforma</span>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-tinta">Painel administrativo</h1>
          <p className="text-slate-500">Edições e reparos em toda a plataforma — {ctx.email}</p>
        </div>
        <Link href="/admin/planos" className="btn-secundario !py-2">
          Editar preços dos planos
        </Link>
      </div>

      {/* Estatísticas */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat n={stats.tenants} r="Negócios" />
        <Stat n={stats.users} r="Usuários" />
        <Stat n={stats.jobs} r="Vagas" />
        <Stat n={stats.products} r="Produtos" />
        <Stat n={stats.posts} r="Posts" />
        <Stat n={stats.reunioes} r="Reuniões" />
      </div>

      {/* Negócios */}
      <h2 className="mt-10 text-xl font-black text-tinta">Negócios ({tenants.length})</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-xs font-semibold uppercase text-slate-400">
            <tr>
              <th className="py-2">Nome</th>
              <th>Dono</th>
              <th>Plano</th>
              <th>Usuários</th>
              <th>Criado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id} className="border-t border-slate-100">
                <td className="py-2 font-semibold text-tinta">
                  {t.nome} <span className="text-xs text-slate-400">/{t.slug}</span>
                </td>
                <td className="text-slate-600">{t.dono}</td>
                <td className="capitalize text-slate-600">{t.plano.replace('prime_', 'prime ')}</td>
                <td className="text-slate-600">{t.usuarios}</td>
                <td className="text-slate-500">{quando(t.criadoEm)}</td>
                <td className="text-right">
                  <form action={removerNegocio}>
                    <input type="hidden" name="id" value={t.id} />
                    <button className="text-xs font-semibold text-rose-600 hover:underline">Excluir</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Usuários */}
      <h2 className="mt-10 text-xl font-black text-tinta">Usuários ({usuarios.length})</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="text-left text-xs font-semibold uppercase text-slate-400">
            <tr>
              <th className="py-2">Nome</th>
              <th>E-mail</th>
              <th>Negócio</th>
              <th>Papel</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="py-2 font-semibold text-tinta">{u.nome}</td>
                <td className="text-slate-600">{u.email}</td>
                <td className="text-slate-600">{u.negocio}</td>
                <td className="text-slate-500">{u.papel}</td>
                <td>
                  <span className={`selo ${u.status === 'suspenso' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-3">
                    <form action={alternarStatus}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="suspender" value={u.status === 'suspenso' ? '0' : '1'} />
                      <button className="text-xs font-semibold text-slate-600 hover:underline">
                        {u.status === 'suspenso' ? 'Reativar' : 'Suspender'}
                      </button>
                    </form>
                    <form action={removerUsuario}>
                      <input type="hidden" name="id" value={u.id} />
                      <button className="text-xs font-semibold text-rose-600 hover:underline">Excluir</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-xs text-slate-400">
        ⚠️ Excluir um negócio apaga todos os dados dele (usuários, vagas, produtos, etc.). Ação sem desfazer.
      </p>
    </div>
  );
}

function Stat({ n, r }: { n: number; r: string }) {
  return (
    <div className="cartao text-center">
      <div className="text-2xl font-black text-tinta">{n}</div>
      <div className="text-xs font-semibold uppercase text-slate-400">{r}</div>
    </div>
  );
}
