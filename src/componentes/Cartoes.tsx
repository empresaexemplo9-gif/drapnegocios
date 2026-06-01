import React from 'react';
import {
  ImageBackground,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, sombra } from '../tema';
import { t } from '../i18n';
import { NotaAvaliacao } from './Avaliacao';
import type { Destino, PacoteTurismo } from '../tipos';

/** Cartão de destino popular (carrossel horizontal da tela inicial). */
export function CartaoDestino({ destino, aoTocar }: { destino: Destino; aoTocar: () => void }) {
  return (
    <Pressable style={destinoStyle.cartao} onPress={aoTocar}>
      <ImageBackground
        source={{ uri: destino.imagem }}
        style={destinoStyle.imagem}
        imageStyle={{ borderRadius: raio.lg }}
      >
        <View style={destinoStyle.overlay} />
        <View style={destinoStyle.conteudo}>
          <Text style={destinoStyle.cidade}>{destino.cidade}</Text>
          <Text style={destinoStyle.uf}>{destino.uf}</Text>
        </View>
      </ImageBackground>
      <Text style={destinoStyle.preco}>
        {t.inicio.aPartirDe} {t.comum.reais(destino.precoMin)}
      </Text>
    </Pressable>
  );
}

const destinoStyle = StyleSheet.create({
  cartao: { width: 150, marginRight: 12 },
  imagem: { height: 180, justifyContent: 'flex-end' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(21,49,94,0.25)',
    borderRadius: raio.lg,
  },
  conteudo: { padding: 12 },
  cidade: { color: cores.textoInverso, fontSize: 16, fontWeight: '800' },
  uf: { color: cores.textoInverso, fontSize: 12, fontWeight: '600', opacity: 0.9 },
  preco: { marginTop: 8, color: cores.azulMarinho, fontWeight: '700', fontSize: 13 },
});

/** Cartão de pacote turístico (carrossel "Pacotes imperdíveis"). */
export function CartaoPacote({ pacote, aoTocar }: { pacote: PacoteTurismo; aoTocar: () => void }) {
  return (
    <Pressable style={pacoteStyle.cartao} onPress={aoTocar}>
      <Image source={{ uri: pacote.imagem }} style={pacoteStyle.imagem} />
      <View style={pacoteStyle.corpo}>
        <Text style={pacoteStyle.titulo} numberOfLines={1}>{pacote.titulo}</Text>
        <View style={pacoteStyle.local}>
          <Ionicons name="location-outline" size={13} color={cores.textoSuave} />
          <Text style={pacoteStyle.localTexto}>
            {pacote.destino}, {pacote.uf} · {t.detalhe.diasNoites(pacote.dias)}
          </Text>
        </View>
        <NotaAvaliacao nota={pacote.avaliacao} />
        <Text style={pacoteStyle.preco}>
          {t.comum.reais(pacote.preco)}{' '}
          <Text style={pacoteStyle.porPessoa}>{t.resultados.porPessoa}</Text>
        </Text>
      </View>
    </Pressable>
  );
}

const pacoteStyle = StyleSheet.create({
  cartao: {
    width: 230,
    marginRight: 12,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    overflow: 'hidden',
    ...sombra,
  },
  imagem: { height: 130, width: '100%' },
  corpo: { padding: 12, gap: 6 },
  titulo: { fontSize: 16, fontWeight: '800', color: cores.azulMarinho },
  local: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  localTexto: { color: cores.textoSuave, fontSize: 12, fontWeight: '600' },
  preco: { color: cores.azulMarinho, fontSize: 18, fontWeight: '800', marginTop: 2 },
  porPessoa: { fontSize: 12, fontWeight: '600', color: cores.textoSuave },
});
