import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, sombra } from '../../src/tema';
import { t } from '../../src/i18n';
import { Botao } from '../../src/componentes';
import { useAutenticacao } from '../../src/contextos/AutenticacaoContext';
import { empresa } from '../../src/dados/empresa';

type Icone = keyof typeof Ionicons.glyphMap;

export default function Perfil() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { usuario, autenticado, sair } = useAutenticacao();

  return (
    <ScrollView style={styles.tela} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[styles.cabecalho, { paddingTop: insets.top + 20 }]}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={cores.azulMarinho} />
        </View>
        {autenticado ? (
          <>
            <Text style={styles.nome}>{usuario?.nome}</Text>
            <Text style={styles.email}>{usuario?.email}</Text>
          </>
        ) : (
          <>
            <Text style={styles.nome}>{t.perfil.titulo}</Text>
            <Text style={styles.email}>{t.perfil.naoLogado}</Text>
            <Botao
              titulo={t.perfil.entrar}
              aoPressionar={() => router.push('/login')}
              variante="secundario"
              estilo={{ marginTop: 16, alignSelf: 'stretch' }}
            />
          </>
        )}
      </View>

      <Grupo>
        <Linha icone="airplane-outline" rotulo={t.perfil.minhasViagens} aoTocar={() => router.push('/reservas')} />
        <Linha icone="card-outline" rotulo={t.perfil.pagamentos} />
        <Linha icone="notifications-outline" rotulo={t.perfil.notificacoes} />
      </Grupo>

      <Grupo>
        <Linha icone="information-circle-outline" rotulo={t.sobre.titulo} aoTocar={() => router.push('/sobre')} />
        <Linha icone="document-text-outline" rotulo={t.sobre.termos} aoTocar={() => router.push('/termos')} />
        <Linha
          icone="logo-whatsapp"
          rotulo={t.perfil.ajuda}
          aoTocar={() => Linking.openURL(empresa.whatsappUrl)}
        />
      </Grupo>

      {autenticado && (
        <Pressable style={styles.sair} onPress={sair}>
          <Ionicons name="log-out-outline" size={20} color={cores.erro} />
          <Text style={styles.sairTexto}>{t.perfil.sair}</Text>
        </Pressable>
      )}

      <Text style={styles.rodape}>
        {empresa.nomeFantasia} · {t.app.slogan}
      </Text>
    </ScrollView>
  );
}

function Grupo({ children }: { children: React.ReactNode }) {
  return <View style={styles.grupo}>{children}</View>;
}

function Linha({ icone, rotulo, aoTocar }: { icone: Icone; rotulo: string; aoTocar?: () => void }) {
  return (
    <Pressable style={styles.linha} onPress={aoTocar}>
      <Ionicons name={icone} size={22} color={cores.azul} />
      <Text style={styles.linhaTexto}>{rotulo}</Text>
      <Ionicons name="chevron-forward" size={18} color={cores.textoClaro} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: {
    backgroundColor: cores.azulMarinho,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: raio.xl,
    borderBottomRightRadius: raio.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: cores.amarelo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nome: { color: cores.textoInverso, fontSize: 20, fontWeight: '800', marginTop: 12 },
  email: { color: cores.textoInverso, opacity: 0.85, marginTop: 2 },
  grupo: {
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
    ...sombra,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.borda,
  },
  linhaTexto: { flex: 1, fontSize: 15, fontWeight: '700', color: cores.azulMarinho },
  sair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
  },
  sairTexto: { color: cores.erro, fontWeight: '800', fontSize: 15 },
  rodape: { textAlign: 'center', color: cores.textoClaro, fontSize: 12, marginTop: 16, fontWeight: '600' },
});
