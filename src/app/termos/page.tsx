import Link from 'next/link';

export const metadata = { title: 'Termos de Uso' };

/** Data da última revisão destes termos (atualize ao alterar o conteúdo). */
const ATUALIZADO_EM = '30 de junho de 2026';

const SECOES: { titulo: string; paragrafos: string[] }[] = [
  {
    titulo: '1. Aceitação dos termos',
    paragrafos: [
      'A plataforma DRAP Business é operada por DRAP Inteligência de Mercado Ltda., inscrita no CNPJ nº 64.759.314/0001-55, com sede na Av. Campos Elísios, 1044, Quadra 220 – Lote 08, Jardim Novo Mundo, Goiânia/GO, CEP 74.705-020 ("DRAP", "plataforma", "nós").',
      'Estes Termos de Uso regem o acesso e o uso da plataforma. Ao criar uma conta, marcar a opção de aceite ou utilizar a plataforma, você declara que leu, entendeu e concorda com estes termos e com a Política de Privacidade.',
      'Se você não concorda com qualquer parte destes termos, não utilize a plataforma.',
    ],
  },
  {
    titulo: '2. Descrição do serviço',
    paragrafos: [
      'A DRAP Business é um hub digital de negócios e conexões que reúne, entre outros recursos: perfil profissional, banco de vagas, vitrine de produtos e serviços, captação e gestão de clientes (CRM), propostas, agenda com salas de reunião, chat, grupos e ranking de engajamento.',
      'A plataforma é multi-tenant: cada negócio possui um espaço próprio, e o mesmo e-mail pode existir em negócios distintos. Podemos adicionar, alterar ou descontinuar funcionalidades a qualquer momento.',
    ],
  },
  {
    titulo: '3. Cadastro e conta',
    paragrafos: [
      'Para usar os recursos autenticados é necessário criar uma conta com informações verdadeiras, completas e atualizadas. Você é responsável por manter a confidencialidade da sua senha e por toda atividade realizada na sua conta.',
      'Você deve ter capacidade legal para contratar. É proibido criar contas em nome de terceiros sem autorização ou utilizar identidade falsa. Comunique-nos imediatamente qualquer uso não autorizado da sua conta.',
    ],
  },
  {
    titulo: '4. Planos, assinaturas e pagamentos',
    paragrafos: [
      'A plataforma oferece um plano gratuito e planos pagos (Prime), com recursos adicionais. As assinaturas pagas são processadas por meio de provedor de pagamento terceiro (Stripe), sujeito aos termos e à política de privacidade do próprio provedor.',
      'Salvo indicação em contrário, as assinaturas são renovadas automaticamente ao fim de cada ciclo. Você pode cancelar a renovação a qualquer momento; o cancelamento passa a valer no fim do período já pago, sem reembolso proporcional, exceto quando exigido por lei.',
    ],
  },
  {
    titulo: '5. Regras de conduta',
    paragrafos: [
      'Ao publicar ou interagir, você concorda com as Diretrizes da Comunidade. É proibido conteúdo ilegal, ofensivo, discriminatório, sexual explícito, enganoso, spam, golpes, malware ou que viole direitos de terceiros.',
      'Reservamo-nos o direito de moderar, remover conteúdo e suspender ou encerrar contas que violem estes termos ou as diretrizes, com ou sem aviso prévio.',
    ],
  },
  {
    titulo: '6. Conteúdo do usuário',
    paragrafos: [
      'Você mantém a titularidade do conteúdo que publica (textos, imagens, currículos, propostas, etc.). Ao publicá-lo, você concede à DRAP uma licença não exclusiva para hospedar, exibir e processar esse conteúdo na medida necessária ao funcionamento da plataforma.',
      'Você é o único responsável pelo conteúdo que envia e declara possuir os direitos necessários para compartilhá-lo, respeitando marcas, direitos autorais e a privacidade de terceiros.',
    ],
  },
  {
    titulo: '7. Negociações entre usuários',
    paragrafos: [
      'A DRAP é uma intermediadora tecnológica que conecta pessoas e negócios. Vagas, candidaturas, vendas, contratações e demais negociações ocorrem diretamente entre os usuários envolvidos.',
      'Não somos parte dessas relações e não garantimos a veracidade de anúncios, a idoneidade dos usuários, a conclusão de negócios nem a qualidade de produtos ou serviços ofertados. Avalie com cautela antes de contratar ou pagar.',
    ],
  },
  {
    titulo: '8. Recursos de inteligência artificial',
    paragrafos: [
      'Alguns recursos utilizam classificação automatizada (por exemplo, pontuação de currículos). Esses resultados têm caráter auxiliar e indicativo, não substituem o julgamento humano e podem conter imprecisões. Decisões finais são de responsabilidade do usuário.',
    ],
  },
  {
    titulo: '9. Limitação de responsabilidade',
    paragrafos: [
      'A plataforma é fornecida "no estado em que se encontra", sem garantias de disponibilidade ininterrupta ou ausência de erros. Na máxima extensão permitida pela lei, a DRAP não se responsabiliza por danos indiretos, lucros cessantes ou prejuízos decorrentes de negociações entre usuários ou do uso da plataforma.',
    ],
  },
  {
    titulo: '10. Suspensão e encerramento',
    paragrafos: [
      'Você pode excluir sua conta a qualquer momento pelo painel (em "Zona de perigo"). A exclusão é definitiva e remove seus dados pessoais associados; se você for o único usuário do negócio, o negócio inteiro e seus dados também são excluídos.',
      'Podemos suspender ou encerrar o acesso, no todo ou em parte, em caso de violação destes termos, exigência legal ou descontinuação do serviço.',
    ],
  },
  {
    titulo: '11. Alterações nos termos',
    paragrafos: [
      'Podemos atualizar estes termos periodicamente. Mudanças relevantes serão sinalizadas na plataforma. O uso continuado após a atualização significa concordância com a nova versão.',
    ],
  },
  {
    titulo: '12. Lei aplicável e foro',
    paragrafos: [
      'Estes termos são regidos pelas leis da República Federativa do Brasil. Para relações de consumo, fica eleito o foro do domicílio do consumidor; nas demais hipóteses, o foro da Comarca de Goiânia/GO, para dirimir eventuais controvérsias.',
    ],
  },
  {
    titulo: '13. Contato',
    paragrafos: [
      'Dúvidas, solicitações ou comunicações relacionadas a estes Termos de Uso podem ser enviadas para o e-mail de suporte: suporte@drap.app.br.',
    ],
  },
];

export default function TermosPage() {
  return (
    <div className="container-app py-12">
      <div className="mx-auto max-w-2xl">
        <span className="selo bg-ink-900 text-white">Legal</span>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-tinta">Termos de Uso</h1>
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
          Veja também a{' '}
          <Link href="/privacidade" className="font-semibold text-marca-600 hover:underline">
            Política de Privacidade
          </Link>{' '}
          e as{' '}
          <Link href="/diretrizes" className="font-semibold text-marca-600 hover:underline">
            Diretrizes da Comunidade
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
