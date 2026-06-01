import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { cores, raio } from '../src/tema';
import { termos, termosSubtitulo, termosTitulo } from '../src/dados/termos';

export default function Termos() {
  return (
    <ScrollView style={styles.tela} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Stack.Screen options={{ title: 'Termos de Uso' }} />

      <View style={styles.capa}>
        <Text style={styles.titulo}>{termosTitulo}</Text>
        <Text style={styles.subtitulo}>{termosSubtitulo}</Text>
        <Text style={styles.versao}>Versão Premium Jurídica e Operacional</Text>
      </View>

      {termos.map((secao) => (
        <View key={secao.titulo} style={styles.secao}>
          <Text style={styles.secaoTitulo}>{secao.titulo}</Text>
          {secao.paragrafos.map((p, i) => (
            <Text key={i} style={styles.paragrafo}>
              {p}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  capa: {
    backgroundColor: cores.azulMarinho,
    borderRadius: raio.lg,
    padding: 18,
    marginBottom: 20,
  },
  titulo: { color: cores.textoInverso, fontSize: 20, fontWeight: '800' },
  subtitulo: { color: cores.textoInverso, opacity: 0.9, fontSize: 13, marginTop: 6, fontWeight: '500' },
  versao: { color: cores.amarelo, fontSize: 12, marginTop: 8, fontWeight: '700' },
  secao: { marginBottom: 20 },
  secaoTitulo: { fontSize: 16, fontWeight: '800', color: cores.azulMarinho, marginBottom: 8 },
  paragrafo: { fontSize: 14, color: cores.textoSuave, lineHeight: 22, fontWeight: '500', marginBottom: 8 },
});
