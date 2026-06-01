import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { cores, raio, sombra } from '../tema';
import { Etiqueta } from './Etiqueta';
import type { BannerOferta } from '../tipos';

const LARGURA = Dimensions.get('window').width;
const MARGEM = 16;
const LARGURA_CARTAO = LARGURA - MARGEM * 2;

interface Props {
  banners: BannerOferta[];
  aoTocar: (banner: BannerOferta) => void;
}

/**
 * Carrossel de ofertas em destaque da tela inicial, com troca automática
 * e indicadores — inspirado no banner rotativo do app da Decolar.
 */
export function CarrosselOfertas({ banners, aoTocar }: Props) {
  const [indice, setIndice] = useState(0);
  const refLista = useRef<FlatList<BannerOferta>>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndice((atual) => {
        const proximo = (atual + 1) % banners.length;
        refLista.current?.scrollToOffset({ offset: proximo * LARGURA, animated: true });
        return proximo;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const aoRolar = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / LARGURA);
    if (i !== indice) setIndice(i);
  };

  return (
    <View>
      <FlatList
        ref={refLista}
        data={banners}
        keyExtractor={(b) => b.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={aoRolar}
        renderItem={({ item }) => (
          <Pressable
            style={styles.slide}
            onPress={() => aoTocar(item)}
          >
            <ImageBackground
              source={{ uri: item.imagem }}
              style={styles.imagem}
              imageStyle={styles.imagemRadius}
            >
              <View style={styles.overlay} />
              <View style={styles.conteudo}>
                <Etiqueta texto={item.selo} cor={cores.amarelo} />
                <Text style={styles.titulo}>{item.titulo}</Text>
                <Text style={styles.subtitulo}>{item.subtitulo}</Text>
              </View>
            </ImageBackground>
          </Pressable>
        )}
      />
      <View style={styles.pontos}>
        {banners.map((b, i) => (
          <View
            key={b.id}
            style={[styles.ponto, i === indice && styles.pontoAtivo]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: { width: LARGURA, paddingHorizontal: MARGEM },
  imagem: {
    width: LARGURA_CARTAO,
    height: 180,
    justifyContent: 'flex-end',
    ...sombra,
  },
  imagemRadius: { borderRadius: raio.lg },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(21,49,94,0.35)',
    borderRadius: raio.lg,
  },
  conteudo: { padding: 18, gap: 4 },
  titulo: { color: cores.textoInverso, fontSize: 22, fontWeight: '800' },
  subtitulo: { color: cores.textoInverso, fontSize: 14, fontWeight: '600', opacity: 0.95 },
  pontos: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  ponto: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: cores.borda,
  },
  pontoAtivo: { backgroundColor: cores.azul, width: 20 },
});
