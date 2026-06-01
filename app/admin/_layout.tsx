import React from 'react';
import { Stack } from 'expo-router';
import { cores } from '../../src/tema';
import { t } from '../../src/i18n';

export default function LayoutAdmin() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: cores.azulMarinho },
        headerTintColor: cores.textoInverso,
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Stack.Screen name="login" options={{ title: t.admin.loginTitulo }} />
      <Stack.Screen name="index" options={{ title: t.admin.painel }} />
      <Stack.Screen name="precos" options={{ title: t.admin.secaoPrecos }} />
      <Stack.Screen name="parceiros" options={{ title: t.admin.secaoParceiros }} />
    </Stack>
  );
}
