import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores, espaco, tipografia } from '../src/tema';
import { t } from '../src/i18n';
import { Botao, Campo, LogoMarca } from '../src/componentes';
import { useAutenticacao } from '../src/contextos/AutenticacaoContext';
import { registrar } from '../src/servicos';

export default function Cadastro() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entrar } = useAutenticacao();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const aoCriar = async () => {
    setErro('');
    setEnviando(true);
    try {
      const sessao = await registrar(nome.trim(), email.trim(), senha);
      entrar(sessao.usuario.email, sessao.usuario.papel, sessao.usuario.nome);
      router.back();
    } catch (e) {
      setErro(e instanceof Error && e.message ? e.message : t.cadastro.erro);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable style={[styles.fechar, { top: insets.top + 8 }]} onPress={() => router.back()} hitSlop={12}>
        <Ionicons name="close" size={26} color={cores.azulMarinho} />
      </Pressable>

      <View style={styles.conteudo}>
        <View style={styles.marca}>
          <LogoMarca tamanho={72} comTexto />
        </View>

        <Text style={styles.titulo}>{t.cadastro.titulo}</Text>
        <Text style={styles.subtitulo}>{t.cadastro.subtitulo}</Text>

        <Campo
          icone="person-outline"
          placeholder={t.cadastro.nome}
          autoCapitalize="words"
          value={nome}
          onChangeText={setNome}
          containerStyle={styles.campo}
        />
        <Campo
          icone="mail-outline"
          placeholder={t.cadastro.email}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          containerStyle={styles.campo}
        />
        <Campo
          icone="lock-closed-outline"
          placeholder={t.cadastro.senha}
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          containerStyle={styles.campo}
        />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <Botao
          titulo={t.cadastro.criar}
          variante="destaque"
          aoPressionar={aoCriar}
          carregando={enviando}
          estilo={{ alignSelf: 'stretch', marginTop: espaco.sm }}
        />

        <View style={styles.rodape}>
          <Text style={styles.rodapeTexto}>{t.cadastro.jaTenho} </Text>
          <Pressable hitSlop={6} onPress={() => router.replace('/login')}>
            <Text style={styles.rodapeLink}>{t.cadastro.entrar}</Text>
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
  titulo: { ...tipografia.titulo, color: cores.azulMarinho, marginTop: espaco.md, textAlign: 'center' },
  subtitulo: {
    ...tipografia.corpoSuave,
    color: cores.textoSuave,
    textAlign: 'center',
    marginBottom: espaco.sm,
  },
  campo: { alignSelf: 'stretch' },
  erro: { ...tipografia.corpoSuave, color: cores.erro, textAlign: 'center' },
  rodape: { flexDirection: 'row', justifyContent: 'center', marginTop: espaco.lg },
  rodapeTexto: { color: cores.textoSuave, fontWeight: '500' },
  rodapeLink: { color: cores.verde, fontWeight: '800' },
});
