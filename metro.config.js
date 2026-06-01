// Configuração do Metro para o app Expo.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// O supabase-js importa @opentelemetry/api dinamicamente (telemetria opcional),
// que não está instalado. Apontamos para um módulo vazio para o bundle resolver.
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@opentelemetry/api': require.resolve('./scripts/shim-vazio.js'),
};

module.exports = config;
