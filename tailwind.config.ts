import type { Config } from 'tailwindcss';

/** Identidade DRAP Business: sóbria, profissional, com destaque em azul/roxo escuro. */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        marca: {
          50: '#eef3fb',
          100: '#dbe7f7',
          200: '#b7cfee',
          300: '#94b7e6',
          400: '#5f88d8',
          500: '#305db0',
          600: '#17356B', // principal (do SVG)
          700: '#0b1220', // sombra / secundário (ajustado)
        },
        tinta: '#0F172A',
      },
      fontFamily: {
        sans: ['var(--fonte-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
