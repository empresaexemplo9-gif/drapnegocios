import type { Config } from 'tailwindcss';

/**
 * Identidade DRAP Business (kit de marca).
 * - Acento primário: CORAL (#FF4D2E) → escala `marca`.
 * - Fundos escuros / texto: INK navy-slate (#0B1018 → #D6DAE2) → escala `ink`.
 * - Creme (#FBFBF2) para texto/símbolo sobre fundo escuro.
 * - Funcionais: info (azul), sucesso (verde), alerta (âmbar).
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Acento primário — CORAL
        marca: {
          50: '#FFF1ED',
          100: '#FFE1D9',
          200: '#FFC3B3',
          300: '#FF9E86',
          400: '#FF7558',
          500: '#FF4D2E', // primária
          600: '#ED3A1C',
          700: '#C42C13',
          800: '#7D2415', // coral escuro
          900: '#5E1D12',
        },
        // INK — navy/slate do kit (fundos escuros e texto)
        ink: {
          50: '#F4F6F9',
          100: '#D6DAE2',
          200: '#A6AEBE',
          300: '#8B94A6',
          400: '#5B6577',
          500: '#2A3344',
          600: '#232C3D',
          700: '#1A2233',
          800: '#141B2B',
          900: '#0E1421',
          950: '#0B1018',
        },
        creme: '#FBFBF2',
        info: '#2BA4F3',
        sucesso: '#2FBF71',
        alerta: '#F5A623',
        tinta: '#0E1421',
      },
      fontFamily: {
        sans: ['var(--fonte-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
