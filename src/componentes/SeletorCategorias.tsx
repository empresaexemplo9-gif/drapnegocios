import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio } from '../tema';
import { t } from '../i18n';
import type { Categoria } from '../tipos';

type Icone = keyof typeof Ionicons.glyphMap;

export const categoriasInfo: { id: Categoria; rotulo: string; icone: Icone }[] = [
  { id: 'aereo', rotulo: t.categorias.aereo, icone: 'airplane' },
  { id: 'onibus', rotulo: t.categorias.onibus, icone: 'bus' },
  { id: 'hospedagem', rotulo: t.categorias.hospedagem, icone: 'bed' },
  { id: 'turismo', rotulo: t.categorias.turismo, icone: 'briefcase' },
  { id: 'locacao', rotulo: t.categorias.locacao, icone: 'car-sport' },
  { id: 'seguro', rotulo: t.categorias.seguro, icone: 'shield-checkmark' },
];

interface Props {
  selecionada: Categoria;
  aoSelecionar: (c: Categoria) => void;
}

/** Barra de categorias no topo da busca (Voos, Hospedagem, Pacotes, Ônibus). */
export function SeletorCategorias({ selecionada, aoSelecionar }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.lista}
    >
      {categoriasInfo.map((c) => {
        const ativo = c.id === selecionada;
        return (
          <Pressable
            key={c.id}
            onPress={() => aoSelecionar(c.id)}
            style={[styles.item, ativo && styles.itemAtivo]}
          >
            <Ionicons
              name={c.icone}
              size={18}
              color={ativo ? cores.textoInverso : cores.azul}
            />
            <Text style={[styles.rotulo, ativo && styles.rotuloAtivo]}>{c.rotulo}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  lista: { gap: 8, paddingHorizontal: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: raio.pill,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  itemAtivo: { backgroundColor: cores.azul, borderColor: cores.azul },
  rotulo: { color: cores.azul, fontWeight: '700', fontSize: 14 },
  rotuloAtivo: { color: cores.textoInverso },
});

/** Grade de atalhos por categoria usada na tela inicial. */
export function GradeCategorias({ aoSelecionar }: { aoSelecionar: (c: Categoria) => void }) {
  return (
    <View style={grade.container}>
      {categoriasInfo.map((c) => (
        <Pressable key={c.id} style={grade.item} onPress={() => aoSelecionar(c.id)}>
          <View style={grade.icone}>
            <Ionicons name={c.icone} size={24} color={cores.azul} />
          </View>
          <Text style={grade.rotulo}>{c.rotulo}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const grade = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 16,
    paddingHorizontal: 16,
  },
  item: { alignItems: 'center', gap: 8, width: '25%' },
  icone: {
    width: 56,
    height: 56,
    borderRadius: raio.lg,
    backgroundColor: cores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: cores.borda,
  },
  rotulo: { fontSize: 12, fontWeight: '700', color: cores.azulMarinho },
});
