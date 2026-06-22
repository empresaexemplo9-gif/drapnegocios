import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { cores } from '../../src/tema';
import { useAutenticacao } from '../../src/contextos/AutenticacaoContext';

export default function LayoutPainel() {
  const { autenticado, carregando, temPapel } = useAutenticacao();

  if (carregando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.fundo }}>
        <ActivityIndicator size="large" color={cores.verde} />
      </View>
    );
  }
  if (!autenticado) return <Redirect href="/login" />;
  if (!temPapel('consultor', 'admin')) return <Redirect href="/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: cores.superficie },
        headerTintColor: cores.azulMarinho,
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: '' }} />
      <Stack.Screen name="atendimento/[id]" options={{ title: '' }} />
    </Stack>
  );
}
