import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { cores, raio, tipografia } from '../tema';

interface Props {
  titulo: string;
  aoPressionar: () => void;
  variante?: 'primario' | 'secundario' | 'contorno';
  carregando?: boolean;
  desabilitado?: boolean;
  estilo?: StyleProp<ViewStyle>;
}

export function Botao({
  titulo,
  aoPressionar,
  variante = 'primario',
  carregando = false,
  desabilitado = false,
  estilo,
}: Props) {
  const inativo = desabilitado || carregando;
  return (
    <Pressable
      onPress={aoPressionar}
      disabled={inativo}
      style={({ pressed }) => [
        styles.base,
        variante === 'primario' && styles.primario,
        variante === 'secundario' && styles.secundario,
        variante === 'contorno' && styles.contorno,
        pressed && !inativo && styles.pressionado,
        inativo && styles.inativo,
        estilo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={variante === 'contorno' ? cores.azul : cores.textoInverso} />
      ) : (
        <Text
          style={[
            styles.texto,
            variante === 'contorno' && { color: cores.azul },
            variante === 'secundario' && { color: cores.azulMarinho },
          ]}
        >
          {titulo}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: raio.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primario: { backgroundColor: cores.azul },
  secundario: { backgroundColor: cores.amarelo },
  contorno: { backgroundColor: cores.transparente, borderWidth: 1.5, borderColor: cores.azul },
  pressionado: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  inativo: { opacity: 0.5 },
  texto: { ...tipografia.secao, color: cores.textoInverso },
});
