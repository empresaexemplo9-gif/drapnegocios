/**
 * Seed inicial. Cria um tenant de demonstração com usuários de cada papel,
 * vagas nos três níveis de plano, produtos e análises de IA — para o painel
 * Prime já aparecer populado na primeira execução.
 *
 * Rodar: npm run db:seed (após aplicar o schema e o RLS).
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
      configuracoes: { tema: 'azul-roxo' },
    },
  });

  await prisma.subscription.create({
    data: {
      tenantId: tenant.id,
      plano: 'prime_pro',
      status: 'ativa',
      renovaEm: new Date(Date.now() + 30 * 864e5),
      gateway: 'demo',
    },
  });

  // Usuários: um por papel/perfil relevante.
  const base = (nome: string, email: string, papel: any, tipoPerfil: any) => ({
    tenantId: tenant.id,
    nome,
    email,
    senhaHash,
    papel,
    tipoPerfil,
    status: 'ativo' as const,
    emailVerificadoEm: new Date(),
  });

  const admin = await prisma.user.create({
    data: base('Ana Admin', 'admin@demo.drap', 'super_admin', 'empresa'),
  });
  const recruiter = await prisma.user.create({
    data: base('Rafael Recrutador', 'recruiter@demo.drap', 'recruiter', 'empresa'),
  });
  const seller = await prisma.user.create({
    data: base('Sofia Vendedora', 'seller@demo.drap', 'seller', 'autonomo'),
  });
  const candidato = await prisma.user.create({
    data: { ...base('Marina Costa', 'candidata@demo.drap', 'candidate', 'pessoa_fisica'), scoreIa: 92 },
  });

  await prisma.profile.createMany({
    data: [
      { tenantId: tenant.id, userId: admin.id, tipo: 'empresa_contratante', areaAtuacao: 'Tecnologia', regiao: 'Goiânia - GO' },
      { tenantId: tenant.id, userId: recruiter.id, tipo: 'empresa_contratante', areaAtuacao: 'RH', regiao: 'Goiânia - GO' },
      { tenantId: tenant.id, userId: seller.id, tipo: 'vendedor', areaAtuacao: 'Alimentos', regiao: 'Brasília - DF' },
      { tenantId: tenant.id, userId: candidato.id, tipo: 'candidato', areaAtuacao: 'Design & Branding', regiao: 'São Paulo - SP' },
    ],
  });

  // Vagas nos três níveis de plano.
  const vagaFree = await prisma.job.create({
    data: {
      tenantId: tenant.id, empresaId: admin.id, titulo: 'Designer de Social Media',
      descricao: 'Peças para redes sociais.', nivel: 'junior', tipoContrato: 'PJ',
      regiao: 'Goiânia - GO', planoNaPublicacao: 'free',
    },
  });
  const vagaBasico = await prisma.job.create({
    data: {
      tenantId: tenant.id, empresaId: admin.id, titulo: 'Gestor de Tráfego Pago',
      descricao: 'Campanhas de performance.', nivel: 'pleno', tipoContrato: 'FREELA',
      regiao: 'Remoto', planoNaPublicacao: 'prime_basico',
    },
  });
  const vagaElite = await prisma.job.create({
    data: {
      tenantId: tenant.id, empresaId: admin.id, titulo: 'Desenvolvedor(a) Full-Stack',
      descricao: 'Integrações e automações B2B.', nivel: 'senior', tipoContrato: 'CLT',
      regiao: 'Goiânia - GO', planoNaPublicacao: 'prime_elite',
    },
  });

  // Candidatura + análise de IA.
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

  // Produtos.
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

  console.info(`Seed concluído. Tenant=${tenant.slug} | senha de teste: Drap@2026`);
  void vagaBasico;
  void vagaElite;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
