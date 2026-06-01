import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio } from '../../src/tema';
import { t } from '../../src/i18n';
import { Botao, SeletorCategorias } from '../../src/componentes';
import type { Categoria } from '../../src/tipos';

export default function Buscar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ categoria?: Categoria }>();

  const [categoria, setCategoria] = useState<Categoria>(params.categoria ?? 'aereo');
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [somenteIda, setSomenteIda] = useState(false);

  const usaOrigem = categoria === 'aereo' || categoria === 'onibus';
  const rotuloDestino =
    categoria === 'hospedagem' ? t.busca.cidadeHospedagem : t.busca.cidadeDestino;

  const inverter = () => {
    setOrigem(destino);
    setDestino(origem);
  };

  const buscar = () => {
    router.push({
      pathname: '/resultados',
      params: { categoria, origem, destino },
    });
  };

  return (
    <View style={styles.tela}>
      <View style={[styles.cabecalho, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.titulo}>{t.abas.buscar}</Text>
      </View>

      <View style={styles.seletor}>
        <SeletorCategorias selecionada={categoria} aoSelecionar={setCategoria} />
      </View>

      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <View style={styles.formulario}>
          {usaOrigem && (
            <>
              <Campo
                icone="radio-button-on-outline"
                rotulo={t.busca.origem}
                placeholder={t.busca.cidadeOrigem}
                valor={origem}
                aoMudar={setOrigem}
              />
              <Pressable style={styles.inverter} onPress={inverter} hitSlop={8}>
                <Ionicons name="swap-vertical" size={18} color={cores.azul} />
              </Pressable>
            </>
          )}
          <Campo
            icone="location-outline"
            rotulo={t.busca.destino}
            placeholder={rotuloDestino}
            valor={destino}
            aoMudar={setDestino}
          />

          <View style={styles.datas}>
            <CampoData rotulo={t.busca.dataIda} valor="Sex, 12 jun" />
            {!somenteIda && categoria !== 'turismo' && (
              <CampoData rotulo={t.busca.dataVolta} valor="Dom, 14 jun" />
            )}
          </View>

          {usaOrigem && (
            <Pressable
              style={styles.checkbox}
              onPress={() => setSomenteIda((v) => !v)}
            >
              <Ionicons
                name={somenteIda ? 'checkbox' : 'square-outline'}
                size={20}
                color={cores.azul}
              />
              <Text style={styles.checkboxTexto}>{t.busca.somenteIda}</Text>
            </Pressable>
          )}

          <CampoData
            rotulo={categoria === 'hospedagem' ? t.busca.hospedes : t.busca.passageiros}
            valor="2 adultos"
            icone="people-outline"
          />
        </View>

        <Botao titulo={t.busca.buscar} aoPressionar={buscar} estilo={{ marginTop: 8 }} />
      </ScrollView>
    </View>
  );
}

function Campo({
  icone,
  rotulo,
  placeholder,
  valor,
  aoMudar,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  placeholder: string;
  valor: string;
  aoMudar: (v: string) => void;
}) {
  return (
    <View style={styles.campo}>
      <Ionicons name={icone} size={20} color={cores.azul} />
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

function CampoData({
  rotulo,
  valor,
  icone = 'calendar-outline',
}: {
  rotulo: string;
  valor: string;
  icone?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable style={[styles.campo, { flex: 1 }]}>
      <Ionicons name={icone} size={20} color={cores.azul} />
      <View>
        <Text style={styles.campoRotulo}>{rotulo}</Text>
        <Text style={styles.campoValor}>{valor}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: {
    backgroundColor: cores.azulMarinho,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  titulo: { color: cores.textoInverso, fontSize: 24, fontWeight: '800' },
  seletor: { backgroundColor: cores.azulMarinho, paddingBottom: 16 },
  conteudo: { padding: 16 },
  formulario: { gap: 12, marginBottom: 8 },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.superficie,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  campoRotulo: { fontSize: 12, color: cores.textoSuave, fontWeight: '700' },
  campoInput: { fontSize: 16, color: cores.azulMarinho, fontWeight: '700', padding: 0 },
  campoValor: { fontSize: 16, color: cores.azulMarinho, fontWeight: '700' },
  inverter: {
    position: 'absolute',
    right: 24,
    top: 44,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 999,
    padding: 8,
    zIndex: 2,
  },
  datas: { flexDirection: 'row', gap: 12 },
  checkbox: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  checkboxTexto: { color: cores.azulMarinho, fontWeight: '600', fontSize: 14 },
});
