import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, sombra } from '../src/tema';
import { t } from '../src/i18n';
import { Botao } from '../src/componentes';
import { useCarrinho } from '../src/contextos/CarrinhoContext';
import { abrirCheckoutOficial } from '../src/servicos';

/**
 * Encaminhamento ao checkout oficial.
 *
 * A compra é concluída no site oficial da ViajeBrasil (canal próprio que
 * opera a Buson por trás). O app não coleta pagamento nem reproduz o sistema
 * do parceiro — apenas leva o cliente final até o checkout oficial.
 */
export default function Checkout() {
  const { itens, total } = useCarrinho();
  const [abrindo, setAbrindo] = useState(false);
  const vazio = itens.length === 0;

  const continuar = async () => {
    setAbrindo(true);
    try {
      await abrirCheckoutOficial();
    } finally {
      setAbrindo(false);
    }
  };

  return (
    <View style={styles.tela}>
      <Stack.Screen options={{ title: t.checkout.titulo }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Encaminhamento ao site oficial */}
        <View style={styles.handoff}>
          <View style={styles.handoffIcone}>
            <Ionicons name="shield-checkmark" size={26} color={cores.verde} />
          </View>
          <Text style={styles.handoffTitulo}>{t.checkout.handoffTitulo}</Text>
          <Text style={styles.handoffTexto}>{t.checkout.handoffTexto}</Text>
        </View>

        {/* Resumo */}
        <Text style={styles.secao}>{t.checkout.resumo}</Text>
        <View style={styles.resumo}>
          {vazio ? (
            <Text style={styles.vazio}>{t.checkout.carrinhoVazio}</Text>
          ) : (
            <>
              {itens.map((i) => (
                <View key={i.chave} style={styles.resumoLinha}>
                  <Text style={styles.resumoItem} numberOfLines={1}>{i.titulo}</Text>
                  <Text style={styles.resumoValor}>{t.comum.reais(i.preco)}</Text>
                </View>
              ))}
              <View style={styles.divisor} />
              <View style={styles.resumoLinha}>
                <Text style={styles.totalRotulo}>{t.reservas.total}</Text>
                <Text style={styles.totalValor}>{t.comum.reais(total)}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.seguranca}>
          <Ionicons name="lock-closed" size={16} color={cores.verde} />
          <Text style={styles.segurancaTexto}>{t.checkout.formasNoSite}</Text>
        </View>
      </ScrollView>

      <View style={styles.rodape}>
        <Botao
          titulo={abrindo ? t.checkout.abrindo : t.checkout.continuarSite}
          aoPressionar={continuar}
          carregando={abrindo}
          desabilitado={vazio}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  secao: { fontSize: 16, fontWeight: '800', color: cores.azulMarinho, marginTop: 20, marginBottom: 12 },
  handoff: {
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 20,
    alignItems: 'center',
    ...sombra,
  },
  handoffIcone: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: '#EAF7EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  handoffTitulo: { fontSize: 18, fontWeight: '800', color: cores.azulMarinho, textAlign: 'center' },
  handoffTexto: {
    fontSize: 14,
    color: cores.textoSuave,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
  },
  resumo: { backgroundColor: cores.superficie, borderRadius: raio.lg, padding: 16, gap: 10, ...sombra },
  resumoLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  resumoItem: { flex: 1, fontSize: 14, color: cores.texto, fontWeight: '600' },
  resumoValor: { fontSize: 14, fontWeight: '700', color: cores.azulMarinho },
  vazio: { fontSize: 14, color: cores.textoSuave, fontWeight: '600', textAlign: 'center', paddingVertical: 4 },
  divisor: { height: 1, backgroundColor: cores.borda },
  totalRotulo: { fontSize: 16, fontWeight: '800', color: cores.azulMarinho },
  totalValor: { fontSize: 20, fontWeight: '800', color: cores.verde },
  seguranca: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, paddingHorizontal: 4 },
  segurancaTexto: { flex: 1, fontSize: 12, color: cores.textoSuave, fontWeight: '600' },
  rodape: {
    backgroundColor: cores.superficie,
    padding: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
});
