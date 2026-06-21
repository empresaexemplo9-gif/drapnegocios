import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, sombra } from '../../src/tema';
import { t } from '../../src/i18n';
import { LogoMarca } from '../../src/componentes';
import { abrirWhiteLabel } from '../../src/servicos';

/** Roxo do card "Corporativo" (apenas nesta vitrine, fora da paleta base). */
const ROXO = '#6D4FB0';

type Card = {
  chave: string;
  emoji: string;
  titulo: string;
  sub: string;
  cor: string;
  selecionado?: boolean;
  emBreve?: boolean;
};

const CARDS: Card[] = [
  {
    chave: 'onibus',
    emoji: '🚌',
    titulo: t.vitrine.onibusTitulo,
    sub: t.vitrine.onibusSub,
    cor: cores.verde,
    selecionado: true,
  },
  {
    chave: 'aereo',
    emoji: '✈️',
    titulo: t.vitrine.aereoTitulo,
    sub: t.vitrine.aereoSub,
    cor: cores.azul,
  },
  {
    chave: 'corporativo',
    emoji: '💼',
    titulo: t.vitrine.corporativoTitulo,
    sub: t.vitrine.corporativoSub,
    cor: ROXO,
  },
  {
    chave: 'hospedagem',
    emoji: '🏨',
    titulo: t.vitrine.hospedagemTitulo,
    sub: t.vitrine.hospedagemSub,
    cor: cores.laranja,
    emBreve: true,
  },
];

export default function Inicio() {
  const insets = useSafeAreaInsets();
  const alturaBarra = useBottomTabBarHeight();

  return (
    <View style={styles.tela}>
      {/* Cabeçalho */}
      <View style={[styles.cabecalho, { paddingTop: insets.top + 10 }]}>
        <View style={styles.marcaArea}>
          <LogoMarca tamanho={40} />
          <Text style={styles.marca}>
            <Text style={{ color: cores.textoInverso }}>viaje</Text>
            <Text style={{ color: cores.verde }}>brasil</Text>
          </Text>
        </View>
        <View style={styles.acoesTopo}>
          <Pressable style={styles.faleConosco} onPress={() => abrirWhiteLabel('contato')} hitSlop={6}>
            <Ionicons name="call" size={18} color={cores.textoInverso} />
            <Text style={styles.faleConoscoTexto}>{t.vitrine.faleConosco}</Text>
          </Pressable>
          <Pressable onPress={() => abrirWhiteLabel()} hitSlop={8}>
            <Ionicons name="menu" size={28} color={cores.textoInverso} />
          </Pressable>
        </View>
      </View>

      {/* Aba "Passagens" */}
      <View style={styles.aba}>
        <View style={styles.abaItem}>
          <Ionicons name="briefcase" size={20} color={cores.verde} />
          <Text style={styles.abaTexto}>{t.vitrine.passagens}</Text>
        </View>
        <View style={styles.abaSublinha} />
      </View>

      <ScrollView
        style={styles.fundo}
        contentContainerStyle={{ padding: 16, paddingBottom: alturaBarra + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pergunta}>
          <Text style={{ color: cores.azulMarinho }}>{t.vitrine.perguntaA}</Text>
          <Text style={{ color: cores.verde }}>{t.vitrine.perguntaB}</Text>
        </Text>

        <View style={styles.grade}>
          {CARDS.map((c) => (
            <Pressable
              key={c.chave}
              style={[
                styles.card,
                c.selecionado && { borderColor: cores.verde, borderWidth: 2 },
                c.emBreve && { opacity: 0.85 },
              ]}
              disabled={c.emBreve}
              onPress={() => abrirWhiteLabel(c.chave)}
            >
              <View style={styles.cardTopo}>
                <Text style={styles.cardEmoji}>{c.emoji}</Text>
                {c.selecionado && (
                  <Ionicons name="checkmark-circle" size={24} color={cores.verde} />
                )}
              </View>
              <View style={styles.cardTituloLinha}>
                <Text style={[styles.cardTitulo, { color: c.cor }]}>{c.titulo}</Text>
                {c.emBreve && (
                  <View style={styles.emBreve}>
                    <Text style={styles.emBreveTexto}>{t.vitrine.emBreve}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardSub}>{c.sub}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.azulMarinho },
  fundo: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: {
    backgroundColor: cores.azulMarinho,
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marcaArea: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  marca: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  acoesTopo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  faleConosco: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  faleConoscoTexto: { color: cores.textoInverso, fontWeight: '700', fontSize: 14 },
  aba: {
    backgroundColor: cores.superficie,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  abaItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 10 },
  abaTexto: { color: cores.azulMarinho, fontWeight: '800', fontSize: 18 },
  abaSublinha: {
    height: 3,
    width: 120,
    backgroundColor: cores.verde,
    borderRadius: 999,
  },
  pergunta: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 34,
  },
  grade: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 },
  card: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 16,
    minHeight: 170,
    ...sombra,
  },
  cardTopo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardEmoji: { fontSize: 34 },
  cardTituloLinha: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  cardTitulo: { fontSize: 18, fontWeight: '800' },
  cardSub: { color: cores.textoSuave, fontSize: 14, marginTop: 6, fontWeight: '500', lineHeight: 19 },
  emBreve: {
    backgroundColor: cores.laranja,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  emBreveTexto: { color: cores.textoInverso, fontSize: 12, fontWeight: '800' },
});
