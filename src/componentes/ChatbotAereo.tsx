/**
 * Chatbot de Passagens Aéreas (dentro do app).
 *
 * Fluxo: coleta os dados da viagem (origem, destino, passageiros, nomes, datas,
 * classe) → cria o lead → vira um CHAT ao vivo com o consultor (polling), tudo
 * no app. O cliente é anônimo (usa um token salvo localmente). Ao final pode
 * ENTRAR na conta ou informar WhatsApp (exceção). Não há e-mail.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, sombra } from '../tema';
import { t } from '../i18n';
import {
  TENANT,
  enviarLeadAereo,
  enviarMensagemCliente,
  informarWhatsappCliente,
  listarMensagensCliente,
  type LeadAereo,
} from '../servicos';
import { useAutenticacao } from '../contextos/AutenticacaoContext';
import type { MensagemChat } from '../tipos';

type Etapa = 'origem' | 'destino' | 'passageiros' | 'nomes' | 'ida' | 'volta' | 'classe' | 'conversa';

interface MsgLocal {
  id: string;
  autor: 'bot' | 'cliente';
  texto: string;
}

interface Props {
  visivel: boolean;
  aoFechar: () => void;
}

const CHAVE = `@viajebrasil/${TENANT.id}/chatAereo`;
let seq = 0;
const novoId = () => `m${++seq}`;
const ETAPAS_TEXTO: Etapa[] = ['origem', 'destino', 'passageiros', 'nomes', 'ida', 'volta'];

export function ChatbotAereo({ visivel, aoFechar }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { autenticado } = useAutenticacao();
  const scrollRef = useRef<ScrollView>(null);

  const [mensagens, setMensagens] = useState<MsgLocal[]>([]);
  const [conversa, setConversa] = useState<MensagemChat[]>([]);
  const [etapa, setEtapa] = useState<Etapa>('origem');
  const [entrada, setEntrada] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [lead, setLead] = useState<{ id: string; token: string } | null>(null);
  const [modoWhats, setModoWhats] = useState(false);
  const [opcoesVisiveis, setOpcoesVisiveis] = useState(true);

  const dados = useRef<Partial<LeadAereo>>({});

  const addBot = useCallback((texto: string) => {
    setMensagens((m) => [...m, { id: novoId(), autor: 'bot', texto }]);
  }, []);
  const addCliente = useCallback((texto: string) => {
    setMensagens((m) => [...m, { id: novoId(), autor: 'cliente', texto }]);
  }, []);

  // (Re)inicia ou retoma a conversa quando o modal abre.
  useEffect(() => {
    if (!visivel) return;
    let ativo = true;
    (async () => {
      seq = 0;
      dados.current = {};
      setEntrada('');
      setEnviando(false);
      setModoWhats(false);
      setOpcoesVisiveis(true);
      setConversa([]);

      let salvo: { id: string; token: string } | null = null;
      try {
        const raw = await AsyncStorage.getItem(CHAVE);
        if (raw) salvo = JSON.parse(raw);
      } catch {
        salvo = null;
      }
      if (!ativo) return;

      if (salvo?.id && salvo?.token) {
        setLead(salvo);
        setEtapa('conversa');
        setMensagens([{ id: novoId(), autor: 'bot', texto: t.chatAereo.retomando }]);
      } else {
        setLead(null);
        setEtapa('origem');
        setMensagens([
          { id: novoId(), autor: 'bot', texto: t.chatAereo.saudacao },
          { id: novoId(), autor: 'bot', texto: t.chatAereo.perguntaOrigem },
        ]);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [visivel]);

  // Polling do chat enquanto a conversa está ativa.
  useEffect(() => {
    if (etapa !== 'conversa' || !lead?.id || !lead?.token) return;
    let ativo = true;
    const buscar = async () => {
      const msgs = await listarMensagensCliente(lead.id, lead.token);
      if (ativo) setConversa(msgs);
    };
    void buscar();
    const id = setInterval(buscar, 4000);
    return () => {
      ativo = false;
      clearInterval(id);
    };
  }, [etapa, lead]);

  // Mantém a conversa rolada para a última mensagem.
  useEffect(() => {
    const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(id);
  }, [mensagens, conversa, enviando]);

  const finalizar = useCallback(async () => {
    const leadDados: LeadAereo = {
      origem: dados.current.origem ?? '',
      destino: dados.current.destino ?? '',
      numeroPassageiros: dados.current.numeroPassageiros ?? 1,
      nomes: dados.current.nomes ?? [],
      dataIda: dados.current.dataIda ?? '',
      dataVolta: dados.current.dataVolta ?? null,
      classe: dados.current.classe ?? '',
      telefone: '',
    };

    setEtapa('conversa');
    addBot(t.chatAereo.resumoTitulo);
    addBot(
      [
        t.chatAereo.resumoTrecho(leadDados.origem, leadDados.destino),
        t.chatAereo.resumoPassageiros(leadDados.numeroPassageiros),
        t.chatAereo.resumoNomes(leadDados.nomes.join(', ')),
        t.chatAereo.resumoIda(leadDados.dataIda),
        t.chatAereo.resumoVolta(leadDados.dataVolta ?? t.chatAereo.somenteIda),
        t.chatAereo.resumoClasse(leadDados.classe),
      ].join('\n'),
    );
    addBot(t.chatAereo.direcionando);

    setEnviando(true);
    try {
      const r = await enviarLeadAereo(leadDados);
      if (r.leadId && r.clienteToken) {
        const novo = { id: r.leadId, token: r.clienteToken };
        setLead(novo);
        try {
          await AsyncStorage.setItem(CHAVE, JSON.stringify(novo));
        } catch {
          /* melhor-esforço */
        }
        addBot(t.chatAereo.encerramento);
      } else {
        addBot(t.chatAereo.semBackend);
      }
    } catch {
      addBot(t.chatAereo.semBackend);
    } finally {
      setEnviando(false);
    }
  }, [addBot]);

  const responder = useCallback(
    (bruto: string) => {
      const texto = bruto.trim();
      if (!texto) return;
      if (etapa === 'origem') {
        dados.current.origem = texto;
        addCliente(texto);
        setEtapa('destino');
        addBot(t.chatAereo.perguntaDestino);
      } else if (etapa === 'destino') {
        dados.current.destino = texto;
        addCliente(texto);
        setEtapa('passageiros');
        addBot(t.chatAereo.perguntaPassageiros);
      } else if (etapa === 'passageiros') {
        const n = parseInt(texto.replace(/\D/g, ''), 10);
        if (!n || n < 1 || n > 9) {
          addCliente(texto);
          addBot(t.chatAereo.erroNumero);
          return;
        }
        dados.current.numeroPassageiros = n;
        addCliente(String(n));
        setEtapa('nomes');
        addBot(t.chatAereo.perguntaNomes);
      } else if (etapa === 'nomes') {
        const nomes = texto.split(',').map((s) => s.trim()).filter(Boolean);
        dados.current.nomes = nomes;
        addCliente(nomes.join(', '));
        setEtapa('ida');
        addBot(t.chatAereo.perguntaDataIda);
      } else if (etapa === 'ida') {
        dados.current.dataIda = texto;
        addCliente(texto);
        setEtapa('volta');
        addBot(t.chatAereo.perguntaDataVolta);
      } else if (etapa === 'volta') {
        dados.current.dataVolta = texto;
        addCliente(texto);
        setEtapa('classe');
        addBot(t.chatAereo.perguntaClasse);
      }
    },
    [etapa, addBot, addCliente],
  );

  const escolherSomenteIda = useCallback(() => {
    dados.current.dataVolta = null;
    addCliente(t.chatAereo.somenteIda);
    setEtapa('classe');
    addBot(t.chatAereo.perguntaClasse);
  }, [addBot, addCliente]);

  const escolherClasse = useCallback(
    (classe: string) => {
      dados.current.classe = classe;
      addCliente(classe);
      void finalizar();
    },
    [addCliente, finalizar],
  );

  const enviarChat = useCallback(
    async (texto: string) => {
      if (!lead) return;
      await enviarMensagemCliente(lead.id, lead.token, texto);
      const msgs = await listarMensagensCliente(lead.id, lead.token);
      setConversa(msgs);
    },
    [lead],
  );

  const confirmarWhats = useCallback(
    async (texto: string) => {
      if (texto.replace(/\D/g, '').length < 10) {
        addBot(t.chatAereo.erroTelefone);
        return;
      }
      if (lead) {
        try {
          await informarWhatsappCliente(lead.id, lead.token, texto);
        } catch {
          /* ignora */
        }
      }
      setModoWhats(false);
      setOpcoesVisiveis(false);
      addBot(t.chatAereo.whatsConfirmado);
    },
    [lead, addBot],
  );

  const aoSubmeter = useCallback(() => {
    const texto = entrada.trim();
    setEntrada('');
    if (!texto) return;
    if (etapa === 'conversa') {
      if (modoWhats) void confirmarWhats(texto);
      else void enviarChat(texto);
      return;
    }
    responder(texto);
  }, [entrada, etapa, modoWhats, confirmarWhats, enviarChat, responder]);

  const novaSolicitacao = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(CHAVE);
    } catch {
      /* ignora */
    }
    seq = 0;
    dados.current = {};
    setLead(null);
    setConversa([]);
    setModoWhats(false);
    setOpcoesVisiveis(true);
    setEntrada('');
    setEtapa('origem');
    setMensagens([
      { id: novoId(), autor: 'bot', texto: t.chatAereo.saudacao },
      { id: novoId(), autor: 'bot', texto: t.chatAereo.perguntaOrigem },
    ]);
  }, []);

  const ehConversa = etapa === 'conversa';
  const mostraInput = ETAPAS_TEXTO.includes(etapa) || ehConversa;
  const placeholder = ehConversa
    ? modoWhats
      ? t.chatAereo.informeWhats
      : t.chatAereo.placeholderMensagem
    : t.chatAereo.placeholderResposta;

  return (
    <Modal visible={visivel} animationType="slide" transparent onRequestClose={aoFechar}>
      <View style={styles.fundoModal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.folha}>
          {/* Cabeçalho */}
          <View style={[styles.cabecalho, { paddingTop: insets.top ? insets.top - 4 : 14 }]}>
            <View style={styles.avatar}>
              <Ionicons name="airplane" size={20} color={cores.textoInverso} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cabTitulo}>{t.chatAereo.titulo}</Text>
              <View style={styles.statusLinha}>
                <View style={styles.pontoOnline} />
                <Text style={styles.cabSub}>
                  {t.chatAereo.subtitulo} · {t.chatAereo.online}
                </Text>
              </View>
            </View>
            {ehConversa && (
              <Pressable hitSlop={8} onPress={novaSolicitacao} accessibilityLabel={t.chatAereo.novaSolicitacao}>
                <Ionicons name="add-circle-outline" size={24} color={cores.textoInverso} />
              </Pressable>
            )}
            <Pressable hitSlop={10} onPress={aoFechar} accessibilityLabel={t.chatAereo.fechar}>
              <Ionicons name="close" size={26} color={cores.textoInverso} />
            </Pressable>
          </View>

          {/* Conversa */}
          <ScrollView
            ref={scrollRef}
            style={styles.conversa}
            contentContainerStyle={styles.conversaConteudo}
            showsVerticalScrollIndicator={false}
          >
            {mensagens.map((m) => (
              <View key={m.id} style={[styles.balao, m.autor === 'bot' ? styles.balaoBot : styles.balaoCliente]}>
                <Text style={m.autor === 'bot' ? styles.textoBot : styles.textoCliente}>{m.texto}</Text>
              </View>
            ))}
            {conversa.map((m) => (
              <View
                key={m.id}
                style={[styles.balao, m.autor === 'consultor' ? styles.balaoBot : styles.balaoCliente]}
              >
                {m.autor === 'consultor' && <Text style={styles.autorRotulo}>{t.chatAereo.consultorRotulo}</Text>}
                <Text style={m.autor === 'consultor' ? styles.textoBot : styles.textoCliente}>{m.texto}</Text>
              </View>
            ))}
            {enviando && (
              <View style={[styles.balao, styles.balaoBot, styles.digitando]}>
                <ActivityIndicator size="small" color={cores.verde} />
                <Text style={styles.digitandoTexto}>{t.chatAereo.digitando}</Text>
              </View>
            )}
          </ScrollView>

          {/* Rodapé / entrada */}
          <View style={[styles.rodape, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            {etapa === 'classe' && (
              <View style={styles.chips}>
                {t.chatAereo.classes.map((c) => (
                  <Pressable key={c} style={styles.chip} onPress={() => escolherClasse(c)}>
                    <Text style={styles.chipTexto}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {etapa === 'volta' && (
              <View style={styles.chips}>
                <Pressable style={styles.chip} onPress={escolherSomenteIda}>
                  <Ionicons name="arrow-forward" size={14} color={cores.verde} />
                  <Text style={styles.chipTexto}>{t.chatAereo.somenteIda}</Text>
                </Pressable>
              </View>
            )}

            {/* Opções: entrar ou WhatsApp (somente na conversa) */}
            {ehConversa && opcoesVisiveis && !modoWhats && lead && (
              <View style={styles.opcoes}>
                <Text style={styles.opcoesTexto}>{t.chatAereo.ofereceConta}</Text>
                <View style={styles.chips}>
                  {!autenticado && (
                    <Pressable style={styles.chip} onPress={() => router.push('/login')}>
                      <Ionicons name="person-outline" size={14} color={cores.verde} />
                      <Text style={styles.chipTexto}>{t.chatAereo.fazerLogin}</Text>
                    </Pressable>
                  )}
                  <Pressable style={styles.chip} onPress={() => setModoWhats(true)}>
                    <Ionicons name="logo-whatsapp" size={14} color={cores.verde} />
                    <Text style={styles.chipTexto}>{t.chatAereo.prefiroWhats}</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {mostraInput && (
              <View style={styles.entradaLinha}>
                <TextInput
                  style={styles.input}
                  placeholder={placeholder}
                  placeholderTextColor={cores.textoClaro}
                  value={entrada}
                  onChangeText={setEntrada}
                  onSubmitEditing={aoSubmeter}
                  returnKeyType="send"
                  keyboardType={etapa === 'passageiros' ? 'number-pad' : modoWhats ? 'phone-pad' : 'default'}
                />
                <Pressable
                  style={[styles.botaoEnviar, !entrada.trim() && styles.botaoEnviarOff]}
                  onPress={aoSubmeter}
                  disabled={!entrada.trim()}
                  accessibilityLabel={t.chatAereo.enviar}
                >
                  <Ionicons name="send" size={18} color={cores.textoInverso} />
                </Pressable>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundoModal: { flex: 1, backgroundColor: 'rgba(13,28,54,0.45)', justifyContent: 'flex-end' },
  folha: {
    height: '88%',
    backgroundColor: cores.fundo,
    borderTopLeftRadius: raio.xl,
    borderTopRightRadius: raio.xl,
    overflow: 'hidden',
  },
  cabecalho: {
    backgroundColor: cores.azulMarinho,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  avatar: { width: 40, height: 40, borderRadius: 999, backgroundColor: cores.verde, alignItems: 'center', justifyContent: 'center' },
  cabTitulo: { color: cores.textoInverso, fontWeight: '800', fontSize: 16 },
  statusLinha: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  pontoOnline: { width: 8, height: 8, borderRadius: 999, backgroundColor: cores.verde },
  cabSub: { color: cores.textoInverso, opacity: 0.85, fontSize: 12, fontWeight: '600' },

  conversa: { flex: 1, backgroundColor: cores.fundo },
  conversaConteudo: { padding: 16, gap: 10 },
  balao: { maxWidth: '82%', borderRadius: raio.lg, paddingVertical: 10, paddingHorizontal: 14, ...sombra },
  balaoBot: { alignSelf: 'flex-start', backgroundColor: cores.superficie, borderTopLeftRadius: 4 },
  balaoCliente: { alignSelf: 'flex-end', backgroundColor: cores.verde, borderTopRightRadius: 4 },
  autorRotulo: { color: cores.verde, fontSize: 11, fontWeight: '800', marginBottom: 2 },
  textoBot: { color: cores.texto, fontSize: 14, lineHeight: 20, fontWeight: '500' },
  textoCliente: { color: cores.textoInverso, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  digitando: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  digitandoTexto: { color: cores.textoSuave, fontSize: 13, fontWeight: '600' },

  rodape: {
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    backgroundColor: cores.superficie,
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 10,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: cores.verde,
    borderRadius: raio.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: cores.superficie,
  },
  chipTexto: { color: cores.verde, fontWeight: '800', fontSize: 13 },
  opcoes: { gap: 8 },
  opcoesTexto: { color: cores.textoSuave, fontSize: 12, fontWeight: '600' },
  entradaLinha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    flex: 1,
    backgroundColor: cores.fundo,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.pill,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    color: cores.texto,
    fontSize: 14,
    fontWeight: '500',
  },
  botaoEnviar: { width: 44, height: 44, borderRadius: 999, backgroundColor: cores.verde, alignItems: 'center', justifyContent: 'center' },
  botaoEnviarOff: { opacity: 0.4 },
});
