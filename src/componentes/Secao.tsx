import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores } from '../tema';
import { t } from '../i18n';

interface Props {
  titulo: string;
  aoVerTudo?: () => void;
}

/** Cabeçalho de seção com link opcional "Ver tudo". */
export function TituloSecao({ titulo, aoVerTudo }: Props) {
  return (
    <View style={styles.linha}>
      <Text style={styles.titulo}>{titulo}</Text>
      {aoVerTudo && (
        <Pressable onPress={aoVerTudo} hitSlop={8}>
          <Text style={styles.link}>{t.inicio.verTudo}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 24,
  },
  titulo: { fontSize: 19, fontWeight: '800', color: cores.azulMarinho },
  link: { fontSize: 14, fontWeight: '700', color: cores.azul },
});
