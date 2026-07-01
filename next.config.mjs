/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lint roda separadamente; não bloqueia o build do MVP.
  eslint: { ignoreDuringBuilds: true },

  // Cabeçalhos de segurança (higiene básica). Evitamos CSP estrita e não
  // restringimos câmera/microfone para não quebrar as calls (Jitsi).
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
          { key: 'Permissions-Policy', value: 'geolocation=(), browsing-topics=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
