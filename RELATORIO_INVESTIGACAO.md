# Relatório de Investigação — possível cópia não autorizada do repositório

**Repositório original:** `empresaexemplo9-gif/viajebrasil` (privado hoje; ficou público por um período)
**Site suspeito:** https://viajebrasilpassagens.com.br/ (stack relatada: Next.js + Supabase + Vercel)
**Data da análise:** 2026-06-22 (UTC)
**Natureza:** investigação **defensiva** — só código próprio e ativos **públicos**. Sem ataque/brute force/exploração.

> ⚠️ Isto **não é aconselhamento jurídico**. É coleta e organização de indícios técnicos.

---

## 0. Resumo executivo

1. **Segurança (segredos): LIMPO.** Nenhum segredo real foi commitado no histórico. Sem `<ref>.supabase.co`, sem anon key (`eyJ…`), sem `service_role`, sem `DATABASE_URL`/`RESEND`/`BLOB` com valor real, sem connection string. Os `.env*` versionados são só **modelos** (`.example`) com placeholders vazios. **Não há chaves a rotacionar por vazamento de git.**
2. **Uma exceção de segurança a tratar:** o seed `backend/sql/005_seed_exemplo.sql` traz credenciais‑padrão (`admin@viajebrasil.com` / `123456`, e os dois consultores) em texto. Como o repo foi público, **essas credenciais são conhecidas**. Se você rodou o seed sem trocar, **mude as senhas já** (especialmente o admin) — ver §7.
3. **Stack real deste repo ≠ stack do site suspeito.** Este projeto é **Expo/React Native + Vercel Functions + Neon Postgres** (não Supabase). O repo **teve** Supabase no passado ("sobras do contábil‑pro", removido). Logo, se houve cópia, ela tende a ser de **marca + frontend/conteúdo**, não do meu backend Neon.
4. **Busca no GitHub:** meus identificadores **únicos** de backend (`apibuson`, `carga_geral`, `leads_aereo`, `current_tenant_id`, `cliente_token`) **não aparecem em nenhum repositório público**. Não há cópia pública do backend indexada.
5. **Lead `mariofalluna-spec/VIAJE-BRASIL`: DESCARTADO** após análise do código (zip enviado). É outro produto — um app pessoal "Viaje Familiar Brasil" (itinerário/divisão de gastos, Google AI Studio, Vite/Drizzle/Supabase próprio). **Zero** fingerprint meu, **zero** asset igual, marca ausente. Coincidência de nome. Ver §4.1.
6. **Coleta do site suspeito: bloqueada aqui.** A rede do ambiente nega o host (`HTTP 403 host_not_allowed`). As etapas 4–6 do plano (baixar HTML/bundles/source maps/assets e comparar) precisam rodar **na sua máquina** — script pronto em `evidencias/coletar_suspeito.sh`.

---

## 1. Situação de segurança (segredos)

| Verificação | Resultado |
|---|---|
| `.env`/`.env.local` real commitado | **Não** (só `.env.example` e `.env.production.example`, com placeholders) |
| `<ref>.supabase.co` no histórico | **Não** (`EXPO_PUBLIC_SUPABASE_URL=` sempre **vazio**) |
| Anon key / JWT (`eyJ…`) | **Não** encontrado em nenhum commit |
| `service_role` | **Não** |
| `DATABASE_URL`/`RESEND_*`/`BLOB_*` com **valor** | **Não** (só nomes em modelos/docs) |
| Connection string `postgres(ql)://user:pass@host` | **Não** |
| Chaves AWS/Google/Stripe | **Não** |

**Conclusão:** o que o repositório público expôs foi **código**, não credenciais. Os segredos de servidor vivem só nas Environment Variables da Vercel e nunca passaram pelo git.

**Pendência real:** credenciais‑padrão do seed (público) — ver §7.

---

## 2. Linha do tempo (anterioridade)

- **2026-05-19** — criação do repositório (commit inicial via Netlify).
- **2026-06-03** — `feat: migra app Expo/React Native ViajeBrasil do monorepo Contabil-pro` (projeto utilizável).
- **2026-06-22** — último commit.
- **80 commits** no total.
- **Repositório suspeito `mariofalluna-spec/VIAJE-BRASIL`: criado em 2026-06-18** → **posterior** em ~1 mês ao início deste projeto.

A anterioridade deste repo está bem estabelecida (maio/junho 2026) frente ao repo suspeito (18/06/2026). Preserve isto: os carimbos de data do git são a sua prova de criação anterior.

---

## 3. Impressões digitais (fingerprints) — para comparar no suspeito

Salvas em `evidencias/fingerprints_*.txt` e `evidencias/hashes_assets.txt`.

### 3.1 FORTES (arbitrárias; coincidência seria muito improvável)
1. **`apibuson`** — nome inventado da API do site oficial (`src/servicos/endpoints.ts`).
2. **Nomes de endpoint `.php`**: `auth.php`, `buscar-viagens.php`, `criar-reserva.php`, `cancelar-reserva.php`, `confirmar-pedido.php`, `consultar-pedido.php`, `listar-pedidos.php`, `download-dabpe.php`, `listar-estacoes.php`, `config.php`, e o termo **`DABPE`**.
3. **Esquema do meu backend** (Neon/RLS): função `current_tenant_id()`, `set_config('app.current_tenant', …)`, tabelas `leads_aereo`, `lead_mensagens`, `atendimentos`, `atendimento_mensagens`, `home_ofertas`, `consultores`; colunas `carga_geral`, `cliente_token`; status `atribuido`/`em_atendimento`. *(Provável ausência se o suspeito for Supabase — mas se aparecer, é prova forte de cópia do backend.)*
4. **Hashes SHA‑256 de assets customizados** (`evidencias/hashes_assets.txt`): `assets/logo.png`, `assets/icon.png`, `assets/favicon.png`, `public/destinos/*.jpg`, `public/icons/*`. **Hash idêntico em asset customizado = indício forte.**

### 3.2 MÉDIAS (texto/visual arbitrário)
5. Textos de marketing **verbatim** (`src/i18n/pt-br.ts`): `"Sua próxima viagem começa aqui"`, `"Passagens de ônibus e aéreas, hospedagem e pacotes pelo Brasil inteiro."`, `"Maior Oferta de Linhas"`, `"Por que viajar com a ViajeBrasil?"`, `"Receba ofertas exclusivas!"`, `"Compre sua passagem onde estiver pelo nosso aplicativo gratuito."`.
6. **Paleta exata**: verde `#1FA84C`, azul‑marinho `#15315E`, amarelo `#FFC20E`, e o roxo do card "Corporativo" `#6D4FB0`.
7. **Seed do Picsum** com prefixo `vb-` (ex.: `picsum.photos/seed/vb-rio/...`).

### 3.3 FRACAS (podem ser legítimas do site oficial da empresa)
8. Marca/nome **ViajeBrasil**, slogan **"Realizando Sonhos"**, CNPJ **66.904.050/0001-01**, WhatsApp **(62) 99325‑6671** (`wa.me/5562993256671`), e‑mails `suporte@`/`juridico@viajebrasilpassagens.com.br`.
   > **Importante:** `viajebrasilpassagens.com.br` é referenciado no meu código como **site oficial** (checkout). Portanto, coincidência de **marca** é indício **fraco** — pode ser o site legítimo da empresa. O peso está nos itens **fortes** (§3.1) e nos **hashes** (§3.2/3.1.4).

---

## 4. GitHub — forks e cópias públicas

- **Busca de código global** por `apibuson`, `carga_geral leads_aereo`, `current_tenant_id cliente_token`: **0 resultados reais**. Nenhuma cópia pública do backend.
- **Busca de repositórios** por `viajebrasil`: 3 resultados —
  1. **`mariofalluna-spec/VIAJE-BRASIL`** — TypeScript, público, **2026-06-18** → **principal suspeito a inspecionar**.
  2. `AMDEVDESIGN/viajebrasil` — HTML, 2025‑09‑19 (anterior a este projeto; provavelmente sem relação).
  3. `empresaexemplo9-gif/viajebrasil` — este repo (privado).
- Leitura direta de `mariofalluna-spec/VIAJE-BRASIL` foi negada na sessão, mas o **zip do repo foi fornecido** e analisado — ver §4.1.

### 4.1 Análise de `mariofalluna-spec/VIAJE-BRASIL` — **DESCARTADO**

Conteúdo real (de `metadata.json`/código): **"Viaje Familiar Brasil"** — app pessoal de **itinerário e divisão de gastos** de uma viagem em família ao Brasil (descrição em espanhol), gerado no **Google AI Studio** (`@google/genai`, `GEMINI_API_KEY`). Stack: **Vite + React 19 + Express + Drizzle + Supabase próprio** (`hdyyunheifjheunlgcmr.supabase.co`, anon key hardcoded — é dele, não meu). Dados: avatares de jogadores (Pelé, Ronaldo…), dias de viagem, despesas.

| Sinal | Resultado |
|---|---|
| Fingerprints fortes (apibuson, leads_aereo, carga_geral, current_tenant_id, cliente_token, `.php`, #6D4FB0) | **nenhum** |
| Textos verbatim / paleta exata | **nenhum** |
| Marca (CNPJ, WhatsApp, "Realizando Sonhos", domínio) | **nenhum** (só "Viaje Brasil" genérico em 2 lugares) |
| Hashes de assets | **nenhum** bate |
| Stack | diferente do meu (Expo/Neon vs Vite/Drizzle/Supabase) |

**Veredito:** não é cópia. Coincidência do nome genérico "Viaje Brasil". Sem relação com o caso.

---

## 5. Limitações desta coleta (transparência)

- **Site suspeito inacessível** do ambiente (allowlist de rede → `403 host_not_allowed`). Não baixei HTML/bundles/source maps/assets daqui.
- **Repo de terceiro inacessível** na sessão (escopo). Não li o conteúdo de `mariofalluna-spec/VIAJE-BRASIL`.
- Por isso, as etapas de **comparação direta** (hash de assets, fingerprints nos bundles, source maps) ficam para você executar com os scripts/comandos abaixo. Eu preparei tudo para ser "rodar e comparar".

---

## 6. Passo a passo para VOCÊ coletar e comparar (na sua máquina)

### 6.1 Site suspeito
```bash
# na raiz do repo (precisa de curl)
bash evidencias/coletar_suspeito.sh https://viajebrasilpassagens.com.br
```
O script salva `evidencias/site_<timestamp>/` com headers, HTML, bundles JS/CSS, **source maps** (`.map`, se existirem — revelam caminhos/usuário/estrutura original), assets de marca, e já roda os greps de fingerprint + a checagem de **Supabase ref/anon key** nos bundles. Compare os `sha256` com `evidencias/hashes_assets.txt`.

### 6.2 Repositório suspeito do GitHub
```bash
git clone https://github.com/mariofalluna-spec/VIAJE-BRASIL suspeito-repo
grep -RInaE 'apibuson|carga_geral|leads_aereo|current_tenant_id|cliente_token|Realizando Sonhos|Sua próxima viagem começa aqui|Maior Oferta de Linhas|#6D4FB0|/seed/vb-|viajebrasilpassagens' suspeito-repo
# compare assets de marca:
sha256sum suspeito-repo/**/logo* suspeito-repo/**/favicon* 2>/dev/null
```
Olhe também: histórico de commits (datas/autor/e‑mail), README, e se há a **sua** ref Supabase ou anon key embutida.

### 6.3 O que seria PROVA FORTE
- Qualquer fingerprint **§3.1** dentro dos bundles do site **ou** do `suspeito-repo`.
- **Hash idêntico** de um asset customizado (logo/favicon/foto de `public/destinos`).
- **Source map** do site apontando para o **seu usuário/estrutura de pastas**.
- A **sua** ref Supabase / anon key embutida nos bundles do suspeito → além de cópia, **acesso indevido ao seu backend** (prioridade máxima; rotacione na hora).

---

## 7. Próximos passos sugeridos (não é aconselhamento jurídico)

1. **Trocar as credenciais‑padrão do seed** (repo foi público): no SQL Editor do Neon, `update usuarios set password_hash = crypt('NOVA_SENHA', gen_salt('bf',11)) where email = 'admin@viajebrasil.com';` (idem consultores). Ver bloco abaixo.
2. **Rodar os scripts §6** e anexar os resultados a este relatório (mantendo `evidencias/` com os timestamps).
3. **Se aparecer sua ref/anon key Supabase** nos bundles: rotacione as chaves do projeto Supabase imediatamente e revise os logs de acesso.
4. **DMCA / report de abuso na Vercel**: junte (a) prova de anterioridade (git), (b) os fingerprints fortes casados, (c) hashes idênticos, (d) source maps. A Vercel tem canal de abuse/DMCA; o GitHub também (para o repo, se confirmado).
5. **Preserve tudo** com data (não edite os arquivos baixados).

```sql
-- Trocar senha (Neon SQL Editor) — repita por conta
begin;
select set_config('app.current_tenant',
  (select id::text from tenants where slug = 'viajebrasil'), true);
update usuarios set password_hash = crypt('SUA_NOVA_SENHA', gen_salt('bf', 11))
 where email = 'admin@viajebrasil.com';
commit;
```

---

## 8. Conclusão final (após coleta do site via navegador)

Coleta do site `viajebrasilpassagens.com.br` feita por agente com navegador (só conteúdo público):

- **Não é Vercel/Next/Supabase.** É **site estático servido por Apache** (`server: Apache`, sem `x-vercel-id`/`x-powered-by`), CSS/JS inline, 2 páginas (`/`, `/ajuda.html`), um `newsletter.php` (PHP). **Sem `/_next/`, sem bundles externos, sem source maps.**
- **Fingerprints fortes:** **zero** (no site e no repo).
- **Hashes de assets:** **nenhum** dos 11 meus bate com os do site.
- **Textos de marketing:** 4 frases batem **no site** ("Maior Oferta de Linhas", "Por que viajar com a ViajeBrasil?", "Receba ofertas exclusivas!", "Compre sua passagem onde estiver pelo nosso aplicativo gratuito.") — evidência **média/fraca** (copy de passagens é parcialmente genérica; pode ser material oficial da empresa). Minha paleta **não** aparece (o site usa `#0d2240/#2eb82e/#6b3fa0`).
- **Marca:** "ViajeBrasil" + CNPJ + WhatsApp presentes no site — **fraco** (provável site legítimo da empresa).
- **Supabase ref `hdyyunheifjheunlgcmr`:** confirmada **NÃO‑minha** (meu repo nunca teve ref Supabase real; uso Neon). É chave do projeto do outro repo, não há vínculo com meu backend.

**Veredito:** **não há prova técnica de cópia do meu código** em nenhum dos alvos. O único ponto de contato é **marca + algumas frases de marketing no site** — que, sendo `viajebrasilpassagens.com.br` o **site oficial referenciado no meu próprio código**, é plausivelmente legítimo. Um DMCA/abuse com este conjunto teria **base fraca**. Próximo passo só faz sentido se existir **outro alvo** (subdomínio/deploy Vercel/app real) que reproduza o meu app — aí refaço a varredura.

---

## Anexos (pasta `evidencias/`)
- `hashes_assets.txt` — SHA‑256 dos meus assets customizados (base de comparação).
- `fingerprints_textos.txt`, `fingerprints_cores.txt`, `fingerprints_backend.txt` — assinaturas para procurar.
- `coletar_suspeito.sh` — coletor do site suspeito (rode na sua máquina).
- `_coleta.txt` — timestamp da coleta.
