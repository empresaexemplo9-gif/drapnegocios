import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, sombra } from '../../src/tema';
import { t } from '../../src/i18n';
import { GuardaAdmin } from '../../src/componentes';
import { categoriasInfo } from '../../src/componentes/SeletorCategorias';
import { listarParceiros, removerParceiro, salvarParceiro } from '../../src/servicos';
import type { Parceiro } from '../../src/admin/tipos';
import type { Categoria } from '../../src/tipos';

const vazio = (): Parceiro => ({
  id: `pc-${Date.now()}`,
  nome: '',
  categoria: 'aereo',
  contato: '',
  ativo: true,
});

function confirmar(mensagem: string, aoConfirmar: () => void) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (typeof window !== 'undefined' && window.confirm(mensagem)) aoConfirmar();
    return;
  }
  Alert.alert(mensagem, undefined, [
    { text: t.comum.cancelar, style: 'cancel' },
    { text: t.admin.remover, style: 'destructive', onPress: aoConfirmar },
  ]);
}

export default function GerenciarParceiros() {
  const [lista, setLista] = useState<Parceiro[] | null>(null);
  const [edicao, setEdicao] = useState<Parceiro | null>(null);

  useEffect(() => {
    listarParceiros().then(setLista);
  }, []);

  const salvar = async () => {
    if (!edicao || !edicao.nome.trim()) return;
    setLista(await salvarParceiro({ ...edicao, nome: edicao.nome.trim() }));
    setEdicao(null);
  };

  const remover = (id: string) =>
    confirmar(t.admin.confirmarRemover, async () => setLista(await removerParceiro(id)));

  const alternarAtivo = async (p: Parceiro) =>
    setLista(await salvarParceiro({ ...p, ativo: !p.ativo }));

  if (!lista) {
    return (
      <GuardaAdmin>
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={cores.azul} />
        </View>
      </GuardaAdmin>
    );
  }

  return (
    <GuardaAdmin>
      <ScrollView style={styles.tela} contentContainerStyle={{ padding: 16 }}>
        {edicao ? (
          <View style={styles.form}>
            <Text style={styles.formTitulo}>
              {lista.some((p) => p.id === edicao.id) ? t.admin.editarParceiro : t.admin.novoParceiro}
            </Text>
            <Campo
              rotulo={t.admin.nome}
              valor={edicao.nome}
              aoMudar={(v) => setEdicao({ ...edicao, nome: v })}
            />
            <Text style={styles.rotulo}>{t.admin.categoria}</Text>
            <View style={styles.chips}>
              {categoriasInfo.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setEdicao({ ...edicao, categoria: c.id as Categoria })}
                  style={[styles.chip, edicao.categoria === c.id && styles.chipOn]}
                >
                  <Text style={[styles.chipTxt, edicao.categoria === c.id && styles.chipTxtOn]}>
                    {c.rotulo}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Campo
              rotulo={t.admin.contato}
              valor={edicao.contato ?? ''}
              aoMudar={(v) => setEdicao({ ...edicao, contato: v })}
            />
            <View style={styles.switchLinha}>
              <Text style={styles.rotulo}>{edicao.ativo ? t.admin.ativo : t.admin.inativo}</Text>
              <Switch
                value={edicao.ativo}
                onValueChange={(v) => setEdicao({ ...edicao, ativo: v })}
                trackColor={{ true: cores.verde, false: cores.borda }}
              />
            </View>
            <View style={styles.formBotoes}>
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => setEdicao(null)}>
                <Text style={styles.btnGhostTxt}>{t.comum.cancelar}</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnPri]} onPress={salvar}>
                <Text style={styles.btnPriTxt}>{t.admin.salvar}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable style={styles.novo} onPress={() => setEdicao(vazio())}>
            <Ionicons name="add-circle" size={22} color={cores.azul} />
            <Text style={styles.novoTxt}>{t.admin.novoParceiro}</Text>
          </Pressable>
        )}

        {lista.map((p) => {
          const cat = categoriasInfo.find((c) => c.id === p.categoria);
          return (
            <View key={p.id} style={styles.item}>
              <View style={styles.itemIcone}>
                <Ionicons name={cat?.icone ?? 'business'} size={20} color={cores.azul} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemNome}>{p.nome}</Text>
                <Text style={styles.itemSub}>
                  {cat?.rotulo}
                  {p.contato ? ` · ${p.contato}` : ''}
                </Text>
              </View>
              <Switch
                value={p.ativo}
                onValueChange={() => alternarAtivo(p)}
                trackColor={{ true: cores.verde, false: cores.borda }}
              />
              <Pressable hitSlop={8} onPress={() => setEdicao(p)} style={styles.acao}>
                <Ionicons name="create-outline" size={20} color={cores.azul} />
              </Pressable>
              <Pressable hitSlop={8} onPress={() => remover(p.id)} style={styles.acao}>
                <Ionicons name="trash-outline" size={20} color={cores.erro} />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </GuardaAdmin>
  );
}

function Campo({
  rotulo,
  valor,
  aoMudar,
}: {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
}) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput style={styles.input} value={valor} onChangeText={aoMudar} />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.fundo },
  novo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.superficie,
    borderRadius: raio.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: cores.azul,
    padding: 14,
    marginBottom: 16,
  },
  novoTxt: { color: cores.azul, fontWeight: '800', fontSize: 15 },
  form: { backgroundColor: cores.superficie, borderRadius: raio.lg, padding: 16, marginBottom: 16, ...sombra },
  formTitulo: { fontSize: 16, fontWeight: '800', color: cores.azulMarinho, marginBottom: 12 },
  rotulo: { fontSize: 12, color: cores.textoSuave, fontWeight: '700', marginBottom: 4 },
  input: {
    backgroundColor: cores.fundo,
    borderRadius: raio.sm,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: cores.azulMarinho,
    fontWeight: '600',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: raio.pill,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
  },
  chipOn: { backgroundColor: cores.azul, borderColor: cores.azul },
  chipTxt: { fontSize: 13, fontWeight: '700', color: cores.azulMarinho },
  chipTxtOn: { color: cores.textoInverso },
  switchLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8 },
  formBotoes: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btn: { flex: 1, height: 46, borderRadius: raio.md, alignItems: 'center', justifyContent: 'center' },
  btnGhost: { borderWidth: 1.5, borderColor: cores.borda },
  btnGhostTxt: { color: cores.azulMarinho, fontWeight: '800' },
  btnPri: { backgroundColor: cores.azul },
  btnPriTxt: { color: cores.textoInverso, fontWeight: '800' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.superficie,
    borderRadius: raio.md,
    padding: 12,
    marginBottom: 8,
    ...sombra,
  },
  itemIcone: {
    width: 40,
    height: 40,
    borderRadius: raio.sm,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemNome: { fontSize: 15, fontWeight: '800', color: cores.azulMarinho },
  itemSub: { fontSize: 12, color: cores.textoSuave, fontWeight: '600', marginTop: 2 },
  acao: { padding: 4 },
});
