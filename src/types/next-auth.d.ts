/**
 * Aumenta os tipos do NextAuth para carregar as claims multi-tenant
 * (tenantId, papel, plano, tipoPerfil) na sessão e no JWT.
 */
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      tenantId: string;
      papel: string;
      tipoPerfil: string;
      plano: string;
    };
  }

  interface User {
    tenantId?: string;
    papel?: string;
    tipoPerfil?: string;
    plano?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    tenantId?: string;
    papel?: string;
    tipoPerfil?: string;
    plano?: string;
  }
}
