/**
 * Configuração do NextAuth (estratégia JWT).
 *
 * O token carrega tenantId, userId, plano, papel e tipoPerfil — evitando
 * consultas ao banco a cada request (o middleware e as rotas leem do token).
 * Provedores: Credentials (e-mail+senha, escopado por tenant), Google, LinkedIn.
 * Bloqueio de conta após 5 falhas de login (persistido em users).
 */
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import LinkedInProvider from 'next-auth/providers/linkedin';
import { prisma } from './prisma';
import { conferirSenha } from './password';
import { registrarAudit } from './audit';
import { slugUnico } from './tenant';
import { checarRate } from './rate-limit';

const MAX_TENTATIVAS = 5;
const BLOQUEIO_MS = 15 * 60 * 1000;

/**
 * Onboarding de login social (Google/LinkedIn): encontra o usuário pelo e-mail
 * ou cria um novo negócio (tenant + super_admin + perfil + assinatura free),
 * igual ao cadastro por e-mail. Devolve as claims para o token.
 */
async function onboardOAuth(
  email: string,
  nome: string,
): Promise<{ id: string; tenantId: string; papel: string; tipoPerfil: string; plano: string } | null> {
  const e = email.trim().toLowerCase();
  if (!e) return null;
  const existente = await prisma.user.findFirst({
    where: { email: e },
    include: { tenant: { select: { plano: true } } },
  });
  if (existente) {
    return {
      id: existente.id,
      tenantId: existente.tenantId,
      papel: existente.papel,
      tipoPerfil: existente.tipoPerfil,
      plano: existente.tenant.plano,
    };
  }
  const slug = await slugUnico(nome || e.split('@')[0]);
  const criado = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({ data: { nome: nome || e, slug, plano: 'free', statusAssinatura: 'trial' } });
    const u = await tx.user.create({
      data: {
        tenantId: tenant.id,
        nome: nome || e,
        email: e,
        papel: 'super_admin',
        status: 'ativo',
        emailVerificadoEm: new Date(),
        tipoPerfil: 'pessoa_fisica',
      },
    });
    await tx.profile.create({ data: { tenantId: tenant.id, userId: u.id, tipo: 'empresa_contratante' } });
    await tx.subscription.create({ data: { tenantId: tenant.id, plano: 'free', status: 'trial' } });
    return { u, plano: tenant.plano };
  });
  return {
    id: criado.u.id,
    tenantId: criado.u.tenantId,
    papel: criado.u.papel,
    tipoPerfil: criado.u.tipoPerfil,
    plano: criado.plano,
  };
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/entrar' },
  providers: [
    CredentialsProvider({
      name: 'E-mail e senha',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        senha: { label: 'Senha', type: 'password' },
        tenantSlug: { label: 'Empresa', type: 'text' },
      },
      async authorize(cred, req) {
        if (!cred?.email || !cred?.senha) return null;
        const email = cred.email.toLowerCase();

        // Rate-limit por IP: impede brute-force distribuído e DoS por lockout
        // (o bloqueio por conta continua valendo em paralelo).
        const cabecalhos = (req?.headers ?? {}) as Record<string, string | undefined>;
        const ip = cabecalhos['x-forwarded-for']?.split(',')[0]?.trim() || 'desconhecido';
        if (!(await checarRate(`login:${ip}`, 10, 60_000)).permitido) {
          throw new Error('Muitas tentativas de login. Aguarde um instante.');
        }

        // Resolve o usuário: com slug, no tenant indicado; sem slug, pelo e-mail
        // (se ele existir em um único negócio). Em múltiplos, exige o slug.
        let user;
        if (cred.tenantSlug) {
          const tenant = await prisma.tenant.findUnique({ where: { slug: cred.tenantSlug } });
          if (!tenant) return null;
          user = await prisma.user.findUnique({
            where: { tenantId_email: { tenantId: tenant.id, email } },
            include: { tenant: true },
          });
        } else {
          const matches = await prisma.user.findMany({
            where: { email },
            include: { tenant: true },
            take: 2,
          });
          if (matches.length > 1) {
            throw new Error('Este e-mail existe em mais de um negócio. Informe o slug da empresa.');
          }
          user = matches[0] ?? null;
        }
        if (!user || !user.senhaHash) return null;
        const tenant = user.tenant;

        // Conta bloqueada?
        if (user.bloqueadoAte && user.bloqueadoAte > new Date()) {
          throw new Error('Conta temporariamente bloqueada por excesso de tentativas.');
        }
        if (user.status === 'suspenso') throw new Error('Conta suspensa.');

        const ok = await conferirSenha(cred.senha, user.senhaHash);
        if (!ok) {
          const tentativas = user.tentativasLogin + 1;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              tentativasLogin: tentativas,
              bloqueadoAte: tentativas >= MAX_TENTATIVAS ? new Date(Date.now() + BLOQUEIO_MS) : null,
            },
          });
          await registrarAudit({
            tenantId: tenant.id,
            userId: user.id,
            acao: 'login_falha',
            tabelaAfetada: 'users',
          });
          return null;
        }

        // Sucesso: zera tentativas e marca acesso.
        await prisma.user.update({
          where: { id: user.id },
          data: { tentativasLogin: 0, bloqueadoAte: null, ultimoAcesso: new Date() },
        });
        await registrarAudit({
          tenantId: tenant.id,
          userId: user.id,
          acao: 'login_sucesso',
          tabelaAfetada: 'users',
        });

        return {
          id: user.id,
          name: user.nome,
          email: user.email,
          tenantId: user.tenantId,
          papel: user.papel,
          tipoPerfil: user.tipoPerfil,
          plano: tenant.plano,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
          }),
        ]
      : []),
    ...(process.env.LINKEDIN_CLIENT_ID
      ? [
          LinkedInProvider({
            clientId: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? '',
            // LinkedIn agora usa "Sign In with LinkedIn using OpenID Connect".
            client: { token_endpoint_auth_method: 'client_secret_post' },
            issuer: 'https://www.linkedin.com/oauth',
            wellKnown: 'https://www.linkedin.com/oauth/.well-known/openid-configuration',
            authorization: { params: { scope: 'openid profile email' } },
            profile(perfil) {
              const p = perfil as unknown as {
                sub: string;
                name?: string;
                email?: string;
                picture?: string;
              };
              return {
                id: p.sub,
                name: p.name ?? null,
                email: p.email ?? null,
                image: p.picture ?? null,
              };
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    // Barreira de login social: previne account takeover.
    async signIn({ account, profile, user }) {
      // E-mail/senha passa direto (já validado no authorize).
      if (!account || account.provider === 'credentials') return true;

      // 1) Exige e-mail verificado pelo provedor (Google/OIDC LinkedIn).
      const ev = (profile as { email_verified?: boolean | string } | null)?.email_verified;
      const emailVerificado = ev === true || ev === 'true';
      if (!emailVerificado) return false;

      const email = (user?.email ?? (profile as { email?: string } | null)?.email ?? '')
        .trim()
        .toLowerCase();
      if (!email) return false;

      // 2) Não vincular login social a uma conta que já tem SENHA (evita que um
      //    login social com o mesmo e-mail assuma uma conta de e-mail+senha).
      //    Contas sem senha (criadas por social/OTP) podem entrar normalmente.
      const existente = await prisma.user.findFirst({
        where: { email },
        select: { senhaHash: true },
      });
      if (existente?.senhaHash) return false;

      return true;
    },
    async jwt({ token, user, account }) {
      // Login por e-mail/senha: o `user` já traz as claims (tenantId etc.).
      if (user && (user as { tenantId?: string }).tenantId) {
        token.userId = (user as { id: string }).id;
        token.tenantId = (user as { tenantId?: string }).tenantId;
        token.papel = (user as { papel?: string }).papel;
        token.tipoPerfil = (user as { tipoPerfil?: string }).tipoPerfil;
        token.plano = (user as { plano?: string }).plano;
      } else if (account && account.provider !== 'credentials' && token.email && !token.tenantId) {
        // Login social: encontra/cria o negócio do usuário e popula o token.
        const db = await onboardOAuth(token.email, token.name ?? '');
        if (db) {
          token.userId = db.id;
          token.tenantId = db.tenantId;
          token.papel = db.papel;
          token.tipoPerfil = db.tipoPerfil;
          token.plano = db.plano;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.tenantId = token.tenantId as string;
        session.user.papel = token.papel as string;
        session.user.tipoPerfil = token.tipoPerfil as string;
        session.user.plano = token.plano as string;
      }
      return session;
    },
  },
};
