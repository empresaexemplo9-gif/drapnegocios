import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, sombra } from '../src/tema';
import { t } from '../src/i18n';
import { abrirBuscaOnibus } from '../src/servicos';

export default function Onibus() {
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [dataIda, setDataIda] = useState('');
  const [dataVolta, setDataVolta] = useState('');
  const [somenteIda, setSomenteIda] = useState(false);
  const [passageiros, setPassageiros] = useState(1);

  const inverter = () => {
    setOrigem(destino);
    setDestino(origem);
  };

  const buscar = () => {
    void abrirBuscaOnibus({
      origem,
      destino,
      dataIda,
      dataVolta: somenteIda ? undefined : dataVolta,
      passageiros: String(passageiros),
    });
  };

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
      <View style={styles.intro}>
        <View style={styles.introIcone}>
          <Ionicons name="bus" size={24} color={cores.textoInverso} />
        </View>
        <Text style={styles.introTitulo}>{t.onibus.titulo}</Text>
        <Text style={styles.introSub}>{t.onibus.subtitulo}</Text>
      </View>

      <View style={styles.card}>
        <Campo
          icone="radio-button-on-outline"
          rotulo={t.onibus.origem}
          placeholder={t.onibus.origemPh}
          valor={origem}
          aoMudar={setOrigem}
        />
        <Pressable style={styles.inverter} onPress={inverter} hitSlop={8} accessibilityLabel={t.onibus.inverter}>
          <Ionicons name="swap-vertical" size={18} color={cores.verde} />
        </Pressable>
        <Campo
          icone="location-outline"
          rotulo={t.onibus.destino}
          placeholder={t.onibus.destinoPh}
          valor={destino}
          aoMudar={setDestino}
        />

        <View style={styles.datas}>
          <Campo
            icone="calendar-outline"
            rotulo={t.onibus.dataIda}
            placeholder={t.onibus.dataPh}
            valor={dataIda}
            aoMudar={setDataIda}
            flex
          />
          {!somenteIda && (
            <Campo
              icone="calendar-outline"
              rotulo={t.onibus.dataVolta}
              placeholder={t.onibus.dataPh}
              valor={dataVolta}
              aoMudar={setDataVolta}
              flex
            />
          )}
        </View>

        <Pressable style={styles.check} onPress={() => setSomenteIda((v) => !v)}>
          <Ionicons name={somenteIda ? 'checkbox' : 'square-outline'} size={20} color={cores.verde} />
          <Text style={styles.checkTexto}>{t.onibus.somenteIda}</Text>
        </Pressable>

        <View style={styles.passLinha}>
          <View style={styles.passInfo}>
            <Ionicons name="people-outline" size={20} color={cores.verde} />
            <Text style={styles.passTexto}>{t.onibus.passageiros}</Text>
          </View>
          <View style={styles.stepper}>
            <Pressable
              style={styles.stepBtn}
              onPress={() => setPassageiros((n) => Math.max(1, n - 1))}
              hitSlop={6}
            >
              <Ionicons name="remove" size={18} color={cores.azulMarinho} />
            </Pressable>
            <Text style={styles.stepNum}>{passageiros}</Text>
            <Pressable
              style={styles.stepBtn}
              onPress={() => setPassageiros((n) => Math.min(9, n + 1))}
              hitSlop={6}
            >
              <Ionicons name="add" size={18} color={cores.azulMarinho} />
            </Pressable>
          </View>
        </View>
      </View>

      <Pressable style={styles.botao} onPress={buscar}>
        <Ionicons name="search" size={18} color={cores.textoInverso} />
        <Text style={styles.botaoTexto}>{t.onibus.buscar}</Text>
      </Pressable>

      <View style={styles.aviso}>
        <Ionicons name="shield-checkmark" size={16} color={cores.verde} />
        <Text style={styles.avisoTexto}>{t.onibus.aviso}</Text>
      </View>
    </ScrollView>
  );
}

function Campo({
  icone,
  rotulo,
  placeholder,
  valor,
  aoMudar,
  flex,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  placeholder: string;
  valor: string;
  aoMudar: (v: string) => void;
  flex?: boolean;
}) {
  return (
    <View style={[styles.campo, flex && { flex: 1 }]}>
      <Ionicons name={icone} size={20} color={cores.verde} />
      <View style={{ flex: 1 }}>
        <Text style={styles.campoRotulo}>{rotulo}</Text>
        <TextInput
          style={styles.campoInput}
          placeholder={placeholder}
          placeholderTextColor={cores.textoClaro}
          value={valor}
          onChangeText={aoMudar}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, gap: 16 },
  intro: { alignItems: 'center', gap: 6, paddingTop: 8 },
  introIcone: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: cores.verde,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  introTitulo: { fontSize: 22, fontWeight: '800', color: cores.azulMarinho },
  introSub: { fontSize: 14, color: cores.textoSuave, textAlign: 'center', fontWeight: '500' },

  card: { backgroundColor: cores.superficie, borderRadius: raio.lg, padding: 16, gap: 12, ...sombra },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.fundo,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  campoRotulo: { fontSize: 12, color: cores.textoSuave, fontWeight: '700' },
  campoInput: { fontSize: 16, color: cores.azulMarinho, fontWeight: '700', padding: 0 },
  inverter: {
    position: 'absolute',
    right: 28,
    top: 52,
    zIndex: 2,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 999,
    padding: 8,
  },
  datas: { flexDirection: 'row', gap: 12 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2 },
  checkTexto: { color: cores.azulMarinho, fontWeight: '600', fontSize: 14 },
  passLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  passInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  passTexto: { color: cores.azulMarinho, fontWeight: '700', fontSize: 15 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: cores.borda,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { fontSize: 17, fontWeight: '800', color: cores.azulMarinho, minWidth: 20, textAlign: 'center' },

  botao: {
    backgroundColor: cores.verde,
    borderRadius: raio.md,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...sombra,
  },
  botaoTexto: { color: cores.textoInverso, fontWeight: '800', fontSize: 16 },
  aviso: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  avisoTexto: { color: cores.textoSuave, fontSize: 12, fontWeight: '600' },
});
