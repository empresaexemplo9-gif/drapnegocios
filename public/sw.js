/* Service worker mínimo do ViajeBrasil.
 * Necessário para o app ser "instalável" (o Chrome só dispara o
 * beforeinstallprompt quando há um SW com handler de fetch). Estratégia
 * network-first com cache de fallback, para o app abrir mesmo offline. */
const CACHE = 'viajebrasil-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((resposta) => {
        const copia = resposta.clone();
        caches.open(CACHE).then((c) => c.put(event.request, copia)).catch(() => {});
        return resposta;
      })
      .catch(() => caches.match(event.request)),
  );
});
