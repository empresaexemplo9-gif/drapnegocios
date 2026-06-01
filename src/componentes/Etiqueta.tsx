import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cores, raio } from '../tema';

interface Props {
  texto: string;
  cor?: string;
  corTexto?: string;
}

/** Selo/chip pequeno para destacar ofertas, tipos e estados. */
export function Etiqueta({ texto, cor = cores.amarelo, corTexto = cores.azulMarinho }: Props) {
  return (
    <View style={[styles.base, { backgroundColor: cor }]}>
      <Text style={[styles.texto, { color: corTexto }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: raio.pill,
    alignSelf: 'flex-start',
  },
  texto: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
});
