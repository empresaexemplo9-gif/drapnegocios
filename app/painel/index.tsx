import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores, espaco, tipografia } from '../../src/tema';
import { t } from '../../src/i18n';
import { Cartao, Chip, HeroGradiente, Selo, tomStatusLead } from '../../src/componentes';
import { useAutenticacao } from '../../src/contextos/AutenticacaoContext';
import { listarAtendimentos, listarLeads } from '../../src/servicos';
import type { Atendimento, Lead, StatusAtendimento, StatusLead } from '../../src/tipos';

type Aba = 'leads' | 'atendimentos';

const FILTROS: (StatusLead | 'todos')[] = [
  'todos',
  'novo',
  'atribuido',
  'em_atendimento',
  'convertido',
  'perdido',
];

function formatarData(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

/** Tom do Selo conforme o status do atendimento geral. */
function tomStatusAtendimento(status: StatusAtendimento): 'azul' | 'amarelo' | 'verde' {
  if (status === 'resolvido') return 'verde';
  if (status === 'em_atendimento') return 'amarelo';
  return 'azul';
}

export default function PainelLeads() {
  const router = useRouter();
  const { aba: abaParam } = useLocalSearchParams<{ aba?: string }>();
  const { usuario, sair, definirModo } = useAutenticacao();
  const [aba, setAba] = useState<Aba>(abaParam === 'atendimentos' ? 'atendimentos' : 'leads');
  const [filtro, setFiltro] = useState<StatusLead | 'todos'>('todos');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      if (aba === 'leads') {
        setLeads(await listarLeads(filtro === 'todos' ? {} : { status: filtro }));
      } else {
        setAtendimentos(await listarAtendimentos());
      }
    } catch {
      setErro(aba === 'leads' ? t.painel.erro : t.painel.erroAtendimentos);
    } finally {
      setCarregando(false);
    }
  }, [aba, filtro]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  // Recarrega ao voltar do detalhe (status pode ter mudado).
  useFocusEffect(
    useCallback(() => {
      void carregar();
    }, [carregar]),
  );

  return (
    <View style={styles.tela}>
      <HeroGradiente
        eyebrow={t.painel.subtitulo}
        titulo={t.painel.titulo}
        subtitulo={usuario?.nome ? `Olá, ${usuario.nome}` : undefined}
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

      {/* Alternância entre as duas filas (isoladas) */}
      <View style={styles.segmentos}>
        <Segmento
          rotulo={t.painel.abaLeads}
          icone="airplane"
          ativo={aba === 'leads'}
          aoTocar={() => setAba('leads')}
        />
        <Segmento
          rotulo={t.painel.abaAtendimentos}
          icone="chatbubbles"
          ativo={aba === 'atendimentos'}
          aoTocar={() => setAba('atendimentos')}
        />
      </View>

      {aba === 'leads' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtros}
          style={styles.filtrosBar}
        >
          {FILTROS.map((f) => (
            <Chip
              key={f}
              rotulo={f === 'todos' ? t.statusLead.todos : t.statusLead[f]}
              selecionado={filtro === f}
              aoPressionar={() => setFiltro(f)}
            />
          ))}
        </ScrollView>
      )}

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={cores.verde} />
          <Text style={styles.aviso}>{aba === 'leads' ? t.painel.carregando : t.painel.carregandoAtendimentos}</Text>
        </View>
      ) : erro ? (
        <View style={styles.centro}>
          <Ionicons name="cloud-offline-outline" size={40} color={cores.textoClaro} />
          <Text style={styles.aviso}>{erro}</Text>
        </View>
      ) : aba === 'leads' ? (
        leads.length === 0 ? (
          <View style={styles.centro}>
            <Ionicons name="airplane-outline" size={40} color={cores.textoClaro} />
            <Text style={styles.aviso}>{t.painel.vazio}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
            {leads.map((l) => (
              <Cartao key={l.id} elevacao="sm" aoPressionar={() => router.push(`/painel/${l.id}`)} style={styles.item}>
                <View style={styles.itemTopo}>
                  <Text style={styles.trecho} numberOfLines={1}>
                    {(l.origem_cidade || '—') + ' → ' + (l.destino_cidade || '—')}
                  </Text>
                  <Selo texto={t.statusLead[l.status]} tom={tomStatusLead(l.status)} />
                </View>
                <Text style={styles.sub}>
                  {l.numero_passageiros} {l.numero_passageiros === 1 ? 'passageiro' : 'passageiros'} ·{' '}
                  {l.classe || '—'} · {l.data_volta ? `${l.data_ida} → ${l.data_volta}` : t.painel.somenteIda}
                </Text>
                <View style={styles.itemRodape}>
                  <Text style={styles.contato} numberOfLines={1}>
                    {l.contato_nome || (l.nomes?.[0] ?? '—')}
                  </Text>
                  <Text style={styles.tempo}>{formatarData(l.criado_em)}</Text>
                </View>
              </Cartao>
            ))}
          </ScrollView>
        )
      ) : atendimentos.length === 0 ? (
        <View style={styles.centro}>
          <Ionicons name="chatbubbles-outline" size={40} color={cores.textoClaro} />
          <Text style={styles.aviso}>{t.painel.vazioAtendimentos}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
          {atendimentos.map((a) => (
            <Cartao
              key={a.id}
              elevacao="sm"
              aoPressionar={() => router.push(`/painel/atendimento/${a.id}`)}
              style={styles.item}
            >
              <View style={styles.itemTopo}>
                <Text style={styles.trecho} numberOfLines={1}>
                  {a.ultimo_autor === 'consultor' ? `${t.painel.voce}: ` : ''}
                  {a.ultima_mensagem || t.painel.semMensagemAinda}
                </Text>
                <Selo texto={t.statusAtendimento[a.status]} tom={tomStatusAtendimento(a.status)} />
              </View>
              <View style={styles.itemRodape}>
                <Text style={styles.contato} numberOfLines={1}>
                  {t.painel.tituloAtendimento}
                </Text>
                <Text style={styles.tempo}>{formatarData(a.ultima_em || a.criado_em)}</Text>
              </View>
            </Cartao>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function Segmento({
  rotulo,
  icone,
  ativo,
  aoTocar,
}: {
  rotulo: string;
  icone: keyof typeof Ionicons.glyphMap;
  ativo: boolean;
  aoTocar: () => void;
}) {
  return (
    <Pressable style={[styles.segmento, ativo && styles.segmentoAtivo]} onPress={aoTocar}>
      <Ionicons name={icone} size={16} color={ativo ? cores.textoInverso : cores.textoSuave} />
      <Text style={[styles.segmentoTexto, ativo && styles.segmentoTextoAtivo]} numberOfLines={1}>
        {rotulo}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  topo: { flexDirection: 'row', justifyContent: 'space-between' },
  segmentos: {
    flexDirection: 'row',
    gap: espaco.sm,
    paddingHorizontal: espaco.lg,
    paddingTop: espaco.md,
  },
  segmento: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.xs,
    paddingVertical: espaco.sm,
    borderRadius: 999,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  segmentoAtivo: { backgroundColor: cores.azulMarinho, borderColor: cores.azulMarinho },
  segmentoTexto: { ...tipografia.legenda, color: cores.textoSuave },
  segmentoTextoAtivo: { color: cores.textoInverso },
  filtrosBar: { flexGrow: 0 },
  filtros: { paddingHorizontal: espaco.lg, paddingVertical: espaco.md, gap: espaco.sm },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: espaco.sm, padding: espaco.xl },
  aviso: { ...tipografia.corpoSuave, color: cores.textoSuave, textAlign: 'center' },
  lista: { paddingHorizontal: espaco.lg, paddingTop: espaco.md, paddingBottom: espaco.xxl, gap: espaco.md },
  item: { gap: espaco.xs },
  itemTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: espaco.sm },
  trecho: { ...tipografia.subtitulo, color: cores.azulMarinho, flex: 1 },
  sub: { ...tipografia.corpoSuave, color: cores.textoSuave },
  itemRodape: { flexDirection: 'row', justifyContent: 'space-between', marginTop: espaco.xs },
  contato: { ...tipografia.legenda, color: cores.texto, flex: 1 },
  tempo: { ...tipografia.legenda, color: cores.textoClaro },
});
