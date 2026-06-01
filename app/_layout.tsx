import 'react-native-gesture-handler';
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CarrinhoProvider } from '../src/contextos/CarrinhoContext';
import { AutenticacaoProvider } from '../src/contextos/AutenticacaoContext';
import { PromptInstalacao } from '../src/componentes';
import { cores } from '../src/tema';
import { t } from '../src/i18n';

export default function LayoutRaiz() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AutenticacaoProvider>
          <CarrinhoProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: cores.superficie },
                headerTintColor: cores.azulMarinho,
                headerTitleStyle: { fontWeight: '800' },
                headerShadowVisible: false,
                contentStyle: { backgroundColor: cores.fundo },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="admin" options={{ headerShown: false }} />
              <Stack.Screen name="resultados" options={{ title: t.resultados.titulo }} />
              <Stack.Screen name="detalhe" options={{ title: '' }} />
              <Stack.Screen
                name="checkout"
                options={{ title: t.checkout.titulo, presentation: 'modal' }}
              />
              <Stack.Screen
                name="login"
                options={{ headerShown: false, presentation: 'modal' }}
              />
            </Stack>
            <PromptInstalacao />
          </CarrinhoProvider>
        </AutenticacaoProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
