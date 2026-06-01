import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

// Logo oficial da ViajeBrasil (círculo com cantos transparentes). A própria
// imagem já traz o wordmark "viajebrasil" e o slogan "Realizando Sonhos".
const LOGO = require('../../assets/logo.png');

interface Props {
  /** Diâmetro do brasão. */
  tamanho?: number;
  /**
   * Mantidos por compatibilidade com as telas. A imagem oficial já inclui o
   * wordmark e o slogan, então não renderizamos texto adicional.
   */
  comTexto?: boolean;
  claro?: boolean;
}

export function LogoMarca({ tamanho = 72 }: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={LOGO}
        style={{ width: tamanho, height: tamanho }}
        resizeMode="contain"
        accessibilityLabel="ViajeBrasil — Realizando Sonhos"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
