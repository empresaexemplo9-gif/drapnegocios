import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio } from '../src/tema';
import { t } from '../src/i18n';
import { CartaoResultado } from '../src/componentes';
import { buscar } from '../src/servicos';
import { useAsync } from '../src/hooks/useAsync';
import { categoriasInfo } from '../src/componentes/SeletorCategorias';
import type { Categoria, ProdutoViagem } from '../src/tipos';

type Ordenacao = 'preco' | 'rapido' | 'avaliacao';

export default function Resultados() {
  const router = useRouter();
  const { categoria = 'aereo', origem, destino } = useLocalSearchParams<{
    categoria?: Categoria;
    origem?: string;
    destino?: string;
  }>();

  const [ordem, setOrdem] = useState<Ordenacao>('preco');

  const { dados, carregando } = useAsync(
    () => buscar(categoria, { origem, destino }),
    [categoria, origem, destino],
  );

  const resultados = useMemo(() => {
    const lista = dados ?? [];
    return [...lista].sort((a, b) => ordenar(a, b, ordem));
  }, [dados, ordem]);

  const titulo = categoriasInfo.find((c) => c.id === categoria)?.rotulo ?? t.resultados.titulo;
  const subtitulo = [origem, destino].filter(Boolean).join(' → ') || 'Todas as opções';

  return (
    <View style={styles.tela}>
      <Stack.Screen options={{ title: titulo }} />

      <View style={styles.barra}>
        <Text style={styles.rota}>{subtitulo}</Text>
        <Text style={styles.contagem}>{t.resultados.encontrados(resultados.length)}</Text>
      </View>

      <View style={styles.filtros}>
        <ChipOrdem rotulo={t.resultados.maisBarato} ativo={ordem === 'preco'} aoTocar={() => setOrdem('preco')} />
        <ChipOrdem rotulo={t.resultados.maisRapido} ativo={ordem === 'rapido'} aoTocar={() => setOrdem('rapido')} />
        <ChipOrdem rotulo={t.resultados.melhorAvaliado} ativo={ordem === 'avaliacao'} aoTocar={() => setOrdem('avaliacao')} />
      </View>

      <FlatList
        data={resultados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CartaoResultado
            produto={item}
            aoTocar={() => router.push({ pathname: '/detalhe', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          carregando ? (
            <View style={styles.vazio}>
              <ActivityIndicator size="large" color={cores.azul} />
            </View>
          ) : (
            <View style={styles.vazio}>
              <Ionicons name="search-outline" size={48} color={cores.textoClaro} />
              <Text style={styles.vazioTexto}>{t.resultados.nenhum}</Text>
            </View>
          )
        }
      />
    </View>
  );
}

function ChipOrdem({ rotulo, ativo, aoTocar }: { rotulo: string; ativo: boolean; aoTocar: () => void }) {
  return (
    <Pressable onPress={aoTocar} style={[styles.chip, ativo && styles.chipAtivo]}>
      <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{rotulo}</Text>
    </Pressable>
  );
}

function preco(p: ProdutoViagem): number {
  if (p.categoria === 'hospedagem') return p.precoNoite;
  if (p.categoria === 'locacao' || p.categoria === 'seguro') return p.precoDia;
  return p.preco;
}

function ordenar(a: ProdutoViagem, b: ProdutoViagem, ordem: Ordenacao): number {
  if (ordem === 'preco') return preco(a) - preco(b);
  if (ordem === 'rapido') {
    const dur = (p: ProdutoViagem) => ('duracaoMin' in p ? p.duracaoMin : Number.MAX_SAFE_INTEGER);
    return dur(a) - dur(b);
  }
  const aval = (p: ProdutoViagem) => ('avaliacao' in p ? p.avaliacao : 0);
  return aval(b) - aval(a);
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  barra: {
    backgroundColor: cores.superficie,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  rota: { fontSize: 16, fontWeight: '800', color: cores.azulMarinho },
  contagem: { fontSize: 13, color: cores.textoSuave, fontWeight: '600', marginTop: 2 },
  filtros: { flexDirection: 'row', gap: 8, padding: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: raio.pill,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  chipAtivo: { backgroundColor: cores.azulMarinho, borderColor: cores.azulMarinho },
  chipTexto: { fontSize: 13, fontWeight: '700', color: cores.azulMarinho },
  chipTextoAtivo: { color: cores.textoInverso },
  lista: { padding: 16, paddingTop: 4 },
  vazio: { alignItems: 'center', gap: 12, marginTop: 80 },
  vazioTexto: { color: cores.textoSuave, fontSize: 15, fontWeight: '600', textAlign: 'center' },
});
