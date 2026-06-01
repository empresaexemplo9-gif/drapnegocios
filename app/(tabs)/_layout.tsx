import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { cores } from '../../src/tema';
import { t } from '../../src/i18n';
import { useCarrinho } from '../../src/contextos/CarrinhoContext';

type Icone = keyof typeof Ionicons.glyphMap;

export default function LayoutAbas() {
  const { itens } = useCarrinho();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.azul,
        tabBarInactiveTintColor: cores.textoClaro,
        tabBarStyle: {
          backgroundColor: cores.superficie,
          borderTopColor: cores.borda,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.abas.inicio,
          tabBarIcon: ({ color, size }) => icone('home', color, size),
        }}
      />
      <Tabs.Screen
        name="buscar"
        options={{
          title: t.abas.buscar,
          tabBarIcon: ({ color, size }) => icone('search', color, size),
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: t.abas.reservas,
          tabBarIcon: ({ color, size }) => (
            <View>
              {icone('bookmark', color, size)}
              {itens.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeTexto}>{itens.length}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: t.abas.perfil,
          tabBarIcon: ({ color, size }) => icone('person', color, size),
        }}
      />
    </Tabs>
  );
}

const icone = (nome: Icone, cor: string, tamanho: number) => (
  <Ionicons name={nome} size={tamanho} color={cor} />
);

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: cores.laranja,
    borderRadius: 999,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeTexto: { color: cores.textoInverso, fontSize: 10, fontWeight: '800' },
});
