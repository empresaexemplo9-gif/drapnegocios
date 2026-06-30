import Link from 'next/link';

export const metadata = { title: 'Termos de Uso' };

/** Data da última revisão destes termos (atualize ao alterar o conteúdo). */
const ATUALIZADO_EM = '30 de junho de 2026';

const SECOES: { titulo: string; paragrafos: string[] }[] = [
  {
    titulo: '1. Identificação e aceitação',
    paragrafos: [
      'A plataforma DRAP Business é operada por DRAP Inteligência de Mercado Ltda., inscrita no CNPJ nº 64.759.314/0001-55, com sede na Av. Campos Elísios, 1044, Quadra 220 – Lote 08, Jardim Novo Mundo, Goiânia/GO, CEP 74.705-020 ("DRAP", "plataforma", "nós").',
      'Estes Termos de Uso constituem um contrato vinculante entre você ("usuário") e a DRAP. Ao criar uma conta, marcar a opção de aceite, acessar ou utilizar a plataforma de qualquer forma, você declara que leu, compreendeu e concorda integralmente com estes Termos e com a Política de Privacidade, que os integra.',
      'O aceite eletrônico (marcação da caixa de confirmação no cadastro, com registro de data, hora e IP) tem plena validade jurídica e equivale à assinatura para todos os fins. Se você não concorda com qualquer disposição, não utilize a plataforma.',
    ],
  },
  {
    titulo: '2. Descrição do serviço',
    paragrafos: [
      'A DRAP Business é um hub digital de negócios e conexões que disponibiliza, entre outros recursos: perfil profissional, banco de vagas, vitrine de produtos e serviços, captação e gestão de clientes (CRM), propostas, agenda com salas de reunião, chat, grupos, ranking de engajamento e recursos de inteligência artificial.',
      'A DRAP fornece apenas a infraestrutura tecnológica de intermediação. Não é empregadora, recrutadora, vendedora, compradora, corretora, consultora, nem parte em qualquer negociação realizada entre usuários.',
      'A plataforma é multi-tenant: cada negócio possui um espaço próprio. Podemos, a nosso critério e a qualquer tempo, criar, alterar, limitar, suspender ou descontinuar funcionalidades, no todo ou em parte, sem que isso gere direito a indenização.',
    ],
  },
  {
    titulo: '3. Elegibilidade e cadastro',
    paragrafos: [
      'O uso é destinado a pessoas com 18 anos ou mais e plena capacidade civil, ou a pessoas jurídicas regularmente constituídas, representadas por quem tenha poderes para tanto. Ao se cadastrar, você declara e garante que essas condições são verdadeiras.',
      'Você se compromete a fornecer informações verdadeiras, exatas, completas e atualizadas, e a mantê-las atualizadas. É o único responsável pela guarda e confidencialidade de suas credenciais e por todas as atividades realizadas em sua conta, ainda que por terceiros.',
      'A DRAP pode, a seu exclusivo critério e sem aviso prévio, recusar, suspender ou cancelar cadastros, inclusive em caso de suspeita de fraude, dados falsos, uso indevido ou violação destes Termos, sem que isso gere qualquer obrigação de indenizar.',
    ],
  },
  {
    titulo: '4. Licença de uso',
    paragrafos: [
      'A DRAP concede a você uma licença pessoal, limitada, revogável, não exclusiva e intransferível para usar a plataforma conforme estes Termos. Nenhum direito de propriedade é transferido.',
      'É vedado: (a) copiar, modificar, distribuir, vender ou licenciar qualquer parte da plataforma; (b) realizar engenharia reversa, descompilar ou tentar extrair o código-fonte; (c) usar robôs, scrapers ou meios automatizados não autorizados; (d) burlar mecanismos de segurança, limites ou cobrança; (e) sobrecarregar a infraestrutura ou interferir no funcionamento; (f) usar a plataforma para fins ilícitos ou em violação a estes Termos.',
    ],
  },
  {
    titulo: '5. Conduta do usuário',
    paragrafos: [
      'Ao usar a plataforma você concorda com as Diretrizes da Comunidade e se obriga a não publicar ou praticar: conteúdo ilegal, ofensivo, difamatório, discriminatório, sexual explícito, enganoso, spam, golpes, pirâmides, malware, ou que viole direitos de terceiros, leis ou a moral.',
      'Você é integralmente responsável por suas publicações, mensagens, ofertas, contratações, negociações e por toda interação realizada na plataforma, respondendo por eventuais danos causados a terceiros ou à DRAP.',
    ],
  },
  {
    titulo: '6. Conteúdo do usuário e moderação',
    paragrafos: [
      'Você mantém a titularidade do conteúdo que publica (textos, imagens, currículos, propostas, etc.). Ao publicá-lo, concede à DRAP licença mundial, gratuita, não exclusiva e pelo prazo necessário para hospedar, armazenar, reproduzir, exibir, adaptar e processar esse conteúdo na medida necessária à operação e divulgação da plataforma.',
      'Você declara e garante que possui todos os direitos e autorizações necessários sobre o conteúdo que envia e que ele não viola direitos de terceiros, isentando a DRAP de qualquer responsabilidade a esse respeito.',
      'A DRAP não tem obrigação de monitorar previamente o conteúdo, mas pode, a seu exclusivo critério e sem aviso, remover conteúdo, moderar, limitar alcance, suspender ou encerrar contas que considere violarem estes Termos, as Diretrizes ou a lei, sem que isso gere direito a indenização.',
    ],
  },
  {
    titulo: '7. Responsabilidade por conteúdo de terceiros (Marco Civil)',
    paragrafos: [
      'Nos termos do art. 19 da Lei nº 12.965/2014 (Marco Civil da Internet), a DRAP somente poderá ser responsabilizada civilmente por danos decorrentes de conteúdo gerado por terceiros se, após ordem judicial específica, deixar de tomar as providências para tornar indisponível o conteúdo apontado como infringente, nos limites técnicos do serviço.',
      'A DRAP não se responsabiliza por opiniões, anúncios, currículos, ofertas, informações ou quaisquer conteúdos publicados por usuários, tampouco pela sua veracidade, exatidão, legalidade ou atualidade.',
    ],
  },
  {
    titulo: '8. Negociações entre usuários',
    paragrafos: [
      'Vagas, candidaturas, contratações, vendas, compras, prestações de serviço, propostas e quaisquer negociações ocorrem direta e exclusivamente entre os usuários envolvidos. A DRAP é mera facilitadora do contato e não integra essas relações.',
      'A DRAP não garante a veracidade de anúncios, a idoneidade, qualificação ou capacidade dos usuários, a concretização de negócios, a qualidade, segurança ou legalidade de produtos e serviços, nem o cumprimento de obrigações pactuadas entre as partes. Cabe a você avaliar, com a devida cautela, com quem negocia, antes de contratar, contratar-se ou pagar.',
      'A DRAP não se responsabiliza por prejuízos, perdas, danos, fraudes, inadimplementos ou conflitos decorrentes de negociações entre usuários, que deverão ser resolvidos diretamente entre as partes envolvidas.',
    ],
  },
  {
    titulo: '9. Planos, assinaturas e pagamentos',
    paragrafos: [
      'A plataforma oferece um plano gratuito e planos pagos (Prime). As assinaturas pagas são processadas por provedor de pagamento terceiro (Asaas), sujeitando-se também aos termos e à política de privacidade do próprio provedor; a DRAP não armazena dados completos de cartão e não responde por falhas, indisponibilidades ou decisões do provedor de pagamento.',
      'Salvo indicação em contrário, as assinaturas são mensais e renovadas automaticamente ao fim de cada ciclo, até que canceladas. O cancelamento interrompe as renovações futuras e passa a valer ao fim do período já pago, sem reembolso proporcional de valores já cobrados, ressalvado o direito de arrependimento e demais hipóteses previstas em lei.',
      'Preços e condições podem ser alterados, com comunicação prévia, aplicando-se aos ciclos seguintes. É de sua responsabilidade o recolhimento de tributos eventualmente incidentes sobre suas próprias atividades e receitas obtidas a partir do uso da plataforma.',
    ],
  },
  {
    titulo: '10. Recursos de inteligência artificial',
    paragrafos: [
      'Determinados recursos utilizam processamento automatizado e inteligência artificial (por exemplo, classificação e pontuação de currículos). Os resultados têm caráter meramente auxiliar, indicativo e estatístico, podem conter erros ou imprecisões e não substituem a análise e a decisão humana.',
      'A DRAP não garante qualquer resultado específico (contratação, venda, alcance, retorno financeiro) e não se responsabiliza por decisões tomadas pelo usuário com base nesses recursos.',
    ],
  },
  {
    titulo: '11. Propriedade intelectual',
    paragrafos: [
      'A plataforma, sua marca, nome, logotipo, layout, código, bancos de dados, funcionalidades e demais elementos são de titularidade exclusiva da DRAP ou de seus licenciadores, protegidos pela legislação de propriedade intelectual. O uso da plataforma não confere a você qualquer direito sobre tais elementos.',
      'É vedado o uso da marca "DRAP" e de sinais distintivos sem autorização prévia e por escrito.',
    ],
  },
  {
    titulo: '12. Isenção de garantias',
    paragrafos: [
      'Na máxima extensão permitida pela legislação aplicável, a plataforma é fornecida "no estado em que se encontra" e "conforme disponível", sem garantias de qualquer natureza, expressas ou implícitas, incluindo disponibilidade ininterrupta, ausência de erros, adequação a uma finalidade específica ou obtenção de resultados.',
      'A DRAP não garante que a plataforma estará livre de falhas, vírus, indisponibilidades, perdas de dados ou interrupções, podendo realizar manutenções, atualizações e suspensões técnicas a qualquer tempo.',
    ],
  },
  {
    titulo: '13. Limitação de responsabilidade',
    paragrafos: [
      'Na máxima extensão permitida pela legislação aplicável, a DRAP não responde por danos indiretos, incidentais, especiais, lucros cessantes, perda de chance, perda de dados, perda de receita ou de oportunidades de negócio decorrentes do uso ou da impossibilidade de uso da plataforma.',
      'Na hipótese de a DRAP vir a ser responsabilizada, a indenização total ficará limitada, na medida do permitido em lei, ao valor efetivamente pago por você à DRAP a título de assinatura nos 12 (doze) meses anteriores ao fato que originou a responsabilidade; para usuários do plano gratuito, a tais valores que tenham sido eventualmente pagos.',
      'Nenhuma disposição destes Termos exclui ou limita responsabilidades que não possam ser excluídas ou limitadas pela legislação aplicável, em especial nas relações de consumo.',
    ],
  },
  {
    titulo: '14. Indenização pelo usuário',
    paragrafos: [
      'Você concorda em defender, indenizar e isentar a DRAP, suas controladas, sócios, administradores, colaboradores e parceiros de toda e qualquer reclamação, perda, dano, responsabilidade, custo e despesa (incluindo honorários advocatícios) decorrentes de: (a) seu conteúdo; (b) seu uso da plataforma; (c) sua violação destes Termos, das Diretrizes ou da lei; (d) a violação de direitos de terceiros; ou (e) negociações que você realizar com outros usuários.',
      'Caso a DRAP seja acionada judicial ou extrajudicialmente em razão de atos a você imputáveis, você desde já se obriga a requerer a exclusão da DRAP do feito e a assumir o polo passivo, arcando integralmente com os valores de eventual condenação, custas e honorários.',
    ],
  },
  {
    titulo: '15. Suspensão e encerramento',
    paragrafos: [
      'Você pode encerrar sua conta a qualquer momento pelo painel (em "Zona de perigo"). A exclusão é definitiva e remove seus dados pessoais associados; se você for o único usuário do negócio, o negócio e seus dados também são excluídos.',
      'A DRAP pode suspender ou encerrar o acesso, no todo ou em parte, imediatamente e sem aviso prévio, em caso de violação destes Termos, suspeita de fraude, ordem legal, risco à segurança ou descontinuação do serviço, sem que isso gere direito a indenização.',
    ],
  },
  {
    titulo: '16. Força maior',
    paragrafos: [
      'A DRAP não responde por falhas, atrasos ou interrupções decorrentes de caso fortuito ou força maior, incluindo falhas de internet, energia, provedores de hospedagem, ataques cibernéticos, atos de terceiros, determinações governamentais ou outros eventos fora de seu controle razoável.',
    ],
  },
  {
    titulo: '17. Alterações dos Termos',
    paragrafos: [
      'A DRAP pode atualizar estes Termos a qualquer tempo. Alterações relevantes serão sinalizadas na plataforma e/ou comunicadas por e-mail, com a revisão da data de "última atualização". O uso continuado após a vigência da nova versão implica concordância com ela.',
    ],
  },
  {
    titulo: '18. Disposições gerais',
    paragrafos: [
      'A eventual nulidade ou inexequibilidade de qualquer disposição não afetará as demais, que permanecerão válidas. A tolerância quanto a qualquer descumprimento não implica novação ou renúncia de direitos.',
      'Você não pode ceder estes Termos sem anuência da DRAP; a DRAP pode cedê-los em caso de reorganização societária, fusão, aquisição ou venda de ativos. Estes Termos, com a Política de Privacidade e as Diretrizes, constituem o acordo integral entre as partes quanto ao objeto.',
    ],
  },
  {
    titulo: '19. Lei aplicável e foro',
    paragrafos: [
      'Estes Termos são regidos pelas leis da República Federativa do Brasil. Para relações de consumo, fica eleito o foro do domicílio do consumidor; nas demais hipóteses, as partes elegem o foro da Comarca de Goiânia/GO, com renúncia a qualquer outro, por mais privilegiado que seja, para dirimir controvérsias decorrentes destes Termos.',
    ],
  },
  {
    titulo: '20. Contato',
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
