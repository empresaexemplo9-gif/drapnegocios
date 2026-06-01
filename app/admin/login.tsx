import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio } from '../../src/tema';
import { t } from '../../src/i18n';
import { Botao } from '../../src/componentes';
import { autenticar } from '../../src/servicos';
import { useAutenticacao } from '../../src/contextos/AutenticacaoContext';

export default function LoginAdmin() {
  const router = useRouter();
  const { entrar } = useAutenticacao();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const acessar = async () => {
    setErro(false);
    setCarregando(true);
    try {
      const sessao = await autenticar(email, senha);
      if (sessao.usuario.papel !== 'admin') {
        setErro(true);
        return;
      }
      entrar(sessao.usuario.email, sessao.usuario.papel);
      router.replace('/admin');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.tela}>
      <Stack.Screen options={{ title: t.admin.loginTitulo }} />

      <View style={styles.escudo}>
        <Ionicons name="shield-checkmark" size={40} color={cores.azul} />
      </View>
      <Text style={styles.titulo}>{t.admin.loginTitulo}</Text>
      <Text style={styles.sub}>{t.admin.loginSub}</Text>

      <View style={styles.campo}>
        <Ionicons name="mail-outline" size={20} color={cores.azul} />
        <TextInput
          style={styles.input}
          placeholder={t.login.email}
          placeholderTextColor={cores.textoClaro}
          autoCapitalize="none"
          keyboardType="email-address"
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

      {erro && <Text style={styles.erro}>{t.admin.credenciaisInvalidas}</Text>}

      <Botao
        titulo={t.admin.entrarAdmin}
        aoPressionar={acessar}
        carregando={carregando}
        estilo={{ alignSelf: 'stretch', marginTop: 8 }}
      />

      <Text style={styles.dica}>{t.admin.dica}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, padding: 24, justifyContent: 'center', gap: 12 },
  escudo: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 999,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontSize: 22, fontWeight: '800', color: cores.azulMarinho, textAlign: 'center', marginTop: 8 },
  sub: { fontSize: 14, color: cores.textoSuave, textAlign: 'center', fontWeight: '600', marginBottom: 8 },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.superficie,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: 14,
  },
  input: { flex: 1, fontSize: 15, color: cores.azulMarinho, fontWeight: '600', paddingVertical: 14 },
  erro: { color: cores.erro, fontWeight: '700', fontSize: 13, textAlign: 'center' },
  dica: { fontSize: 12, color: cores.azul, textAlign: 'center', marginTop: 12, fontWeight: '600' },
});
