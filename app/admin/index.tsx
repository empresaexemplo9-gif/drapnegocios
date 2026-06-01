import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, sombra } from '../../src/tema';
import { t } from '../../src/i18n';
import { GuardaAdmin } from '../../src/componentes';
import { useAutenticacao } from '../../src/contextos/AutenticacaoContext';

type Icone = keyof typeof Ionicons.glyphMap;

export default function PainelAdmin() {
  const router = useRouter();
  const { usuario } = useAutenticacao();

  return (
    <GuardaAdmin>
      <ScrollView style={styles.tela} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.ola}>Olá, {usuario?.nome}</Text>
        <Text style={styles.sub}>{t.admin.acesso}</Text>

        <Cartao
          icone="pricetags"
          titulo={t.admin.secaoPrecos}
          descricao={t.admin.secaoPrecosSub}
          aoTocar={() => router.push('/admin/precos')}
        />
        <Cartao
          icone="business"
          titulo={t.admin.secaoParceiros}
          descricao={t.admin.secaoParceirosSub}
          aoTocar={() => router.push('/admin/parceiros')}
        />
      </ScrollView>
    </GuardaAdmin>
  );
}

function Cartao({
  icone,
  titulo,
  descricao,
  aoTocar,
}: {
  icone: Icone;
  titulo: string;
  descricao: string;
  aoTocar: () => void;
}) {
  return (
    <Pressable style={styles.cartao} onPress={aoTocar}>
      <View style={styles.icone}>
        <Ionicons name={icone} size={24} color={cores.azul} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cartaoTitulo}>{titulo}</Text>
        <Text style={styles.cartaoDesc}>{descricao}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={cores.textoClaro} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  ola: { fontSize: 22, fontWeight: '800', color: cores.azulMarinho },
  sub: { fontSize: 14, color: cores.textoSuave, fontWeight: '600', marginBottom: 16 },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    padding: 16,
    marginBottom: 12,
    ...sombra,
  },
  icone: {
    width: 48,
    height: 48,
    borderRadius: raio.md,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartaoTitulo: { fontSize: 16, fontWeight: '800', color: cores.azulMarinho },
  cartaoDesc: { fontSize: 13, color: cores.textoSuave, fontWeight: '600', marginTop: 2 },
});
