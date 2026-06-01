import React from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, sombra } from '../src/tema';
import { t } from '../src/i18n';
import { Botao, Estrelas, Etiqueta, NotaAvaliacao } from '../src/componentes';
import { obterProduto } from '../src/servicos';
import { useAsync } from '../src/hooks/useAsync';
import { useCarrinho } from '../src/contextos/CarrinhoContext';
import type { ItemReserva, ProdutoViagem } from '../src/tipos';

export default function Detalhe() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { adicionar, contem } = useCarrinho();

  const { dados: produto, carregando } = useAsync(
    () => (id ? obterProduto(id) : Promise.resolve(null)),
    [id],
  );

  if (carregando) {
    return (
      <View style={[styles.tela, styles.centro]}>
        <Stack.Screen options={{ title: '' }} />
        <ActivityIndicator size="large" color={cores.azul} />
      </View>
    );
  }

  if (!produto) {
    return (
      <View style={styles.tela}>
        <Stack.Screen options={{ title: '' }} />
        <Text style={styles.semProduto}>{t.resultados.nenhum}</Text>
      </View>
    );
  }

  const item = montarItem(produto);
  const jaAdicionado = contem(item.chave);

  const adicionarEReservar = () => {
    adicionar(item);
    router.push('/reservas');
  };

  return (
    <View style={styles.tela}>
      <Stack.Screen options={{ title: '' }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {temImagem(produto) && (
          <Image source={{ uri: produto.imagem }} style={styles.capa} />
        )}

        <View style={styles.corpo}>
          <Text style={styles.titulo}>{item.titulo}</Text>
          <Text style={styles.subtitulo}>{item.subtitulo}</Text>

          {detalhesEspecificos(produto)}
        </View>
      </ScrollView>

      {/* Rodapé fixo de reserva */}
      <View style={styles.rodape}>
        <View>
          <Text style={styles.rodapeRotulo}>{t.reservas.total}</Text>
          <Text style={styles.rodapePreco}>{t.comum.reais(item.preco)}</Text>
        </View>
        <Botao
          titulo={jaAdicionado ? t.reservas.finalizar : t.detalhe.reservar}
          aoPressionar={jaAdicionado ? () => router.push('/reservas') : adicionarEReservar}
          estilo={{ flex: 1, marginLeft: 16 }}
        />
      </View>
    </View>
  );
}

function temImagem(p: ProdutoViagem): p is Extract<ProdutoViagem, { imagem: string }> {
  return (
    p.categoria === 'hospedagem' ||
    p.categoria === 'turismo' ||
    p.categoria === 'locacao'
  );
}

function detalhesEspecificos(p: ProdutoViagem) {
  switch (p.categoria) {
    case 'hospedagem':
      return (
        <>
          <View style={styles.linhaAval}>
            <Estrelas quantidade={p.estrelas} />
            <NotaAvaliacao nota={p.avaliacao} total={p.totalAvaliacoes} />
          </View>
          <Bloco titulo={t.detalhe.sobre} texto={p.descricao} />
          <Bloco titulo={t.detalhe.comodidades}>
            <View style={styles.tags}>
              {p.comodidades.map((c) => (
                <Etiqueta key={c} texto={c} cor={cores.superficieAlt} corTexto={cores.azulMarinho} />
              ))}
            </View>
          </Bloco>
          <Politica />
        </>
      );
    case 'turismo':
      return (
        <>
          <NotaAvaliacao nota={p.avaliacao} total={p.totalAvaliacoes} />
          <Bloco titulo={t.detalhe.sobre} texto={p.descricao} />
          <Bloco titulo={t.detalhe.inclui}>
            {p.inclui.map((i) => (
              <View key={i} style={styles.itemInclui}>
                <Ionicons name="checkmark-circle" size={18} color={cores.verde} />
                <Text style={styles.incluiTexto}>{i}</Text>
              </View>
            ))}
          </Bloco>
          <Politica />
        </>
      );
    case 'aereo':
      return (
        <>
          <ResumoTrecho
            origem={p.origem}
            destino={p.destino}
            partida={p.partida}
            chegada={p.chegada}
            extra={`${p.companhia} · ${p.classe} · ${t.resultados.escalas(p.escalas)}`}
            icone="airplane"
          />
          <Bloco titulo={t.detalhe.inclui}>
            <View style={styles.itemInclui}>
              <Ionicons name={p.bagagem ? 'checkmark-circle' : 'close-circle'} size={18} color={p.bagagem ? cores.verde : cores.textoClaro} />
              <Text style={styles.incluiTexto}>Bagagem despachada {p.bagagem ? 'inclusa' : 'não inclusa'}</Text>
            </View>
            <View style={styles.itemInclui}>
              <Ionicons name="checkmark-circle" size={18} color={cores.verde} />
              <Text style={styles.incluiTexto}>1 item pessoal + bagagem de mão</Text>
            </View>
          </Bloco>
          <Politica />
        </>
      );
    case 'onibus':
      return (
        <>
          <ResumoTrecho
            origem={p.origem}
            destino={p.destino}
            partida={p.partida}
            chegada={p.chegada}
            extra={`${p.empresa} · ${p.tipo}`}
            icone="bus"
          />
          <Bloco titulo={t.detalhe.inclui}>
            <View style={styles.itemInclui}>
              <Ionicons name="checkmark-circle" size={18} color={cores.verde} />
              <Text style={styles.incluiTexto}>{t.resultados.assentos(p.assentos)}</Text>
            </View>
            <View style={styles.itemInclui}>
              <Ionicons name="checkmark-circle" size={18} color={cores.verde} />
              <Text style={styles.incluiTexto}>Bagagem de até 15kg no bagageiro</Text>
            </View>
          </Bloco>
          <Politica />
        </>
      );
    case 'locacao':
      return (
        <>
          <Text style={styles.subtitulo}>
            {p.locadora} · {p.cidade}, {p.uf}
          </Text>
          <Bloco titulo={t.detalhe.comodidades}>
            <View style={styles.itemInclui}>
              <Ionicons name="people-outline" size={18} color={cores.verde} />
              <Text style={styles.incluiTexto}>{p.lugares} lugares · {p.categoriaVeiculo}</Text>
            </View>
            <View style={styles.itemInclui}>
              <Ionicons name="cog-outline" size={18} color={cores.verde} />
              <Text style={styles.incluiTexto}>Câmbio {p.cambio.toLowerCase()}</Text>
            </View>
            <View style={styles.itemInclui}>
              <Ionicons name={p.arCondicionado ? 'checkmark-circle' : 'close-circle'} size={18} color={p.arCondicionado ? cores.verde : cores.textoClaro} />
              <Text style={styles.incluiTexto}>Ar-condicionado {p.arCondicionado ? 'incluso' : 'não incluso'}</Text>
            </View>
            <View style={styles.itemInclui}>
              <Ionicons name="checkmark-circle" size={18} color={cores.verde} />
              <Text style={styles.incluiTexto}>Quilometragem livre</Text>
            </View>
          </Bloco>
          <Politica />
        </>
      );
    case 'seguro':
      return (
        <>
          <Text style={styles.subtitulo}>{p.cobertura}</Text>
          <Bloco titulo="Coberturas">
            <View style={styles.itemInclui}>
              <Ionicons name="medkit-outline" size={18} color={cores.verde} />
              <Text style={styles.incluiTexto}>
                Despesas médicas até {t.comum.reais(p.coberturaMedica)}
              </Text>
            </View>
            <View style={styles.itemInclui}>
              <Ionicons name={p.incluiBagagem ? 'checkmark-circle' : 'close-circle'} size={18} color={p.incluiBagagem ? cores.verde : cores.textoClaro} />
              <Text style={styles.incluiTexto}>Bagagem extraviada</Text>
            </View>
            <View style={styles.itemInclui}>
              <Ionicons name={p.incluiCancelamento ? 'checkmark-circle' : 'close-circle'} size={18} color={p.incluiCancelamento ? cores.verde : cores.textoClaro} />
              <Text style={styles.incluiTexto}>Cancelamento de viagem</Text>
            </View>
          </Bloco>
          <Bloco titulo="Benefícios">
            {p.beneficios.map((b) => (
              <View key={b} style={styles.itemInclui}>
                <Ionicons name="checkmark-circle" size={18} color={cores.verde} />
                <Text style={styles.incluiTexto}>{b}</Text>
              </View>
            ))}
          </Bloco>
          <Politica />
        </>
      );
  }
}

function ResumoTrecho({
  origem,
  destino,
  partida,
  chegada,
  extra,
  icone,
}: {
  origem: string;
  destino: string;
  partida: string;
  chegada: string;
  extra: string;
  icone: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.trecho}>
      <View style={styles.trechoLinha}>
        <View>
          <Text style={styles.trechoHora}>{partida}</Text>
          <Text style={styles.trechoLocal}>{origem}</Text>
        </View>
        <Ionicons name={icone} size={22} color={cores.azul} />
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.trechoHora}>{chegada}</Text>
          <Text style={styles.trechoLocal}>{destino}</Text>
        </View>
      </View>
      <Text style={styles.trechoExtra}>{extra}</Text>
    </View>
  );
}

function Bloco({ titulo, texto, children }: { titulo: string; texto?: string; children?: React.ReactNode }) {
  return (
    <View style={styles.bloco}>
      <Text style={styles.blocoTitulo}>{titulo}</Text>
      {texto && <Text style={styles.blocoTexto}>{texto}</Text>}
      {children}
    </View>
  );
}

function Politica() {
  return (
    <View style={styles.politica}>
      <Ionicons name="information-circle-outline" size={18} color={cores.azul} />
      <View style={{ flex: 1 }}>
        <Text style={styles.politicaTitulo}>{t.detalhe.politica}</Text>
        <Text style={styles.politicaTexto}>{t.detalhe.politicaTexto}</Text>
      </View>
    </View>
  );
}

function montarItem(p: ProdutoViagem): ItemReserva {
  switch (p.categoria) {
    case 'aereo':
      return {
        chave: `aereo-${p.id}`,
        categoria: 'aereo',
        titulo: `${p.origem} → ${p.destino}`,
        subtitulo: `${p.companhia} · ${p.partida} - ${p.chegada}`,
        preco: p.preco,
        produtoId: p.id,
      };
    case 'onibus':
      return {
        chave: `onibus-${p.id}`,
        categoria: 'onibus',
        titulo: `${p.origem} → ${p.destino}`,
        subtitulo: `${p.empresa} · ${p.tipo} · ${p.partida}`,
        preco: p.preco,
        produtoId: p.id,
      };
    case 'hospedagem':
      return {
        chave: `hospedagem-${p.id}`,
        categoria: 'hospedagem',
        titulo: p.nome,
        subtitulo: `${p.cidade}, ${p.uf} · ${p.tipo}`,
        preco: p.precoNoite,
        produtoId: p.id,
      };
    case 'turismo':
      return {
        chave: `turismo-${p.id}`,
        categoria: 'turismo',
        titulo: p.titulo,
        subtitulo: `${p.destino}, ${p.uf} · ${t.detalhe.diasNoites(p.dias)}`,
        preco: p.preco,
        produtoId: p.id,
      };
    case 'locacao':
      return {
        chave: `locacao-${p.id}`,
        categoria: 'locacao',
        titulo: p.modelo,
        subtitulo: `${p.locadora} · ${p.cidade}, ${p.uf}`,
        preco: p.precoDia,
        produtoId: p.id,
      };
    case 'seguro':
      return {
        chave: `seguro-${p.id}`,
        categoria: 'seguro',
        titulo: p.plano,
        subtitulo: `${p.abrangencia} · ${t.comum.reais(p.coberturaMedica)} de cobertura`,
        preco: p.precoDia,
        produtoId: p.id,
      };
  }
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  centro: { alignItems: 'center', justifyContent: 'center' },
  semProduto: { textAlign: 'center', marginTop: 80, color: cores.textoSuave },
  capa: { width: '100%', height: 240 },
  corpo: { padding: 16, gap: 12 },
  titulo: { fontSize: 24, fontWeight: '800', color: cores.azulMarinho },
  subtitulo: { fontSize: 15, color: cores.textoSuave, fontWeight: '600' },
  linhaAval: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  bloco: { gap: 8, marginTop: 8 },
  blocoTitulo: { fontSize: 17, fontWeight: '800', color: cores.azulMarinho },
  blocoTexto: { fontSize: 14, color: cores.textoSuave, lineHeight: 21, fontWeight: '500' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  itemInclui: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  incluiTexto: { fontSize: 14, color: cores.texto, fontWeight: '600' },
  trecho: {
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    padding: 16,
    gap: 10,
    ...sombra,
  },
  trechoLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trechoHora: { fontSize: 22, fontWeight: '800', color: cores.azulMarinho },
  trechoLocal: { fontSize: 13, color: cores.textoSuave, fontWeight: '600' },
  trechoExtra: {
    fontSize: 13,
    color: cores.textoSuave,
    fontWeight: '600',
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    paddingTop: 10,
  },
  politica: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#EAF3FB',
    borderRadius: raio.md,
    padding: 14,
    marginTop: 12,
  },
  politicaTitulo: { fontWeight: '800', color: cores.azulMarinho, fontSize: 14 },
  politicaTexto: { color: cores.textoSuave, fontSize: 13, marginTop: 2 },
  rodape: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.superficie,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  rodapeRotulo: { fontSize: 12, color: cores.textoSuave, fontWeight: '600' },
  rodapePreco: { fontSize: 22, fontWeight: '800', color: cores.verde },
});
