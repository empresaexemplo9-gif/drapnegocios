import Link from 'next/link';

export const metadata = { title: 'Política de Privacidade' };

/** Data da última revisão (atualize ao alterar o conteúdo). */
const ATUALIZADO_EM = '30 de junho de 2026';

const SECOES: { titulo: string; paragrafos: string[] }[] = [
  {
    titulo: '1. Quem somos e âmbito',
    paragrafos: [
      'Esta Política de Privacidade explica como a plataforma DRAP Business ("DRAP", "nós") coleta, usa, compartilha e protege dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD) e o Marco Civil da Internet (Lei nº 12.965/2014).',
      'A plataforma é operada por DRAP Inteligência de Mercado Ltda., inscrita no CNPJ nº 64.759.314/0001-55, com sede na Av. Campos Elísios, 1044, Quadra 220 – Lote 08, Jardim Novo Mundo, Goiânia/GO, CEP 74.705-020, que atua como controladora dos dados de cadastro e uso da plataforma.',
      'Ao utilizar a plataforma, você declara estar ciente e de acordo com as práticas aqui descritas. Esta Política integra os Termos de Uso.',
    ],
  },
  {
    titulo: '2. Dados que coletamos',
    paragrafos: [
      'Dados de cadastro: nome, e-mail, senha (armazenada de forma criptografada/hash), tipo de perfil e nome do negócio.',
      'Dados de perfil e conteúdo: foto, banner, biografia, área de atuação, região, currículos, produtos/serviços, vagas, propostas, mensagens, posts e demais conteúdos que você cria ou envia.',
      'Dados de uso e técnicos: registros de acesso, endereço IP, data e hora, ações realizadas e cookies de sessão necessários à autenticação. Os registros de acesso a aplicações são mantidos por, no mínimo, 6 meses, conforme o art. 15 do Marco Civil da Internet.',
      'Dados de pagamento: ao assinar um plano pago, os dados de pagamento são tratados diretamente pelo provedor (Asaas); não armazenamos números completos de cartão.',
    ],
  },
  {
    titulo: '3. Como e por que usamos os dados',
    paragrafos: [
      'Para criar e manter sua conta, autenticar o acesso e operar as funcionalidades (vagas, vitrine, CRM, chat, agenda, propostas, etc.).',
      'Para processar assinaturas e pagamentos, prevenir fraudes e abusos, garantir segurança, moderar conteúdo e cumprir obrigações legais e regulatórias.',
      'Para classificação automatizada (por exemplo, pontuação de currículos), com caráter auxiliar, e para melhorar, personalizar e desenvolver a plataforma.',
      'Para comunicações operacionais (confirmações, avisos de segurança, recuperação de senha e notificações da conta) e para o exercício regular de direitos em processos.',
    ],
  },
  {
    titulo: '4. Bases legais (LGPD)',
    paragrafos: [
      'Tratamos dados pessoais com fundamento, conforme o caso, na: execução de contrato e procedimentos preliminares; cumprimento de obrigação legal ou regulatória; exercício regular de direitos em processo judicial, administrativo ou arbitral; legítimo interesse para segurança, prevenção a fraudes e melhoria do serviço; e consentimento, quando aplicável.',
    ],
  },
  {
    titulo: '5. Compartilhamento de dados',
    paragrafos: [
      'Não vendemos seus dados pessoais. Compartilhamos dados apenas na medida necessária com operadores e parceiros que viabilizam o serviço, como hospedagem e infraestrutura (Vercel), pagamentos (Asaas), envio de e-mails e provedores de recursos de inteligência artificial, todos obrigados a tratar os dados conforme a finalidade contratada.',
      'Conteúdo que você publica de forma pública (perfil, vitrine, vagas, posts) fica visível a outros usuários conforme as configurações de visibilidade, sob sua responsabilidade. Também podemos compartilhar dados para cumprir ordem judicial, requisição de autoridade competente, exigência legal ou para proteger direitos, segurança e integridade da DRAP, dos usuários ou de terceiros.',
      'Em caso de reorganização societária, fusão, aquisição ou venda de ativos, os dados poderão ser transferidos ao sucessor, mantida a observância desta Política.',
    ],
  },
  {
    titulo: '6. Cookies e sessão',
    paragrafos: [
      'Utilizamos cookies estritamente necessários para autenticação e funcionamento seguro da plataforma. Sem eles, recursos como o login não funcionam corretamente.',
    ],
  },
  {
    titulo: '7. Segurança',
    paragrafos: [
      'Adotamos medidas técnicas e organizacionais razoáveis para proteger os dados, incluindo senhas armazenadas como hash, isolamento de dados por negócio (Row Level Security multi-tenant), controle de acesso por papéis e tráfego criptografado.',
      'Nenhum sistema é totalmente imune a riscos. Não é possível garantir segurança absoluta, e a DRAP não se responsabiliza por acessos não autorizados decorrentes de caso fortuito, força maior, ataques de terceiros ou de culpa do próprio usuário (por exemplo, compartilhamento ou guarda inadequada de senha). Em caso de incidente de segurança relevante, adotaremos as providências e comunicações exigidas pela LGPD.',
    ],
  },
  {
    titulo: '8. Retenção e exclusão',
    paragrafos: [
      'Mantemos os dados pelo tempo necessário às finalidades descritas e ao cumprimento de obrigações legais. Mesmo após o encerramento da conta, certos dados podem ser conservados pelos prazos legais e para o exercício regular de direitos em eventuais processos (incluindo os registros de acesso exigidos pelo Marco Civil).',
      'Você pode excluir sua conta a qualquer momento pelo painel (em "Zona de perigo"). A exclusão remove seus dados pessoais associados; se você for o único usuário do negócio, o negócio e seus dados também são removidos, ressalvadas as hipóteses de retenção legal acima.',
    ],
  },
  {
    titulo: '9. Seus direitos como titular',
    paragrafos: [
      'Você pode solicitar, a qualquer tempo: confirmação da existência de tratamento; acesso aos dados; correção de dados incompletos, inexatos ou desatualizados; anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade; portabilidade; informação sobre o compartilhamento; e revogação do consentimento, quando aplicável.',
      'Parte desses direitos pode ser exercida diretamente na plataforma (edição de perfil e exclusão de conta). Para os demais, contate o Encarregado (item 13). Podemos solicitar informações para confirmar sua identidade antes de atender ao pedido, e o atendimento observará os limites e exceções previstos na LGPD.',
    ],
  },
  {
    titulo: '10. Dados de terceiros fornecidos por você',
    paragrafos: [
      'Ao inserir dados de terceiros (por exemplo, em currículos, propostas, mensagens ou cadastros de clientes e leads), você declara possuir base legal e autorização para isso e assume a responsabilidade exclusiva por informar tais pessoas e por obter os consentimentos necessários, isentando a DRAP de responsabilidade quanto a esse tratamento.',
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
      'A plataforma destina-se a maiores de 18 anos. Não coletamos intencionalmente dados de menores. Caso identifiquemos cadastro indevido, a conta poderá ser removida.',
    ],
  },
  {
    titulo: '13. Encarregado (DPO) e contato',
    paragrafos: [
      'O Encarregado pelo Tratamento de Dados Pessoais (DPO) é Marcelo Carvalho Furtado Junior, que pode ser contatado pelo e-mail dpo@drap.app.br para o exercício de direitos e demais questões de privacidade.',
      'Para outros assuntos, utilize o e-mail de suporte: suporte@drap.app.br.',
    ],
  },
  {
    titulo: '14. Alterações desta Política',
    paragrafos: [
      'Podemos atualizar esta Política periodicamente. Alterações relevantes serão sinalizadas na plataforma, com a revisão da data de "última atualização" no topo. O uso continuado após a vigência implica ciência da versão atualizada.',
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
