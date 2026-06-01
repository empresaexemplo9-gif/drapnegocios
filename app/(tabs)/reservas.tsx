import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, sombra } from '../../src/tema';
import { t } from '../../src/i18n';
import { Botao } from '../../src/componentes';
import { useCarrinho } from '../../src/contextos/CarrinhoContext';
import { categoriasInfo } from '../../src/componentes/SeletorCategorias';

export default function Reservas() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { itens, total, remover } = useCarrinho();

  return (
    <View style={styles.tela}>
      <View style={[styles.cabecalho, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.titulo}>{t.reservas.titulo}</Text>
        {itens.length > 0 && (
          <Text style={styles.subtitulo}>{t.reservas.itens(itens.length)}</Text>
        )}
      </View>

      {itens.length === 0 ? (
        <View style={styles.vazio}>
          <Ionicons name="bookmark-outline" size={56} color={cores.textoClaro} />
          <Text style={styles.vazioTitulo}>{t.reservas.vazio}</Text>
          <Text style={styles.vazioTexto}>{t.reservas.vazioDica}</Text>
          <Botao
            titulo={t.reservas.explorar}
            aoPressionar={() => router.push('/')}
            variante="contorno"
            estilo={{ marginTop: 12 }}
          />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
            {itens.map((item) => {
              const info = categoriasInfo.find((c) => c.id === item.categoria);
              return (
                <View key={item.chave} style={styles.item}>
                  <View style={styles.itemIcone}>
                    <Ionicons name={info?.icone ?? 'pricetag'} size={20} color={cores.azul} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemCategoria}>{info?.rotulo}</Text>
                    <Text style={styles.itemTitulo}>{item.titulo}</Text>
                    <Text style={styles.itemSubtitulo}>{item.subtitulo}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.itemPreco}>{t.comum.reais(item.preco)}</Text>
                    <Pressable onPress={() => remover(item.chave)} hitSlop={8}>
                      <Text style={styles.remover}>{t.reservas.remover}</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.rodape}>
            <View style={styles.totalLinha}>
              <Text style={styles.totalRotulo}>{t.reservas.total}</Text>
              <Text style={styles.totalValor}>{t.comum.reais(total)}</Text>
            </View>
            <Botao titulo={t.reservas.finalizar} aoPressionar={() => router.push('/checkout')} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: { backgroundColor: cores.azulMarinho, paddingHorizontal: 16, paddingBottom: 16 },
  titulo: { color: cores.textoInverso, fontSize: 24, fontWeight: '800' },
  subtitulo: { color: cores.textoInverso, opacity: 0.85, marginTop: 2, fontWeight: '600' },
  vazio: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  vazioTitulo: { fontSize: 18, fontWeight: '800', color: cores.azulMarinho, marginTop: 8 },
  vazioTexto: { fontSize: 14, color: cores.textoSuave, textAlign: 'center', fontWeight: '500' },
  lista: { padding: 16, gap: 12 },
  item: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    padding: 14,
    ...sombra,
  },
  itemIcone: {
    width: 40,
    height: 40,
    borderRadius: raio.md,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCategoria: { fontSize: 11, fontWeight: '800', color: cores.azul, textTransform: 'uppercase' },
  itemTitulo: { fontSize: 15, fontWeight: '800', color: cores.azulMarinho, marginTop: 2 },
  itemSubtitulo: { fontSize: 13, color: cores.textoSuave, fontWeight: '600' },
  itemPreco: { fontSize: 16, fontWeight: '800', color: cores.verde },
  remover: { fontSize: 12, color: cores.erro, fontWeight: '700', marginTop: 6 },
  rodape: {
    backgroundColor: cores.superficie,
    padding: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    gap: 12,
  },
  totalLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalRotulo: { fontSize: 16, fontWeight: '700', color: cores.azulMarinho },
  totalValor: { fontSize: 24, fontWeight: '800', color: cores.verde },
});
