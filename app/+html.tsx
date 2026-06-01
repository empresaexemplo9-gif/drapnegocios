import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * HTML raiz da versão web (Expo Router). Aqui injetamos o manifesto do PWA e
 * as metatags que tornam o app **instalável** no celular ("Adicionar à tela
 * inicial" / "Instalar app"), abrindo em tela cheia sem a barra do navegador.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#15315E" />
        <meta name="application-name" content="ViajeBrasil" />

        {/* iOS — instalação via "Adicionar à Tela de Início" */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ViajeBrasil" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* Registra o service worker (necessário para a instalação do PWA) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
}`,
          }}
        />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
