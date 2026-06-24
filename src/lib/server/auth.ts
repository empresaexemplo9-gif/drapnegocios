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

const MAX_TENTATIVAS = 5;
const BLOQUEIO_MS = 15 * 60 * 1000;

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
      async authorize(cred) {
        if (!cred?.email || !cred?.senha || !cred?.tenantSlug) return null;

        const tenant = await prisma.tenant.findUnique({ where: { slug: cred.tenantSlug } });
        if (!tenant) return null;

        const user = await prisma.user.findUnique({
          where: { tenantId_email: { tenantId: tenant.id, email: cred.email.toLowerCase() } },
        });
        if (!user || !user.senhaHash) return null;

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
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // No primeiro login, copia as claims do usuário para o token.
      if (user) {
        token.userId = (user as { id: string }).id;
        token.tenantId = (user as { tenantId?: string }).tenantId;
        token.papel = (user as { papel?: string }).papel;
        token.tipoPerfil = (user as { tipoPerfil?: string }).tipoPerfil;
        token.plano = (user as { plano?: string }).plano;
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
