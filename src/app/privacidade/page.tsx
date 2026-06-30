import Link from 'next/link';

export const metadata = { title: 'Política de Privacidade' };

/** Data da última revisão (atualize ao alterar o conteúdo). */
const ATUALIZADO_EM = '30 de junho de 2026';

const SECOES: { titulo: string; paragrafos: string[] }[] = [
  {
    titulo: '1. Quem somos',
    paragrafos: [
      'Esta Política de Privacidade explica como a plataforma DRAP Business ("DRAP", "nós") coleta, usa, compartilha e protege dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).',
      'A plataforma é operada por DRAP Inteligência de Mercado Ltda., inscrita no CNPJ nº 64.759.314/0001-55, com sede na Av. Campos Elísios, 1044, Quadra 220 – Lote 08, Jardim Novo Mundo, Goiânia/GO, CEP 74.705-020, que atua como controladora dos dados de cadastro e uso da plataforma, para fins da LGPD.',
      'Ao usar a plataforma, você concorda com as práticas descritas aqui.',
    ],
  },
  {
    titulo: '2. Dados que coletamos',
    paragrafos: [
      'Dados de cadastro: nome, e-mail, senha (armazenada de forma criptografada/hash), tipo de perfil e nome do negócio.',
      'Dados de perfil e conteúdo: foto, banner, biografia, área de atuação, região, currículos, produtos/serviços, vagas, propostas, mensagens, posts e demais conteúdos que você cria.',
      'Dados de uso e técnicos: registros de acesso, endereço IP, data/hora, ações realizadas e cookies de sessão necessários à autenticação.',
      'Dados de pagamento: quando você assina um plano pago, os dados de pagamento são tratados diretamente pelo provedor (Stripe); não armazenamos números completos de cartão.',
    ],
  },
  {
    titulo: '3. Como usamos os dados',
    paragrafos: [
      'Para criar e manter sua conta, autenticar o acesso e operar as funcionalidades (vagas, vitrine, CRM, chat, agenda, propostas, etc.).',
      'Para processar assinaturas e pagamentos, prevenir fraudes e abusos, moderar conteúdo e cumprir obrigações legais.',
      'Para classificação automatizada (por exemplo, pontuação de currículos), com caráter auxiliar, e para melhorar e personalizar a experiência.',
      'Para comunicações operacionais (confirmações, avisos de segurança, recuperação de senha e notificações da conta).',
    ],
  },
  {
    titulo: '4. Base legal',
    paragrafos: [
      'Tratamos dados pessoais com fundamento na execução do contrato (prestação do serviço), no consentimento (quando aplicável), no cumprimento de obrigação legal e no legítimo interesse para segurança e melhoria da plataforma, sempre respeitando seus direitos.',
    ],
  },
  {
    titulo: '5. Compartilhamento',
    paragrafos: [
      'Não vendemos seus dados pessoais. Compartilhamos dados apenas na medida necessária com provedores que viabilizam o serviço, como hospedagem e infraestrutura (Vercel), pagamentos (Stripe), envio de e-mails e provedores de recursos de inteligência artificial.',
      'Conteúdo que você publica de forma pública (perfil, vitrine, vagas, posts) fica visível para outros usuários conforme as configurações de visibilidade. Também podemos compartilhar dados para cumprir ordem judicial ou exigência legal.',
    ],
  },
  {
    titulo: '6. Cookies e sessão',
    paragrafos: [
      'Utilizamos cookies estritamente necessários para autenticação e funcionamento seguro da plataforma. Sem eles, recursos como login não funcionam corretamente.',
    ],
  },
  {
    titulo: '7. Segurança',
    paragrafos: [
      'Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo senhas armazenadas como hash, isolamento de dados por negócio (Row Level Security multi-tenant) e controle de acesso por papéis.',
      'Nenhum sistema é totalmente imune a riscos, mas trabalhamos continuamente para reduzir a probabilidade de incidentes e responder a eles de forma adequada.',
    ],
  },
  {
    titulo: '8. Retenção e exclusão',
    paragrafos: [
      'Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para as finalidades descritas e obrigações legais.',
      'Você pode excluir sua conta a qualquer momento pelo painel (em "Zona de perigo"). A exclusão remove seus dados pessoais associados; se você for o único usuário do negócio, o negócio inteiro e seus dados também são removidos. Alguns registros podem ser retidos quando exigido por lei.',
    ],
  },
  {
    titulo: '9. Seus direitos (LGPD)',
    paragrafos: [
      'Você pode solicitar, a qualquer tempo: confirmação da existência de tratamento; acesso aos dados; correção de dados incompletos ou desatualizados; anonimização, bloqueio ou eliminação; portabilidade; informação sobre compartilhamento; e revogação do consentimento.',
      'Boa parte desses direitos pode ser exercida diretamente pela plataforma (edição de perfil e exclusão de conta). Para os demais, entre em contato pelos canais informados ao final.',
    ],
  },
  {
    titulo: '10. Dados de terceiros',
    paragrafos: [
      'Ao incluir dados de terceiros (por exemplo, em currículos, propostas ou cadastros de clientes/leads), você declara ter base legal para isso e se responsabiliza por informar e obter as autorizações necessárias dessas pessoas.',
    ],
  },
  {
    titulo: '11. Transferência internacional',
    paragrafos: [
      'Alguns provedores podem processar dados fora do Brasil. Nesses casos, buscamos garantir que a transferência ocorra com salvaguardas adequadas e em conformidade com a LGPD.',
    ],
  },
  {
    titulo: '12. Menores de idade',
    paragrafos: [
      'A plataforma destina-se a maiores de 18 anos. Não coletamos intencionalmente dados de menores. Caso identifiquemos um cadastro indevido, a conta poderá ser removida.',
    ],
  },
  {
    titulo: '13. Alterações desta política',
    paragrafos: [
      'Podemos atualizar esta política periodicamente. Mudanças relevantes serão sinalizadas na plataforma, e a data de "última atualização" no topo será revisada.',
    ],
  },
  {
    titulo: '14. Encarregado (DPO) e contato',
    paragrafos: [
      'O Encarregado pelo Tratamento de Dados Pessoais (DPO) é Marcelo Carvalho Furtado Junior, que pode ser contatado pelo e-mail dpo@drap.app.br para o exercício dos seus direitos e demais questões de privacidade.',
      'Para outros assuntos, utilize o e-mail de suporte: suporte@drap.app.br.',
    ],
  },
];

export default function PrivacidadePage() {
  return (
    <div className="container-app py-12">
      <div className="mx-auto max-w-2xl">
        <span className="selo bg-ink-900 text-white">Legal</span>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-tinta">
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-slate-500">Última atualização: {ATUALIZADO_EM}</p>

        <div className="mt-8 space-y-5">
          {SECOES.map((s) => (
            <div key={s.titulo} className="cartao">
              <h2 className="font-black text-tinta">{s.titulo}</h2>
              {s.paragrafos.map((p, i) => (
                <p key={i} className="mt-2 text-sm leading-relaxed text-slate-600">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-slate-400">
          Veja também os{' '}
          <Link href="/termos" className="font-semibold text-marca-600 hover:underline">
            Termos de Uso
          </Link>
          . Dúvidas sobre privacidade podem ser enviadas para o DPO em dpo@drap.app.br.
        </p>
      </div>
    </div>
  );
}
