import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio } from '../../src/tema';
import { t } from '../../src/i18n';
import {
  CarrosselOfertas,
  CartaoDestino,
  CartaoPacote,
  GradeCategorias,
  LogoMarca,
  TituloSecao,
} from '../../src/componentes';
import { listarDestinos, listarOfertas, listarPacotes } from '../../src/servicos';
import { useAsync } from '../../src/hooks/useAsync';
import type { Categoria } from '../../src/tipos';

export default function Inicio() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { dados: banners = [] } = useAsync(listarOfertas, []);
  const { dados: destinos = [] } = useAsync(listarDestinos, []);
  const { dados: pacotes = [] } = useAsync(listarPacotes, []);

  const irParaBusca = (categoria: Categoria) =>
    router.push({ pathname: '/buscar', params: { categoria } });

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabeçalho */}
      <View style={[styles.cabecalho, { paddingTop: insets.top + 12 }]}>
        <View style={styles.topo}>
          <LogoMarca tamanho={44} />
          <Text style={styles.marca}>
            <Text style={{ color: cores.textoInverso }}>viaje</Text>
            <Text style={{ color: cores.amarelo }}>brasil</Text>
          </Text>
          <View style={{ flex: 1 }} />
          <Pressable hitSlop={8} onPress={() => router.push('/perfil')}>
            <Ionicons name="notifications-outline" size={24} color={cores.textoInverso} />
          </Pressable>
        </View>
        <Text style={styles.saudacao}>{t.inicio.saudacao}</Text>
        <Text style={styles.subSaudacao}>{t.inicio.subSaudacao}</Text>

        {/* Barra de busca rápida */}
        <Pressable style={styles.busca} onPress={() => router.push('/buscar')}>
          <Ionicons name="search" size={20} color={cores.azul} />
          <Text style={styles.buscaTexto}>{t.busca.cidadeDestino}</Text>
        </Pressable>
      </View>

      {/* Categorias */}
      <View style={styles.gradeWrap}>
        <GradeCategorias aoSelecionar={irParaBusca} />
      </View>

      {/* Carrossel de ofertas */}
      <TituloSecao titulo={t.inicio.ofertasDestaque} />
      <CarrosselOfertas
        banners={banners}
        aoTocar={(b) => router.push({ pathname: '/buscar', params: { categoria: b.categoria } })}
      />

      {/* Destinos populares */}
      <TituloSecao
        titulo={t.inicio.destinosPopulares}
        aoVerTudo={() => irParaBusca('aereo')}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carrosselH}
      >
        {destinos.map((d) => (
          <CartaoDestino
            key={d.id}
            destino={d}
            aoTocar={() =>
              router.push({
                pathname: '/resultados',
                params: { categoria: 'aereo', destino: d.cidade },
              })
            }
          />
        ))}
      </ScrollView>

      {/* Pacotes imperdíveis */}
      <TituloSecao
        titulo={t.inicio.pacotesImperdiveis}
        aoVerTudo={() => irParaBusca('turismo')}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carrosselH}
      >
        {pacotes.map((p) => (
          <CartaoPacote
            key={p.id}
            pacote={p}
            aoTocar={() =>
              router.push({ pathname: '/detalhe', params: { id: p.id } })
            }
          />
        ))}
      </ScrollView>

      {/* Selo de confiança */}
      <View style={styles.selo}>
        <Ionicons name="shield-checkmark" size={22} color={cores.verde} />
        <View style={{ flex: 1 }}>
          <Text style={styles.seloTitulo}>Compra 100% segura</Text>
          <Text style={styles.seloTexto}>
            Seus dados protegidos com criptografia bancária
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: {
    backgroundColor: cores.azulMarinho,
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: raio.xl,
    borderBottomRightRadius: raio.xl,
  },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  marca: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  saudacao: { color: cores.textoInverso, fontSize: 24, fontWeight: '800', marginTop: 18 },
  subSaudacao: { color: cores.textoInverso, opacity: 0.85, fontSize: 14, marginTop: 4 },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cores.superficie,
    borderRadius: raio.pill,
    paddingHorizontal: 18,
    height: 52,
    marginTop: 18,
  },
  buscaTexto: { color: cores.textoSuave, fontSize: 15, fontWeight: '600' },
  gradeWrap: { marginTop: 20 },
  carrosselH: { paddingHorizontal: 16 },
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    margin: 16,
    marginTop: 28,
    padding: 16,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  seloTitulo: { fontWeight: '800', color: cores.azulMarinho, fontSize: 14 },
  seloTexto: { color: cores.textoSuave, fontSize: 12, marginTop: 2 },
});
