import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio } from '../tema';

/** Nota de 0 a 10 (estilo agregadores de hospedagem). */
export function NotaAvaliacao({ nota, total }: { nota: number; total?: number }) {
  return (
    <View style={styles.linha}>
      <View style={styles.caixa}>
        <Text style={styles.nota}>{nota.toFixed(1)}</Text>
      </View>
      {total !== undefined && (
        <Text style={styles.total}>
          {total.toLocaleString('pt-BR')} avaliações
        </Text>
      )}
    </View>
  );
}

/** Estrelas de categoria (1 a 5). */
export function Estrelas({ quantidade }: { quantidade: number }) {
  return (
    <View style={styles.estrelas}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          name={i < quantidade ? 'star' : 'star-outline'}
          size={13}
          color={cores.amarelo}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  caixa: {
    backgroundColor: cores.verde,
    borderRadius: raio.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  nota: { color: cores.textoInverso, fontWeight: '800', fontSize: 13 },
  total: { color: cores.textoSuave, fontSize: 12, fontWeight: '600' },
  estrelas: { flexDirection: 'row', gap: 1 },
});
