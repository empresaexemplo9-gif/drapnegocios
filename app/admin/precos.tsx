import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, sombra } from '../../src/tema';
import { t } from '../../src/i18n';
import { GuardaAdmin } from '../../src/componentes';
import { categoriasInfo } from '../../src/componentes/SeletorCategorias';
import { listarTodosProdutos, precoDe, rotuloProduto } from '../../src/admin/produtos';
import { definirPrecoProduto, overridesPreco } from '../../src/servicos';
import type { Categoria, ProdutoViagem } from '../../src/tipos';

export default function EditarPrecos() {
  const [overrides, setOverrides] = useState<Record<string, number> | null>(null);
  const [rascunho, setRascunho] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState<string | null>(null);

  useEffect(() => {
    overridesPreco().then(setOverrides);
  }, []);

  const secoes = useMemo(() => {
    const produtos = listarTodosProdutos();
    const porCat = new Map<Categoria, ProdutoViagem[]>();
    for (const p of produtos) {
      const arr = porCat.get(p.categoria) ?? [];
      arr.push(p);
      porCat.set(p.categoria, arr);
    }
    return categoriasInfo
      .filter((c) => porCat.has(c.id))
      .map((c) => ({ titulo: c.rotulo, categoria: c.id, data: porCat.get(c.id) ?? [] }));
  }, []);

  const precoEfetivo = (p: ProdutoViagem) => overrides?.[p.id] ?? precoDe(p);

  const salvar = async (p: ProdutoViagem) => {
    const txt = (rascunho[p.id] ?? '').replace(',', '.');
    const valor = Number(txt);
    if (!Number.isFinite(valor) || valor <= 0) return;
    setSalvando(p.id);
    await definirPrecoProduto(p.id, valor);
    setOverrides((o) => ({ ...(o ?? {}), [p.id]: valor }));
    setRascunho((r) => {
      const novo = { ...r };
      delete novo[p.id];
      return novo;
    });
    setSalvando(null);
  };

  if (!overrides) {
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
      <SectionList
        style={styles.tela}
        sections={secoes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text style={styles.secao}>{section.titulo}</Text>
        )}
        renderItem={({ item }) => {
          const editado = rascunho[item.id];
          const alterado = overrides[item.id] !== undefined;
          return (
            <View style={styles.linha}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nome} numberOfLines={1}>
                  {rotuloProduto(item)}
                </Text>
                <Text style={styles.atual}>
                  {t.admin.precoAtual}: {t.comum.reais(precoEfetivo(item))}
                  {alterado ? '  •  editado' : ''}
                </Text>
              </View>
              <View style={styles.editor}>
                <Text style={styles.cifrao}>R$</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder={precoEfetivo(item).toFixed(2)}
                  placeholderTextColor={cores.textoClaro}
                  value={editado ?? ''}
                  onChangeText={(v) => setRascunho((r) => ({ ...r, [item.id]: v }))}
                />
              </View>
              <Pressable
                style={[styles.botao, editado === undefined && styles.botaoOff]}
                onPress={() => salvar(item)}
                disabled={editado === undefined || salvando === item.id}
              >
                {salvando === item.id ? (
                  <ActivityIndicator color={cores.textoInverso} size="small" />
                ) : (
                  <Ionicons name="checkmark" size={20} color={cores.textoInverso} />
                )}
              </Pressable>
            </View>
          );
        }}
      />
    </GuardaAdmin>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.fundo },
  secao: { fontSize: 16, fontWeight: '800', color: cores.azulMarinho, marginTop: 16, marginBottom: 8 },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cores.superficie,
    borderRadius: raio.md,
    padding: 12,
    marginBottom: 8,
    ...sombra,
  },
  nome: { fontSize: 14, fontWeight: '700', color: cores.azulMarinho },
  atual: { fontSize: 12, color: cores.textoSuave, fontWeight: '600', marginTop: 2 },
  editor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: cores.fundo,
    borderRadius: raio.sm,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: 8,
    width: 96,
  },
  cifrao: { color: cores.textoSuave, fontWeight: '700', fontSize: 13 },
  input: { flex: 1, paddingVertical: 8, fontSize: 14, fontWeight: '700', color: cores.azulMarinho },
  botao: {
    width: 40,
    height: 40,
    borderRadius: raio.sm,
    backgroundColor: cores.verde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoOff: { backgroundColor: cores.textoClaro },
});
