import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores, espaco, tipografia } from '../src/tema';
import { t } from '../src/i18n';
import { Botao, Campo, LogoMarca } from '../src/componentes';
import { useAutenticacao } from '../src/contextos/AutenticacaoContext';
import { autenticar } from '../src/servicos';

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entrar } = useAutenticacao();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState('');

  const aoEntrar = async () => {
    setErro('');
    setEntrando(true);
    try {
      const sessao = await autenticar(email.trim(), senha);
      entrar(sessao.usuario.email, sessao.usuario.papel, sessao.usuario.nome);
      router.back();
    } catch (e) {
      setErro(e instanceof Error && e.message ? e.message : t.login.erro);
    } finally {
      setEntrando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable style={[styles.fechar, { top: insets.top + 8 }]} onPress={() => router.back()} hitSlop={12}>
        <Ionicons name="close" size={26} color={cores.azulMarinho} />
      </Pressable>

      <View style={styles.conteudo}>
        <View style={styles.marca}>
          <LogoMarca tamanho={88} comTexto />
        </View>

        <Text style={styles.titulo}>{t.login.titulo}</Text>
        <Text style={styles.subtitulo}>{t.login.subtitulo}</Text>

        <Campo
          icone="mail-outline"
          placeholder={t.login.email}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          containerStyle={styles.campo}
        />
        <Campo
          icone="lock-closed-outline"
          placeholder={t.login.senha}
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          containerStyle={styles.campo}
        />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <Pressable style={styles.esqueci} hitSlop={8}>
          <Text style={styles.esqueciTexto}>{t.login.esqueci}</Text>
        </Pressable>

        <Botao
          titulo={t.login.entrar}
          variante="destaque"
          aoPressionar={aoEntrar}
          carregando={entrando}
          estilo={{ alignSelf: 'stretch' }}
        />

        <View style={styles.rodape}>
          <Text style={styles.rodapeTexto}>{t.login.semConta} </Text>
          <Pressable hitSlop={6} onPress={() => router.push('/register')}>
            <Text style={styles.rodapeLink}>{t.login.criarConta}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.superficie },
  fechar: { position: 'absolute', right: 16, zIndex: 2 },
  conteudo: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: espaco.md },
  marca: { alignItems: 'center' },
  titulo: { ...tipografia.titulo, color: cores.azulMarinho, marginTop: espaco.lg, textAlign: 'center' },
  subtitulo: {
    ...tipografia.corpoSuave,
    color: cores.textoSuave,
    textAlign: 'center',
    marginBottom: espaco.sm,
  },
  campo: { alignSelf: 'stretch' },
  erro: { ...tipografia.corpoSuave, color: cores.erro, textAlign: 'center' },
  esqueci: { alignSelf: 'flex-end' },
  esqueciTexto: { ...tipografia.legenda, color: cores.azul },
  rodape: { flexDirection: 'row', justifyContent: 'center', marginTop: espaco.lg },
  rodapeTexto: { color: cores.textoSuave, fontWeight: '500' },
  rodapeLink: { color: cores.verde, fontWeight: '800' },
});
