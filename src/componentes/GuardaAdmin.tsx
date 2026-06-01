import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../tema';
import { t } from '../i18n';
import { Botao } from './Botao';
import { useAutenticacao } from '../contextos/AutenticacaoContext';

/** Libera o conteúdo apenas para administradores; senão mostra acesso restrito. */
export function GuardaAdmin({ children }: { children: React.ReactNode }) {
  const { ehAdmin } = useAutenticacao();
  const router = useRouter();

  if (ehAdmin) return <>{children}</>;

  return (
    <View style={styles.tela}>
      <Ionicons name="lock-closed" size={48} color={cores.textoClaro} />
      <Text style={styles.titulo}>{t.admin.restrito}</Text>
      <Text style={styles.texto}>{t.admin.restritoTexto}</Text>
      <Text style={styles.dica}>{t.admin.dica}</Text>
      <Botao
        titulo={t.admin.entrarAdmin}
        aoPressionar={() => router.replace('/admin/login')}
        estilo={{ alignSelf: 'stretch', marginTop: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8, backgroundColor: cores.fundo },
  titulo: { fontSize: 20, fontWeight: '800', color: cores.azulMarinho, marginTop: 8 },
  texto: { fontSize: 14, color: cores.textoSuave, textAlign: 'center', fontWeight: '500' },
  dica: { fontSize: 12, color: cores.azul, textAlign: 'center', marginTop: 8, fontWeight: '600' },
});
