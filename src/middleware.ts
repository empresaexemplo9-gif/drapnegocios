/**
 * Middleware global de autenticação multi-tenant.
 *
 * Rejeita com 403 qualquer request às rotas protegidas sem um token com
 * tenantId válido. O token (JWT do NextAuth) já carrega tenantId/papel/plano,
 * evitando consulta ao banco aqui.
 *
 * Escopo (matcher abaixo): APIs de domínio e o painel. As APIs de auth
 * (/api/auth/*) e as páginas públicas de demonstração ficam de fora.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const ehApi = req.nextUrl.pathname.startsWith('/api/');

  if (!token?.tenantId) {
    if (ehApi) {
      return NextResponse.json(
        { erro: 'Acesso negado: tenant não identificado.' },
        { status: 403 },
      );
    }
    const url = new URL('/entrar', req.url);
    url.searchParams.set('proximo', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Rotas protegidas: painel/marketing/admin e as APIs de domínio exigem tenant
// válido no token. Páginas públicas (home, vitrine, vagas, feed, perfil, planos)
// ficam livres.
export const config = {
  matcher: [
    '/painel/:path*',
    '/marketing/:path*',
    '/admin/:path*',
    '/api/jobs/:path*',
    '/api/applications/:path*',
    '/api/products/:path*',
    '/api/tenant/:path*',
  ],
};
