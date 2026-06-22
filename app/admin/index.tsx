import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores, espaco, tipografia } from '../../src/tema';
import { t } from '../../src/i18n';
import { Cartao, CartaoEstatistica, HeroGradiente } from '../../src/componentes';
import { useAutenticacao } from '../../src/contextos/AutenticacaoContext';
import { obterEstatisticas, type EstatisticasAdmin } from '../../src/servicos';

function contar(porStatus: EstatisticasAdmin['porStatus'], status: string): number {
  return porStatus.find((s) => s.status === status)?.n ?? 0;
}

export default function PainelAdmin() {
  const router = useRouter();
  const { sair, definirModo } = useAutenticacao();
  const [stats, setStats] = useState<EstatisticasAdmin | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setStats(await obterEstatisticas());
    } catch {
      setErro(t.admin.erro);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void carregar();
    }, [carregar]),
  );

  return (
    <View style={styles.tela}>
      <HeroGradiente
        eyebrow="ViajeBrasil"
        titulo={t.admin.titulo}
        topo={
          <View style={styles.topo}>
            <Pressable
              hitSlop={8}
              onPress={() => {
                definirModo('cliente');
                router.replace('/(tabs)');
              }}
              accessibilityLabel={t.perfil.verComoCliente}
            >
              <Ionicons name="eye-outline" size={22} color={cores.textoInverso} />
            </Pressable>
            <Pressable hitSlop={8} onPress={sair}>
              <Ionicons name="log-out-outline" size={22} color={cores.textoInverso} />
            </Pressable>
          </View>
        }
      />

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={cores.verde} />
        </View>
      ) : erro ? (
        <View style={styles.centro}>
          <Text style={styles.aviso}>{erro}</Text>
        </View>
      ) : stats ? (
        <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
          {/* Ações */}
          <View style={styles.acoes}>
            <Pressable style={styles.acao} onPress={() => router.push('/painel')}>
              <Ionicons name="list" size={18} color={cores.verde} />
              <Text style={styles.acaoTexto}>{t.admin.abreLeads}</Text>
            </Pressable>
            <Pressable style={styles.acao} onPress={() => router.push('/painel?aba=atendimentos')}>
              <Ionicons name="chatbubbles" size={18} color={cores.verde} />
              <Text style={styles.acaoTexto}>{t.admin.abreAtendimentos}</Text>
            </Pressable>
            <Pressable style={styles.acao} onPress={() => router.push('/admin/ofertas')}>
              <Ionicons name="pricetags" size={18} color={cores.verde} />
              <Text style={styles.acaoTexto}>{t.admin.abreOfertas}</Text>
            </Pressable>
          </View>

          {/* Métricas */}
          <View style={styles.metricas}>
            <CartaoEstatistica rotulo={t.admin.total} valor={stats.total} icone="airplane" cor={cores.azul} />
            <CartaoEstatistica rotulo={t.admin.novos} valor={contar(stats.porStatus, 'novo')} icone="sparkles" cor={cores.laranja} />
            <CartaoEstatistica rotulo={t.admin.convertidos} valor={stats.convertidos} icone="checkmark-circle" cor={cores.verde} />
            <CartaoEstatistica rotulo={t.admin.conversao} valor={`${stats.conversao}%`} icone="trending-up" cor={cores.amarelo} />
          </View>

          {/* Por consultor */}
          <Text style={styles.secao}>{t.admin.porConsultor}</Text>
          <Cartao elevacao="sm" style={{ gap: espaco.sm }}>
            {stats.porConsultor.length === 0 ? (
              <Text style={styles.aviso}>—</Text>
            ) : (
              stats.porConsultor.map((c) => (
                <View key={c.id} style={styles.consultorLinha}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.consultorNome}>{c.nome || c.email}</Text>
                    <Text style={styles.consultorEmail}>{c.email}</Text>
                  </View>
                  <Text style={styles.consultorLeads}>{t.admin.leadsDe(c.leads)}</Text>
                </View>
              ))
            )}
          </Cartao>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  topo: { flexDirection: 'row', justifyContent: 'space-between' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: espaco.xl },
  aviso: { ...tipografia.corpoSuave, color: cores.textoSuave },
  conteudo: { padding: espaco.lg, gap: espaco.lg },
  acoes: { flexDirection: 'row', gap: espaco.md },
  acao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.sm,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 12,
    paddingVertical: espaco.md,
  },
  acaoTexto: { ...tipografia.legenda, color: cores.azulMarinho },
  metricas: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.md },
  secao: { ...tipografia.secao, color: cores.azulMarinho },
  consultorLinha: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  consultorNome: { ...tipografia.corpo, color: cores.texto, fontWeight: '700' },
  consultorEmail: { ...tipografia.legenda, color: cores.textoClaro },
  consultorLeads: { ...tipografia.corpoSuave, color: cores.verde, fontWeight: '800' },
});
