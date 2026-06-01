/** Termos de Uso da Viaje Brasil (versão jurídica e operacional). */
export interface SecaoTermos {
  titulo: string;
  paragrafos: string[];
}

export const termosTitulo = 'Termos de Uso — Viaje Brasil';
export const termosSubtitulo =
  'Aplicável ao site, aplicativo e plataformas digitais da Viaje Brasil';

export const termos: SecaoTermos[] = [
  {
    titulo: '1. Apresentação',
    paragrafos: [
      'Bem-vindo à Viaje Brasil. Os presentes Termos de Uso regulam o acesso e a utilização da plataforma digital da Viaje Brasil, disponível através do website, aplicativo e demais canais eletrônicos, destinados à intermediação e comercialização de passagens rodoviárias, serviços turísticos e soluções correlatas.',
      'Ao utilizar a plataforma, o Usuário declara ter lido, compreendido e aceitado integralmente estes Termos.',
    ],
  },
  {
    titulo: '2. Definições',
    paragrafos: [
      'Plataforma: ambiente digital da Viaje Brasil.',
      'Usuário: pessoa física ou jurídica que acessa ou utiliza os serviços.',
      'Parceiros: empresas de transporte, operadoras, gateways de pagamento, APIs, integradores e fornecedores.',
      'Bilhete: passagem emitida para utilização de transporte rodoviário.',
      'Viação: empresa efetivamente responsável pela operação do transporte.',
    ],
  },
  {
    titulo: '3. Objeto',
    paragrafos: [
      'A Viaje Brasil atua como plataforma intermediadora de venda de passagens rodoviárias e serviços correlatos, conectando usuários às empresas transportadoras parceiras.',
      'A responsabilidade pela execução do transporte é exclusivamente da empresa transportadora responsável pelo trecho contratado.',
    ],
  },
  {
    titulo: '4. Cadastro do Usuário',
    paragrafos: [
      'O Usuário compromete-se a fornecer informações verdadeiras, atualizadas e completas. A Viaje Brasil poderá solicitar documentos complementares, realizar validação cadastral, suspender contas com inconsistências e cancelar cadastros suspeitos de fraude.',
      'O Usuário é responsável pela confidencialidade de login e senha.',
    ],
  },
  {
    titulo: '5. Aceite Eletrônico',
    paragrafos: [
      'O aceite eletrônico destes Termos possui validade jurídica plena, nos termos da Medida Provisória nº 2.200-2/2001, do Marco Civil da Internet e demais legislações aplicáveis.',
      'Ao clicar em "Aceito", "Continuar", "Finalizar Compra" ou equivalente, o Usuário concorda integralmente com este instrumento.',
    ],
  },
  {
    titulo: '6. Compra de Passagens',
    paragrafos: [
      'As compras poderão ser realizadas mediante cartão de crédito, PIX, boleto bancário, carteiras digitais e outros meios disponibilizados na plataforma.',
      'A emissão do bilhete está sujeita à aprovação do pagamento, validações antifraude, disponibilidade da viação e confirmação operacional.',
    ],
  },
  {
    titulo: '7. Política Antifraude',
    paragrafos: [
      'A Viaje Brasil poderá realizar análises automáticas e manuais de segurança. Compras poderão ser aprovadas, reprovadas, bloqueadas temporariamente ou submetidas à validação documental.',
      'A Viaje Brasil poderá cancelar compras diante de suspeita de fraude, divergência cadastral, uso indevido de cartão, chargeback, tentativa de fraude eletrônica ou utilização indevida da plataforma.',
    ],
  },
  {
    titulo: '8. Chargeback e Contestações',
    paragrafos: [
      'Nos casos de contestação indevida de pagamento ("chargeback"), fraude ou utilização irregular de meios de pagamento, a Viaje Brasil poderá suspender o cadastro do Usuário, cancelar bilhetes, bloquear novas compras e adotar medidas administrativas e judiciais cabíveis.',
    ],
  },
  {
    titulo: '9. Responsabilidades da Viação',
    paragrafos: [
      'A empresa transportadora parceira é exclusivamente responsável por horários, embarque, operação do transporte, atrasos, cancelamentos, bagagens, acidentes, interrupções de viagem e execução do serviço de transporte.',
      'A Viaje Brasil atua apenas como intermediadora digital.',
    ],
  },
  {
    titulo: '10. Responsabilidades do Usuário',
    paragrafos: [
      'É responsabilidade do Usuário conferir os dados da passagem, portar documentos válidos, verificar regras para menores, comparecer antecipadamente ao embarque e observar regras da ANTT e da viação.',
      'A perda do embarque por atraso do Usuário não gera responsabilidade da Viaje Brasil.',
    ],
  },
  {
    titulo: '11. Cancelamento e Reembolso',
    paragrafos: [
      'Os cancelamentos observarão regras da ANTT, políticas da empresa transportadora, horários mínimos exigidos, taxas operacionais e multas aplicáveis.',
      'O Usuário declara ciência de que determinados valores poderão ser retidos conforme regulamentação vigente. Os prazos de reembolso poderão variar conforme operadora financeira, instituição bancária, administradora do cartão e empresa transportadora.',
    ],
  },
  {
    titulo: '12. Taxas de Serviço',
    paragrafos: [
      'A Viaje Brasil poderá cobrar taxas de conveniência, intermediação, operação, processamento, suporte e emissão. Os valores serão previamente informados antes da conclusão da compra.',
    ],
  },
  {
    titulo: '13. Indisponibilidade da Plataforma',
    paragrafos: [
      'A Viaje Brasil não garante funcionamento ininterrupto da plataforma. Poderão ocorrer interrupções decorrentes de manutenção, atualização, falhas técnicas, ataques cibernéticos, indisponibilidade de terceiros, falhas de internet e eventos de força maior.',
    ],
  },
  {
    titulo: '14. Limitação de Responsabilidade',
    paragrafos: [
      'A Viaje Brasil não será responsável por falhas da viação, perda de conexão, atrasos operacionais, indisponibilidade de terceiros, danos indiretos, lucros cessantes e problemas técnicos externos.',
    ],
  },
  {
    titulo: '15. Dados Pessoais e LGPD',
    paragrafos: [
      'O tratamento de dados pessoais observará a Lei Geral de Proteção de Dados — LGPD (Lei nº 13.709/2018). Os dados poderão ser utilizados para emissão de bilhetes, atendimento, segurança antifraude, obrigações legais, comunicação operacional e melhoria da plataforma.',
      'Os dados poderão ser compartilhados com empresas transportadoras, gateways de pagamento, parceiros tecnológicos e autoridades competentes.',
      'O Usuário poderá solicitar correção, atualização, exclusão, portabilidade e revogação de consentimento através dos canais oficiais de atendimento.',
    ],
  },
  {
    titulo: '16. Cookies e Tecnologias',
    paragrafos: [
      'A plataforma poderá utilizar cookies, pixels, rastreadores, ferramentas analíticas e tecnologias de personalização. O Usuário poderá gerenciar permissões diretamente em seu navegador.',
    ],
  },
  {
    titulo: '17. Propriedade Intelectual',
    paragrafos: [
      'Todos os direitos relativos à plataforma pertencem à Viaje Brasil, incluindo logotipos, layout, identidade visual, software, textos, imagens, marcas e conteúdo institucional. É proibida reprodução sem autorização formal.',
    ],
  },
  {
    titulo: '18. Uso Indevido da Plataforma',
    paragrafos: [
      'É proibido praticar fraudes, utilizar robôs, invadir sistemas, copiar conteúdo, gerar sobrecarga proposital, utilizar dados falsos e revender serviços sem autorização.',
    ],
  },
  {
    titulo: '19. Comunicações Eletrônicas',
    paragrafos: [
      'O Usuário autoriza o envio de e-mails, SMS, WhatsApp, notificações, comunicações promocionais e mensagens operacionais. O cancelamento de comunicações promocionais poderá ser solicitado a qualquer momento.',
    ],
  },
  {
    titulo: '20. Serviços Futuros',
    paragrafos: [
      'A Viaje Brasil poderá oferecer passagens aéreas, hospedagens, seguros, aluguel de veículos, pacotes turísticos, clube de benefícios, cashback e assinaturas. Os serviços poderão possuir regras complementares específicas.',
    ],
  },
  {
    titulo: '21. Alteração dos Termos',
    paragrafos: [
      'A Viaje Brasil poderá atualizar estes Termos a qualquer momento. A continuidade de utilização da plataforma representa concordância com as alterações.',
    ],
  },
  {
    titulo: '22. Legislação Aplicável',
    paragrafos: [
      'Aplicam-se o Código de Defesa do Consumidor, o Marco Civil da Internet, a LGPD, as regulamentações da ANTT e a legislação brasileira vigente.',
    ],
  },
  {
    titulo: '23. Foro',
    paragrafos: [
      'Fica eleito o foro do domicílio do consumidor, nos termos da legislação aplicável, para dirimir eventuais controvérsias.',
    ],
  },
  {
    titulo: '24. Canais Oficiais',
    paragrafos: [
      'Site: viajebrasilpassagens.com.br',
      'WhatsApp: (62) 99325-6671',
      'E-mail de suporte: suporte@viajebrasilpassagens.com.br',
      'E-mail LGPD/Jurídico: juridico@viajebrasilpassagens.com.br',
      'Atendimento: 24 horas — Plataforma Online',
    ],
  },
  {
    titulo: '25. Disposições Finais',
    paragrafos: [
      'A nulidade eventual de qualquer cláusula não prejudicará as demais disposições destes Termos.',
      'O Usuário declara ciência integral de todas as condições aqui estabelecidas.',
    ],
  },
];
