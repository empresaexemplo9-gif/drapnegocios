import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio } from '../src/tema';
import { t } from '../src/i18n';
import { Botao, LogoMarca } from '../src/componentes';
import { useAutenticacao } from '../src/contextos/AutenticacaoContext';
import { autenticar } from '../src/servicos';

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entrar } = useAutenticacao();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [entrando, setEntrando] = useState(false);

  const aoEntrar = async () => {
    setEntrando(true);
    try {
      const sessao = await autenticar(email || 'viajante@viajebrasil.com', senha);
      entrar(sessao.usuario.email, sessao.usuario.papel);
      router.back();
    } finally {
      setEntrando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable
        style={[styles.fechar, { top: insets.top + 8 }]}
        onPress={() => router.back()}
        hitSlop={12}
      >
        <Ionicons name="close" size={26} color={cores.azulMarinho} />
      </Pressable>

      <View style={styles.conteudo}>
        <LogoMarca tamanho={88} comTexto />

        <Text style={styles.titulo}>{t.login.titulo}</Text>
        <Text style={styles.subtitulo}>{t.login.subtitulo}</Text>

        <View style={styles.campo}>
          <Ionicons name="mail-outline" size={20} color={cores.azul} />
          <TextInput
            style={styles.input}
            placeholder={t.login.email}
            placeholderTextColor={cores.textoClaro}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={styles.campo}>
          <Ionicons name="lock-closed-outline" size={20} color={cores.azul} />
          <TextInput
            style={styles.input}
            placeholder={t.login.senha}
            placeholderTextColor={cores.textoClaro}
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        <Pressable style={styles.esqueci} hitSlop={8}>
          <Text style={styles.esqueciTexto}>{t.login.esqueci}</Text>
        </Pressable>

        <Botao
          titulo={t.login.entrar}
          aoPressionar={aoEntrar}
          carregando={entrando}
          estilo={{ alignSelf: 'stretch' }}
        />

        <View style={styles.divisor}>
          <View style={styles.linhaDiv} />
          <Text style={styles.ou}>ou</Text>
          <View style={styles.linhaDiv} />
        </View>

        <Pressable style={styles.google} onPress={aoEntrar}>
          <Ionicons name="logo-google" size={20} color={cores.azulMarinho} />
          <Text style={styles.googleTexto}>{t.login.google}</Text>
        </Pressable>

        <View style={styles.rodape}>
          <Text style={styles.rodapeTexto}>{t.login.semConta} </Text>
          <Pressable hitSlop={6}>
            <Text style={styles.rodapeLink}>{t.login.fale}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.superficie },
  fechar: { position: 'absolute', right: 16, zIndex: 2 },
  conteudo: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 12 },
  titulo: { fontSize: 24, fontWeight: '800', color: cores.azulMarinho, marginTop: 24, textAlign: 'center' },
  subtitulo: { fontSize: 14, color: cores.textoSuave, textAlign: 'center', marginBottom: 12, fontWeight: '500' },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.fundo,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: 14,
  },
  input: { flex: 1, fontSize: 15, color: cores.azulMarinho, fontWeight: '600', paddingVertical: 14 },
  esqueci: { alignSelf: 'flex-end', marginBottom: 8 },
  esqueciTexto: { color: cores.azul, fontWeight: '700', fontSize: 13 },
  divisor: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 8 },
  linhaDiv: { flex: 1, height: 1, backgroundColor: cores.borda },
  ou: { color: cores.textoClaro, fontWeight: '600' },
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raio.md,
    paddingVertical: 14,
  },
  googleTexto: { fontSize: 15, fontWeight: '700', color: cores.azulMarinho },
  rodape: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  rodapeTexto: { color: cores.textoSuave, fontWeight: '500' },
  rodapeLink: { color: cores.azul, fontWeight: '800' },
});
