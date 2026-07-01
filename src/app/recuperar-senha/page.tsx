import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { solicitarReset } from '@/lib/server/recuperacao';
import { emailAtivo } from '@/lib/server/email';
import { rateLimit } from '@/lib/server/rate-limit';

export const metadata = { title: 'Recuperar senha' };
export const dynamic = 'force-dynamic';

export default function RecuperarSenhaPage({ searchParams }: { searchParams?: { enviado?: string } }) {
  async function pedir(formData: FormData) {
    'use server';
    // Rate-limit por IP contra spam de e-mail e enumeração por timing.
    // Resposta neutra mesmo quando limitado (não revela nada ao cliente).
    const ip = headers().get('x-forwarded-for')?.split(',')[0]?.trim() || 'desconhecido';
    if (rateLimit(`reset:${ip}`, 5, 60_000).permitido) {
      await solicitarReset(String(formData.get('email') ?? ''));
    }
    redirect('/recuperar-senha?enviado=1');
  }

  return (
    <div className="container-app py-12">
      <div className="mx-auto max-w-md">
        <h1 className="text-center text-3xl font-black tracking-tight text-tinta">Recuperar senha</h1>
        <p className="mt-2 text-center text-slate-600">
          Informe seu e-mail e enviaremos um link para criar uma nova senha.
        </p>

        {searchParams?.enviado ? (
          <div className="cartao mt-6 text-center">
            <p className="text-sm text-slate-700">
              Se houver uma conta com esse e-mail, o link de redefinição foi enviado. Verifique sua
              caixa de entrada (e o spam).
            </p>
            <Link href="/entrar" className="btn-secundario mt-4 inline-block">
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form action={pedir} className="cartao mt-6 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-500">E-mail</span>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
              />
            </label>
            <button className="btn-primario w-full">Enviar link de redefinição</button>
            <p className="text-center text-xs text-slate-400">
              Lembrou?{' '}
              <Link href="/entrar" className="font-semibold text-marca-600">
                Entrar
              </Link>
            </p>
            {!emailAtivo() && (
              <p className="text-center text-[11px] text-amber-600">
                (E-mail ainda não configurado — defina RESEND_API_KEY para envio real.)
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
