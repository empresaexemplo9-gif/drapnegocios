import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { cores, raio, sombra } from '../src/tema';
import { t } from '../src/i18n';
import { LogoMarca } from '../src/componentes';
import { empresa } from '../src/dados/empresa';

type Icone = keyof typeof Ionicons.glyphMap;

export default function Sobre() {
  return (
    <ScrollView style={styles.tela} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Stack.Screen options={{ title: t.sobre.titulo }} />

      <View style={styles.topo}>
        <LogoMarca tamanho={84} comTexto />
      </View>

      <Text style={styles.descricao}>{t.sobre.descricao}</Text>

      {/* Segurança */}
      <View style={styles.cartaoSeguranca}>
        <View style={styles.seguTopo}>
          <Ionicons name="shield-checkmark" size={24} color={cores.verde} />
          <Text style={styles.seguTitulo}>{t.seguranca.chamada}</Text>
        </View>
        <Text style={styles.seguTexto}>{t.seguranca.dados}</Text>
        <Text style={styles.seguTexto}>{t.seguranca.compra}</Text>
        <View style={styles.seguSelo}>
          <Ionicons name="checkmark-circle" size={18} color={cores.azul} />
          <Text style={styles.seguSeloTexto}>{t.seguranca.selo}</Text>
        </View>
        <Text style={styles.seguBancos}>{t.seguranca.bancos}</Text>
      </View>

      {/* Formas de pagamento */}
      <Text style={styles.secao}>{t.sobre.formasPagamento}</Text>
      <View style={styles.pagamentos}>
        {empresa.formasPagamento.map((f) => (
          <View key={f} style={styles.bandeira}>
            <Text style={styles.bandeiraTexto}>{f}</Text>
          </View>
        ))}
      </View>

      {/* Canais oficiais */}
      <Text style={styles.secao}>{t.sobre.canais}</Text>
      <View style={styles.grupo}>
        <Canal icone="globe-outline" rotulo={t.contato.site} valor={empresa.site} url={`https://${empresa.site}`} />
        <Canal icone="logo-whatsapp" rotulo={t.contato.whatsapp} valor={empresa.whatsapp} url={empresa.whatsappUrl} />
        <Canal icone="mail-outline" rotulo={t.contato.suporte} valor={empresa.emailSuporte} url={`mailto:${empresa.emailSuporte}`} />
        <Canal icone="shield-outline" rotulo={t.contato.juridico} valor={empresa.emailJuridico} url={`mailto:${empresa.emailJuridico}`} />
        <Canal icone="time-outline" rotulo={t.contato.atendimento} valor={empresa.atendimento} />
      </View>

      {/* Redes sociais */}
      <View style={styles.redes}>
        <Rede icone="logo-instagram" url={empresa.redes.instagram} />
        <Rede icone="logo-facebook" url={empresa.redes.facebook} />
        <Rede icone="logo-youtube" url={empresa.redes.youtube} />
        <Rede icone="logo-whatsapp" url={empresa.whatsappUrl} />
      </View>

      {/* Dados da empresa */}
      <View style={styles.empresaBox}>
        <Text style={styles.empresaNome}>{empresa.razaoSocial}</Text>
        <Text style={styles.empresaLinha}>{t.sobre.cnpj}: {empresa.cnpj}</Text>
        <Text style={styles.empresaLinha}>{empresa.cadastur}</Text>
        <Text style={styles.empresaLinha}>
          {t.sobre.versao} {Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
        <Text style={styles.copyright}>© 2026 ViajeBrasil. Todos os direitos reservados.</Text>
      </View>
    </ScrollView>
  );
}

function Canal({ icone, rotulo, valor, url }: { icone: Icone; rotulo: string; valor: string; url?: string }) {
  return (
    <Pressable style={styles.canal} onPress={url ? () => Linking.openURL(url) : undefined} disabled={!url}>
      <Ionicons name={icone} size={20} color={cores.azul} />
      <View style={{ flex: 1 }}>
        <Text style={styles.canalRotulo}>{rotulo}</Text>
        <Text style={styles.canalValor}>{valor}</Text>
      </View>
      {url && <Ionicons name="open-outline" size={16} color={cores.textoClaro} />}
    </Pressable>
  );
}

function Rede({ icone, url }: { icone: Icone; url: string }) {
  return (
    <Pressable style={styles.rede} onPress={() => Linking.openURL(url)}>
      <Ionicons name={icone} size={22} color={cores.azulMarinho} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  topo: { alignItems: 'center', paddingVertical: 12 },
  descricao: { fontSize: 15, color: cores.textoSuave, lineHeight: 22, fontWeight: '500', textAlign: 'center' },
  cartaoSeguranca: {
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    padding: 18,
    marginTop: 20,
    gap: 10,
    ...sombra,
  },
  seguTopo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  seguTitulo: { flex: 1, fontSize: 16, fontWeight: '800', color: cores.azulMarinho },
  seguTexto: { fontSize: 13, color: cores.textoSuave, lineHeight: 20, fontWeight: '500' },
  seguSelo: { flexDirection: 'row', gap: 8, backgroundColor: '#EAF3FB', padding: 12, borderRadius: raio.md, alignItems: 'center' },
  seguSeloTexto: { flex: 1, fontSize: 13, fontWeight: '700', color: cores.azulMarinho },
  seguBancos: { fontSize: 12, color: cores.textoClaro, fontWeight: '600' },
  secao: { fontSize: 16, fontWeight: '800', color: cores.azulMarinho, marginTop: 24, marginBottom: 12 },
  pagamentos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bandeira: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bandeiraTexto: { fontWeight: '800', color: cores.azulMarinho, fontSize: 13 },
  grupo: { backgroundColor: cores.superficie, borderRadius: raio.lg, overflow: 'hidden', ...sombra },
  canal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.borda,
  },
  canalRotulo: { fontSize: 12, color: cores.textoSuave, fontWeight: '700' },
  canalValor: { fontSize: 14, color: cores.azulMarinho, fontWeight: '700' },
  redes: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 24 },
  rede: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empresaBox: { alignItems: 'center', marginTop: 28, gap: 4 },
  empresaNome: { fontWeight: '800', color: cores.azulMarinho, fontSize: 14 },
  empresaLinha: { fontSize: 12, color: cores.textoSuave, fontWeight: '600', textAlign: 'center' },
  copyright: { fontSize: 11, color: cores.textoClaro, marginTop: 8, fontWeight: '600' },
});
