/**
 * Aba "Atendimento" — chat GERAL e livre com um consultor.
 *
 * Diferente do chatbot de Passagens Aéreas (que coleta dados de viagem): aqui o
 * cliente manda QUALQUER mensagem e ela vai para um consultor responder (fila
 * própria, isolada dos leads aéreos). O cliente é anônimo (token salvo no
 * dispositivo). Quem preferir pode ser atendido pelo WhatsApp (exceção).
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, sombra } from '../../src/tema';
import { t } from '../../src/i18n';
import {
  TENANT,
  criarAtendimento,
  enviarMensagemAtendimentoCliente,
  linkWhatsApp,
  listarMensagensAtendimentoCliente,
} from '../../src/servicos';
import { empresa } from '../../src/dados/empresa';
import type { MensagemChat } from '../../src/tipos';

const CHAVE = `@viajebrasil/${TENANT.id}/atendimentoGeral`;

interface MsgLocal {
  id: string;
  autor: 'bot' | 'cliente';
  texto: string;
}

let seq = 0;
const novoId = () => `a${++seq}`;

export default function Atendimento() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [info, setInfo] = useState<MsgLocal[]>([]);
  const [conversa, setConversa] = useState<MensagemChat[]>([]);
  const [atendimento, setAtendimento] = useState<{ id: string; token: string } | null>(null);
  const [entrada, setEntrada] = useState('');
  const [enviando, setEnviando] = useState(false);

  const addBot = useCallback((texto: string) => {
    setInfo((m) => [...m, { id: novoId(), autor: 'bot', texto }]);
  }, []);

  // (Re)inicia ou retoma a conversa quando a aba ganha foco.
  const iniciar = useCallback(async () => {
    seq = 0;
    setEntrada('');
    setEnviando(false);
    setConversa([]);
    let salvo: { id: string; token: string } | null = null;
    try {
      const raw = await AsyncStorage.getItem(CHAVE);
      if (raw) salvo = JSON.parse(raw);
    } catch {
      salvo = null;
    }
    if (salvo?.id && salvo?.token) {
      setAtendimento(salvo);
      setInfo([{ id: novoId(), autor: 'bot', texto: t.atendimento.retomando }]);
    } else {
      setAtendimento(null);
      setInfo([{ id: novoId(), autor: 'bot', texto: t.atendimento.saudacao }]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void iniciar();
    }, [iniciar]),
  );

  // Polling das mensagens enquanto há atendimento ativo.
  useEffect(() => {
    if (!atendimento?.id || !atendimento?.token) return;
    let ativo = true;
    const buscar = async () => {
      const msgs = await listarMensagensAtendimentoCliente(atendimento.id, atendimento.token);
      if (ativo) setConversa(msgs);
    };
    void buscar();
    const id = setInterval(buscar, 4000);
    return () => {
      ativo = false;
      clearInterval(id);
    };
  }, [atendimento]);

  // Mantém a conversa rolada para a última mensagem.
  useEffect(() => {
    const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(id);
  }, [info, conversa, enviando]);

  const enviar = useCallback(async () => {
    const texto = entrada.trim();
    if (!texto || enviando) return;
    setEntrada('');

    // Conversa já criada → só envia a mensagem.
    if (atendimento) {
      await enviarMensagemAtendimentoCliente(atendimento.id, atendimento.token, texto);
      const msgs = await listarMensagensAtendimentoCliente(atendimento.id, atendimento.token);
      setConversa(msgs);
      return;
    }

    // Primeira mensagem → cria o atendimento (round-robin no backend).
    setEnviando(true);
    try {
      const r = await criarAtendimento(texto);
      if (r.atendimentoId && r.clienteToken) {
        const novo = { id: r.atendimentoId, token: r.clienteToken };
        setAtendimento(novo);
        try {
          await AsyncStorage.setItem(CHAVE, JSON.stringify(novo));
        } catch {
          /* melhor-esforço */
        }
        addBot(t.atendimento.encaminhado);
      } else {
        addBot(t.atendimento.semBackend);
      }
    } catch {
      addBot(t.atendimento.semBackend);
    } finally {
      setEnviando(false);
    }
  }, [entrada, enviando, atendimento, addBot]);

  const abrirWhatsApp = useCallback(() => {
    const link = linkWhatsApp(empresa.whatsapp, t.atendimento.whatsTexto) ?? empresa.whatsappUrl;
    void Linking.openURL(link);
  }, []);

  const novoAtendimento = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(CHAVE);
    } catch {
      /* ignora */
    }
    await iniciar();
  }, [iniciar]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.tela}
    >
      {/* Cabeçalho */}
      <View style={[styles.cabecalho, { paddingTop: insets.top + 12 }]}>
        <View style={styles.avatar}>
          <Ionicons name="chatbubbles" size={20} color={cores.textoInverso} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cabTitulo}>{t.atendimento.chatTitulo}</Text>
          <View style={styles.statusLinha}>
            <View style={styles.pontoOnline} />
            <Text style={styles.cabSub}>
              {t.atendimento.chatSub} · {t.atendimento.online}
            </Text>
          </View>
        </View>
        {atendimento && (
          <Pressable hitSlop={8} onPress={novoAtendimento} accessibilityLabel={t.atendimento.novoAtendimento}>
            <Ionicons name="add-circle-outline" size={24} color={cores.textoInverso} />
          </Pressable>
        )}
      </View>

      {/* Conversa */}
      <ScrollView
        ref={scrollRef}
        style={styles.conversa}
        contentContainerStyle={styles.conversaConteudo}
        showsVerticalScrollIndicator={false}
      >
        {info.map((m) => (
          <View key={m.id} style={[styles.balao, styles.balaoBot]}>
            <Text style={styles.textoBot}>{m.texto}</Text>
          </View>
        ))}
        {conversa.map((m) => (
          <View
            key={m.id}
            style={[styles.balao, m.autor === 'consultor' ? styles.balaoBot : styles.balaoCliente]}
          >
            {m.autor === 'consultor' && <Text style={styles.autorRotulo}>{t.atendimento.consultorRotulo}</Text>}
            <Text style={m.autor === 'consultor' ? styles.textoBot : styles.textoCliente}>{m.texto}</Text>
          </View>
        ))}
        {enviando && (
          <View style={[styles.balao, styles.balaoBot, styles.digitando]}>
            <ActivityIndicator size="small" color={cores.verde} />
            <Text style={styles.digitandoTexto}>{t.atendimento.enviando}</Text>
          </View>
        )}
      </ScrollView>

      {/* Rodapé / entrada */}
      <View style={[styles.rodape, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.opcoes}>
          <Text style={styles.opcoesTexto}>{t.atendimento.ofereceWhats}</Text>
          <Pressable style={styles.chip} onPress={abrirWhatsApp}>
            <Ionicons name="logo-whatsapp" size={14} color={cores.verde} />
            <Text style={styles.chipTexto}>{t.atendimento.prefiroWhats}</Text>
          </Pressable>
        </View>

        <View style={styles.entradaLinha}>
          <TextInput
            style={styles.input}
            placeholder={atendimento ? t.atendimento.placeholderMensagem : t.atendimento.placeholderPrimeira}
            placeholderTextColor={cores.textoClaro}
            value={entrada}
            onChangeText={setEntrada}
            onSubmitEditing={enviar}
            returnKeyType="send"
            multiline
          />
          <Pressable
            style={[styles.botaoEnviar, (!entrada.trim() || enviando) && styles.botaoEnviarOff]}
            onPress={enviar}
            disabled={!entrada.trim() || enviando}
            accessibilityLabel={t.atendimento.enviar}
          >
            <Ionicons name="send" size={18} color={cores.textoInverso} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
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
  opcoes: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  opcoesTexto: { color: cores.textoSuave, fontSize: 12, fontWeight: '600', flexShrink: 1 },
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
  entradaLinha: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: cores.fundo,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.lg,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    color: cores.texto,
    fontSize: 14,
    fontWeight: '500',
  },
  botaoEnviar: { width: 44, height: 44, borderRadius: 999, backgroundColor: cores.verde, alignItems: 'center', justifyContent: 'center' },
  botaoEnviarOff: { opacity: 0.4 },
});
