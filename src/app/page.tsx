import Link from 'next/link';

const modulos = [
  { nome: 'Perfil Unificado', desc: 'Pessoa, empresa, autônomo ou produto em um só perfil.', href: '/perfil', mvp: true },
  { nome: 'Banco de Vagas e Talentos', desc: 'Vagas CLT, PJ e freela com match por habilidade e região.', href: '/vagas', mvp: true },
  { nome: 'Vitrine e Marketplace', desc: 'Serviços e produtos com preço, prazo e proposta direta.', href: '/vitrine', mvp: true },
  { nome: 'Rede de Captação', desc: 'Feed com quem busca, quem oferece e quem está disponível.', href: '/feed', mvp: true },
  { nome: 'Marketing Automatizado', desc: 'Crie uma vez, publique em todas as redes. Conteúdo com IA.', href: '/marketing', mvp: true },
  { nome: 'Planos e IA de Classificação', desc: 'Prime: IA lê e ranqueia currículos e dá visibilidade direcionada.', href: '/planos', mvp: true },
  { nome: 'Integração com Redes Sociais', desc: 'OAuth com Instagram, LinkedIn, WhatsApp e TikTok.', href: null, mvp: false },
  { nome: 'CRM Nativo', desc: 'Leads e candidatos caem num funil visual com histórico.', href: null, mvp: false },
  { nome: 'Central de Propostas', desc: 'Gera proposta em PDF/link e dispara pelos canais.', href: null, mvp: false },
  { nome: 'Grupos e Comunidades', desc: 'Grupos por setor e região para tráfego orgânico.', href: null, mvp: false },
  { nome: 'IA e Score de Perfil', desc: 'Pontua completude e atividade, ranqueando nas buscas.', href: null, mvp: false },
  { nome: 'Motor de Engajamento', desc: 'Pontos, ranking e recompensas por conexões e indicações.', href: null, mvp: false },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-ink-950 via-ink-900 to-ink-800 text-white">
        <div className="container-app py-20 sm:py-28">
          <span className="selo bg-marca-500/15 text-marca-300">Hub de negócios e conexões</span>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            Um perfil único para captar clientes, talentos e parceiros.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-200">
            A DRAP Business une marketing, banco de vagas, vitrine de serviços e uma rede de
            captação — tudo em um só lugar, para empresas, profissionais e autônomos.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/perfil" className="btn-primario">
              Criar meu perfil
            </Link>
            <Link href="/feed" className="btn-secundario !border-white/30 !bg-transparent !text-white hover:!border-white hover:!text-white">
              Ver a rede de captação
            </Link>
          </div>
        </div>
      </section>

      {/* Módulos */}
      <section className="container-app py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-tinta sm:text-3xl">
              Tudo que sua operação precisa
            </h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              O MVP já entrega perfil, vagas, vitrine e captação. Os demais módulos chegam nas
              próximas fases.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modulos.map((m) => {
            const conteudo = (
              <div className="cartao flex h-full flex-col">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-tinta">{m.nome}</h3>
                  {m.mvp ? (
                    <span className="selo bg-emerald-100 text-emerald-700">Disponível</span>
                  ) : (
                    <span className="selo bg-slate-100 text-slate-500">Em breve</span>
                  )}
                </div>
                <p className="mt-2 flex-1 text-sm text-slate-600">{m.desc}</p>
                {m.href && (
                  <span className="mt-4 text-sm font-semibold text-marca-600">Acessar →</span>
                )}
              </div>
            );
            return m.href ? (
              <Link key={m.nome} href={m.href} className="block">
                {conteudo}
              </Link>
            ) : (
              <div key={m.nome} className="opacity-80">
                {conteudo}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
