import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, sombra } from '../tema';
import { t } from '../i18n';
import { Etiqueta } from './Etiqueta';
import { Estrelas, NotaAvaliacao } from './Avaliacao';
import type { ProdutoViagem } from '../tipos';

const duracao = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
};

/** Renderiza um item de resultado adaptado à categoria do produto. */
export function CartaoResultado({
  produto,
  aoTocar,
}: {
  produto: ProdutoViagem;
  aoTocar: () => void;
}) {
  return (
    <Pressable style={styles.cartao} onPress={aoTocar}>
      {(produto.categoria === 'hospedagem' ||
        produto.categoria === 'turismo' ||
        produto.categoria === 'locacao') && (
        <Image source={{ uri: produto.imagem }} style={styles.imagem} />
      )}
      <View style={styles.corpo}>{conteudo(produto)}</View>
    </Pressable>
  );
}

function conteudo(p: ProdutoViagem) {
  switch (p.categoria) {
    case 'aereo':
      return (
        <>
          <View style={styles.cabecalho}>
            <Text style={styles.empresa}>{p.companhia}</Text>
            <Etiqueta texto={p.classe} cor={cores.superficieAlt} corTexto={cores.azulMarinho} />
          </View>
          <View style={styles.rota}>
            <Horario hora={p.partida} local={p.origem} />
            <View style={styles.linhaVoo}>
              <Text style={styles.duracao}>{duracao(p.duracaoMin)}</Text>
              <View style={styles.tracoVoo}>
                <View style={styles.ponto} />
                <View style={styles.traco} />
                <Ionicons name="airplane" size={14} color={cores.azul} />
                <View style={styles.traco} />
                <View style={styles.ponto} />
              </View>
              <Text style={styles.escalas}>{t.resultados.escalas(p.escalas)}</Text>
            </View>
            <Horario hora={p.chegada} local={p.destino} alinharFim />
          </View>
          <Rodape
            preco={p.preco}
            sufixo={p.bagagem ? '✓ Bagagem incluída' : 'Sem bagagem'}
          />
        </>
      );
    case 'onibus':
      return (
        <>
          <View style={styles.cabecalho}>
            <Text style={styles.empresa}>{p.empresa}</Text>
            <Etiqueta texto={p.tipo} cor={cores.superficieAlt} corTexto={cores.azulMarinho} />
          </View>
          <View style={styles.rota}>
            <Horario hora={p.partida} local={p.origem} />
            <View style={styles.linhaVoo}>
              <Text style={styles.duracao}>{duracao(p.duracaoMin)}</Text>
              <View style={styles.tracoVoo}>
                <View style={styles.ponto} />
                <View style={styles.traco} />
                <Ionicons name="bus" size={14} color={cores.azul} />
                <View style={styles.traco} />
                <View style={styles.ponto} />
              </View>
            </View>
            <Horario hora={p.chegada} local={p.destino} alinharFim />
          </View>
          <Rodape preco={p.preco} sufixo={t.resultados.assentos(p.assentos)} />
        </>
      );
    case 'hospedagem':
      return (
        <>
          <View style={styles.cabecalho}>
            <Text style={styles.empresa} numberOfLines={1}>{p.nome}</Text>
            <Estrelas quantidade={p.estrelas} />
          </View>
          <View style={styles.local}>
            <Ionicons name="location-outline" size={14} color={cores.textoSuave} />
            <Text style={styles.localTexto}>{p.cidade}, {p.uf} · {p.tipo}</Text>
          </View>
          <NotaAvaliacao nota={p.avaliacao} total={p.totalAvaliacoes} />
          <Rodape preco={p.precoNoite} sufixo={t.resultados.porNoite} />
        </>
      );
    case 'turismo':
      return (
        <>
          <Text style={styles.empresa} numberOfLines={1}>{p.titulo}</Text>
          <View style={styles.local}>
            <Ionicons name="location-outline" size={14} color={cores.textoSuave} />
            <Text style={styles.localTexto}>
              {p.destino}, {p.uf} · {t.detalhe.diasNoites(p.dias)}
            </Text>
          </View>
          <NotaAvaliacao nota={p.avaliacao} total={p.totalAvaliacoes} />
          <Rodape preco={p.preco} sufixo={t.resultados.porPessoa} />
        </>
      );
    case 'locacao':
      return (
        <>
          <View style={styles.cabecalho}>
            <Text style={styles.empresa} numberOfLines={1}>{p.modelo}</Text>
            <Etiqueta texto={p.categoriaVeiculo} cor={cores.superficieAlt} corTexto={cores.azulMarinho} />
          </View>
          <View style={styles.local}>
            <Ionicons name="location-outline" size={14} color={cores.textoSuave} />
            <Text style={styles.localTexto}>{p.locadora} · {p.cidade}, {p.uf}</Text>
          </View>
          <View style={styles.local}>
            <Ionicons name="cog-outline" size={14} color={cores.textoSuave} />
            <Text style={styles.localTexto}>
              {p.cambio} · {p.lugares} lugares{p.arCondicionado ? ' · Ar-condicionado' : ''}
            </Text>
          </View>
          <Rodape preco={p.precoDia} sufixo="/ diária" />
        </>
      );
    case 'seguro':
      return (
        <>
          <View style={styles.cabecalho}>
            <Text style={styles.empresa} numberOfLines={1}>{p.plano}</Text>
            <Etiqueta texto={p.abrangencia} cor={cores.superficieAlt} corTexto={cores.azulMarinho} />
          </View>
          <Text style={styles.localTexto}>{p.cobertura}</Text>
          <View style={styles.local}>
            <Ionicons name="medkit-outline" size={14} color={cores.textoSuave} />
            <Text style={styles.localTexto}>
              Cobertura médica de {t.comum.reais(p.coberturaMedica)}
            </Text>
          </View>
          <Rodape preco={p.precoDia} sufixo="/ dia de viagem" />
        </>
      );
  }
}

function Horario({ hora, local, alinharFim }: { hora: string; local: string; alinharFim?: boolean }) {
  return (
    <View style={{ alignItems: alinharFim ? 'flex-end' : 'flex-start' }}>
      <Text style={styles.hora}>{hora}</Text>
      <Text style={styles.localPequeno}>{local}</Text>
    </View>
  );
}

function Rodape({ preco, sufixo }: { preco: number; sufixo: string }) {
  return (
    <View style={styles.rodape}>
      <Text style={styles.sufixo}>{sufixo}</Text>
      <Text style={styles.preco}>{t.comum.reais(preco)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    marginBottom: 12,
    overflow: 'hidden',
    ...sombra,
  },
  imagem: { width: '100%', height: 150 },
  corpo: { padding: 14, gap: 10 },
  cabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  empresa: { fontSize: 16, fontWeight: '800', color: cores.azulMarinho, flex: 1, marginRight: 8 },
  rota: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hora: { fontSize: 18, fontWeight: '800', color: cores.azulMarinho },
  localPequeno: { fontSize: 12, color: cores.textoSuave, fontWeight: '600' },
  linhaVoo: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  duracao: { fontSize: 11, color: cores.textoSuave, fontWeight: '700' },
  tracoVoo: { flexDirection: 'row', alignItems: 'center', gap: 2, marginVertical: 2 },
  traco: { width: 16, height: 1.5, backgroundColor: cores.borda },
  ponto: { width: 5, height: 5, borderRadius: 999, backgroundColor: cores.azul },
  escalas: { fontSize: 11, color: cores.verde, fontWeight: '700' },
  local: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  localTexto: { fontSize: 13, color: cores.textoSuave, fontWeight: '600' },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    paddingTop: 10,
  },
  sufixo: { fontSize: 12, color: cores.textoSuave, fontWeight: '600' },
  preco: { fontSize: 20, fontWeight: '800', color: cores.verde },
});
