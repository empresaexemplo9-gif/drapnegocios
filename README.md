# ViajeBrasil — App Mobile

**App em produção (PWA/web):** https://viajebrasil.vercel.app/

Aplicativo mobile da **ViajeBrasil** (VIAJE BRASIL LTDA) para venda de
passagens **rodoviárias** e **aéreas** (nacionais e internacionais),
**hospedagem**, **locação de veículos**, **seguro viagem** e **pacotes
turísticos**. Slogan: _Realizando Sonhos_.

Construído com **Expo + React Native + Expo Router + TypeScript**. A interface
da tela inicial (carrossel de ofertas, seletor de categorias e busca) tem como
referência o app da Decolar.

> Projeto **autônomo**: tem seu próprio gerenciamento de dependências (npm) e
> roda isolado, neste repositório `viajebrasil`. Foi migrado para fora do
> monorepo `contabil-pro` (antes em `apps/mobile`), para separar os dois
> produtos.

## Como rodar

A partir da raiz do projeto:

```bash
npm install
npm start          # abre o Expo Dev Tools (QR code)
npm run android    # emulador/dispositivo Android
npm run ios        # simulador iOS (macOS)
npm run web        # versão web
```

## Verificações

```bash
npm run type-check          # tsc --noEmit
npx expo export --platform web   # valida que todas as rotas compilam
```

## Estrutura

```
app/                 Rotas (Expo Router)
  (tabs)/            Abas: Início, Buscar, Reservas, Perfil
  resultados.tsx     Lista de resultados por categoria
  detalhe.tsx        Detalhe do produto + adicionar à reserva
  checkout.tsx       Pagamento (PIX, cartão, boleto) + confirmação
  login.tsx          Login (e-mail/senha e Google)
  sobre.tsx          Segurança, formas de pagamento, canais e dados da empresa
  termos.tsx         Termos de Uso completos
src/
  componentes/       UI reutilizável (logo, carrossel, cartões, botões...)
  contextos/         Carrinho de reservas e autenticação (React Context)
  dados/             Dados mockados (passagens, hotéis, pacotes, etc.)
  i18n/              Strings de UI em PT-BR (sem texto hardcoded nas telas)
  tema/              Cores da marca, tipografia, espaçamento
  tipos/             Tipos TypeScript dos produtos
assets/              logo.png oficial (usada como ícone, splash e no app)
```

## Convenções

Segue o `CLAUDE.md` da raiz: identificadores em PT-BR sem acento, comentários
em português, e **toda string de UI passa pelo i18n** (`src/i18n`).

## Observações

- Os dados do catálogo são **mockados** (`src/dados`). O **backend opcional** se
  liga definindo `EXPO_PUBLIC_API_URL` (modo `api`, API do site oficial —
  pasta `apibuson/`); sem isso o app roda em modo mock. Veja
  `src/servicos/INTEGRACAO.md`. A integração de catálogo completo e pagamento
  (ex.: PassHub e gateway) são os próximos passos.
- As imagens ilustrativas vêm do Unsplash (exigem rede para carregar).
- A logo oficial (`assets/logo.png`) é a base da identidade. Dois scripts sem
  dependências externas processam a imagem:
  - `scripts/processar_logo.py` — recorta a logo num círculo com cantos
    transparentes (usada na splash e dentro do app).
  - `scripts/gerar_icones.py` — gera `icon.png` (1024, fundo branco opaco — iOS
    não aceita transparência), `adaptive-icon.png` (1024, transparente, com zona
    segura do Android) e `favicon.png` (web).

## Baixar / abrir o app (gerar uma URL)

Há três formas de disponibilizar o app, da mais rápida à mais completa:

### 1. PWA — instalável pelo navegador (mais rápido, sem loja)

Faça deploy do build estático na Vercel (ver seção acima). O app é um **PWA**
(`public/manifest.json` + metatags em `app/+html.tsx`): ao abrir o link no
celular, o navegador oferece **"Instalar app" / "Adicionar à tela inicial"**.
Instalado, ganha ícone próprio e abre **em tela cheia**, sem a barra do
navegador — experiência de app nativo, sem APK nem loja.

- **Android/Chrome:** menu ⋮ → "Instalar app" / "Adicionar à tela inicial".
- **iOS/Safari:** botão Compartilhar → "Adicionar à Tela de Início".

### 2. APK Android (instalável — URL de download)

Gera um `.apk` baixável via EAS Build (servidores da Expo). Na sua máquina,
com uma conta Expo gratuita:

```bash
npm install
npx eas-cli login          # uma vez
npx eas-cli init           # cria o projectId (uma vez)
npx eas-cli build --platform android --profile preview
```

Ao terminar, o EAS imprime uma **URL de download do APK**
(ex.: `https://expo.dev/artifacts/eas/....apk`) — é só abrir no Android e
instalar. O perfil `preview` já está configurado em `eas.json` para gerar APK.

### 3. Testar na hora com Expo Go

```bash
npm start          # mostra um QR code
```

Instale o app **Expo Go** (Play Store / App Store) e escaneie o QR — o app
abre no seu celular sem instalar nada.



O app roda também na web (Expo Router com `output: "static"`). O `vercel.json`
já está configurado para gerar o site estático em `dist/`.

Para publicar um preview compartilhável:

1. Na Vercel, **New Project** apontando para este repositório.
2. Deixe o **Root Directory** na raiz do repositório (`./`).
3. O build usa `npm run build:web` (= `expo export --platform web`) e publica
   a pasta `dist`. Não precisa de variáveis de ambiente para a versão mockada.
   O deploy atual está em https://viajebrasil.vercel.app/.
4. Quando os endpoints reais existirem, defina `EXPO_PUBLIC_API_URL` nas
   Environment Variables do projeto — os serviços passam de `mock` para `api`
   automaticamente (ver `src/servicos/config.ts`).

> É um projeto Vercel **separado** do app web contábil (`contabil-pro-*`); não
> compartilham build nem domínio.

Build local para conferir:

```bash
npm run build:web   # gera dist/
npx serve dist      # serve estático em http://localhost:3000
```
