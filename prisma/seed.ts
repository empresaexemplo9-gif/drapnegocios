/**
 * Seed idempotente — pode rodar em todo deploy (build da Vercel) sem duplicar.
 * Cria um tenant de demonstração com usuários de cada papel, vagas nos três
 * níveis de plano, produtos e análises de IA, para o painel Prime já aparecer
 * populado na primeira execução.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash('Drap@2026', 12);

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      nome: 'DRAP Demonstração',
      slug: 'demo',
      plano: 'prime_pro',
      statusAssinatura: 'ativa',
      configuracoes: { tema: 'coral-ink' },
    },
  });

  // Usuários (upsert por tenant+email → idempotente).
  async function upsertUser(
    nome: string,
    email: string,
    papel: any,
    tipoPerfil: any,
    tipoProfile: any,
    perfil: { areaAtuacao: string; regiao: string },
    scoreIa = 0,
  ) {
    const u = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email } },
      update: {},
      create: {
        tenantId: tenant.id,
        nome,
        email,
        senhaHash,
        papel,
        tipoPerfil,
        status: 'ativo',
        emailVerificadoEm: new Date(),
        scoreIa,
      },
    });
    await prisma.profile.upsert({
      where: { userId: u.id },
      update: {},
      create: { tenantId: tenant.id, userId: u.id, tipo: tipoProfile, ...perfil },
    });
    return u;
  }

  const admin = await upsertUser('Ana Admin', 'admin@demo.drap', 'super_admin', 'empresa', 'empresa_contratante', { areaAtuacao: 'Tecnologia', regiao: 'Goiânia - GO' });
  await upsertUser('Rafael Recrutador', 'recruiter@demo.drap', 'recruiter', 'empresa', 'empresa_contratante', { areaAtuacao: 'RH', regiao: 'Goiânia - GO' });
  const seller = await upsertUser('Sofia Vendedora', 'seller@demo.drap', 'seller', 'autonomo', 'vendedor', { areaAtuacao: 'Alimentos', regiao: 'Brasília - DF' });
  const candidato = await upsertUser('Marina Costa', 'candidata@demo.drap', 'candidate', 'pessoa_fisica', 'candidato', { areaAtuacao: 'Design & Branding', regiao: 'São Paulo - SP' }, 92);

  // Assinatura (cria só se ainda não houver).
  if ((await prisma.subscription.count({ where: { tenantId: tenant.id } })) === 0) {
    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        plano: 'prime_pro',
        status: 'ativa',
        renovaEm: new Date(Date.now() + 30 * 864e5),
        gateway: 'demo',
      },
    });
  }

  // Conteúdo de demonstração (vagas/produtos/IA) — só na primeira vez.
  if ((await prisma.job.count({ where: { tenantId: tenant.id } })) === 0) {
    const vagaFree = await prisma.job.create({
      data: {
        tenantId: tenant.id, empresaId: admin.id, titulo: 'Designer de Social Media',
        descricao: 'Peças para redes sociais.', nivel: 'junior', tipoContrato: 'PJ',
        regiao: 'Goiânia - GO', planoNaPublicacao: 'free',
        area: 'Design & Branding', habilidades: ['Figma', 'Social Media', 'Identidade Visual'],
      },
    });
    await prisma.job.create({
      data: {
        tenantId: tenant.id, empresaId: admin.id, titulo: 'Gestor de Tráfego Pago',
        descricao: 'Campanhas de performance.', nivel: 'pleno', tipoContrato: 'FREELA',
        regiao: 'Remoto', planoNaPublicacao: 'prime_basico',
        area: 'Marketing Digital', habilidades: ['Google Ads', 'Meta Ads', 'Analytics'],
      },
    });
    await prisma.job.create({
      data: {
        tenantId: tenant.id, empresaId: admin.id, titulo: 'Desenvolvedor(a) Full-Stack',
        descricao: 'Integrações e automações B2B.', nivel: 'senior', tipoContrato: 'CLT',
        regiao: 'Goiânia - GO', planoNaPublicacao: 'prime_elite',
        area: 'Tecnologia', habilidades: ['React', 'APIs', 'Cloud'],
      },
    });

    const aplicacao = await prisma.application.create({
      data: {
        tenantId: tenant.id, jobId: vagaFree.id, candidateId: candidato.id,
        status: 'em_analise', scoreIa: 88,
        classificacaoIa: { aderencia: 34, experiencia: 25, certificacoes: 14, referencias: 15 },
      },
    });
    await prisma.aiAnalysis.create({
      data: {
        tenantId: tenant.id, tipo: 'curriculo', referenciaId: aplicacao.id, score: 88,
        resumo: 'Designer sênior, alta aderência à vaga, 2 certificações e 3 referências.',
        detalhes: { nivel: 'senior' }, modelo: 'claude-sonnet-4-6',
      },
    });

    const prod = await prisma.product.create({
      data: {
        tenantId: tenant.id, sellerId: seller.id, nome: 'Café Especial — Atacado',
        descricao: 'Grãos torrados artesanalmente, pacotes de 1kg.', categoria: 'Alimentos',
        preco: '48.00', regiaoAtendimento: 'Brasília - DF', planoNoCadastro: 'prime_pro',
        scoreRelevancia: 76,
      },
    });
    await prisma.aiAnalysis.create({
      data: {
        tenantId: tenant.id, tipo: 'produto', referenciaId: prod.id, score: 76,
        resumo: 'Produto com boa demanda regional; recomendável destaque por intenção de compra.',
        modelo: 'claude-sonnet-4-6',
      },
    });
  }

  console.info(`Seed OK. Tenant=${tenant.slug} | login admin@demo.drap | senha Drap@2026`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
