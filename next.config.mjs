/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lint roda separadamente; não bloqueia o build do MVP.
  eslint: { ignoreDuringBuilds: true },

  // nodemailer usa require dinâmico: precisa ser tratado como pacote externo do
  // servidor, senão o bundle das server actions (ex.: recuperação de senha)
  // quebra o import('nodemailer') e o envio SMTP falha silenciosamente.
  experimental: { serverComponentsExternalPackages: ['nodemailer'] },

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
          // CSP conservadora: bloqueia injeção de <base>, clickjacking e
          // plugins (<object>/<embed>), sem restringir script/style/img — assim
          // não quebra o Next nem imagens de usuários. Uma CSP de script-src
          // com nonces pode ser adicionada depois.
          { key: 'Content-Security-Policy', value: "base-uri 'self'; frame-ancestors 'self'; object-src 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;
