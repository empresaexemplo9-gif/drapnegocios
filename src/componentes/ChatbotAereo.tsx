/**
 * Chatbot de atendimento de Passagens Aéreas (dentro do app).
 *
 * Abre como uma folha modal quando o cliente toca no card "Passagens Aéreas".
 * Coleta, em conversa, os dados da viagem (passageiros, nomes, datas e classe)
 * e, ao iniciar e ao concluir, aciona os serviços de lead que avisam um
 * consultor por e-mail (server-side, no modo `api`). Ao final, exibe a mensagem
 * de direcionamento ao consultor.
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
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, sombra } from '../tema';
import { t } from '../i18n';
import {
  enviarLeadAereo,
  notificarInicioAtendimentoAereo,
  type LeadAereo,
} from '../servicos';

/** Etapas da conversa, em ordem. */
type Etapa = 'passageiros' | 'nomes' | 'ida' | 'volta' | 'classe' | 'final';

interface Mensagem {
  id: string;
  autor: 'bot' | 'cliente';
  texto: string;
}

interface Props {
  visivel: boolean;
  aoFechar: () => void;
}

let seq = 0;
const novoId = () => `m${++seq}`;

export function ChatbotAereo({ visivel, aoFechar }: Props) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [etapa, setEtapa] = useState<Etapa>('passageiros');
  const [entrada, setEntrada] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Dados coletados ao longo da conversa.
  const dados = useRef<Partial<LeadAereo>>({});

  const adicionarBot = useCallback((texto: string) => {
    setMensagens((ms) => [...ms, { id: novoId(), autor: 'bot', texto }]);
  }, []);

  const adicionarCliente = useCallback((texto: string) => {
    setMensagens((ms) => [...ms, { id: novoId(), autor: 'cliente', texto }]);
  }, []);

  // (Re)inicia a conversa toda vez que o modal abre.
  useEffect(() => {
    if (!visivel) return;
    seq = 0;
    dados.current = {};
    setEntrada('');
    setEnviando(false);
    setEtapa('passageiros');
    setMensagens([
      { id: novoId(), autor: 'bot', texto: t.chatAereo.saudacao },
      { id: novoId(), autor: 'bot', texto: t.chatAereo.perguntaPassageiros },
    ]);
    // Gatilho do botão: avisa que um atendimento foi iniciado (melhor-esforço).
    void notificarInicioAtendimentoAereo();
  }, [visivel]);

  // Mantém a conversa rolada para a última mensagem.
  useEffect(() => {
    const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(id);
  }, [mensagens]);

  /** Finaliza: monta o lead, envia ao backend e exibe o direcionamento. */
  const finalizar = useCallback(async () => {
    const lead: LeadAereo = {
      numeroPassageiros: dados.current.numeroPassageiros ?? 1,
      nomes: dados.current.nomes ?? [],
      dataIda: dados.current.dataIda ?? '',
      dataVolta: dados.current.dataVolta ?? null,
      classe: dados.current.classe ?? '',
    };

    setEtapa('final');
    adicionarBot(t.chatAereo.resumoTitulo);
    adicionarBot(
      [
        t.chatAereo.resumoPassageiros(lead.numeroPassageiros),
        t.chatAereo.resumoNomes(lead.nomes.join(', ')),
        t.chatAereo.resumoIda(lead.dataIda),
        t.chatAereo.resumoVolta(lead.dataVolta ?? t.chatAereo.somenteIda),
        t.chatAereo.resumoClasse(lead.classe),
      ].join('\n'),
    );

    setEnviando(true);
    try {
      await enviarLeadAereo(lead);
      adicionarBot(t.chatAereo.direcionando);
      adicionarBot(t.chatAereo.encerramento);
    } catch {
      adicionarBot(t.chatAereo.direcionando);
      adicionarBot(t.chatAereo.erroEnvio);
    } finally {
      setEnviando(false);
    }
  }, [adicionarBot]);

  /** Processa uma resposta livre (texto) conforme a etapa atual. */
  const responder = useCallback(
    (textoBruto: string) => {
      const texto = textoBruto.trim();
      if (!texto) return;

      if (etapa === 'passageiros') {
        const n = parseInt(texto.replace(/\D/g, ''), 10);
        if (!n || n < 1 || n > 9) {
          adicionarCliente(texto);
          adicionarBot(t.chatAereo.erroNumero);
          return;
        }
        dados.current.numeroPassageiros = n;
        adicionarCliente(String(n));
        setEtapa('nomes');
        adicionarBot(t.chatAereo.perguntaNomes);
        return;
      }

      if (etapa === 'nomes') {
        const nomes = texto
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        dados.current.nomes = nomes;
        adicionarCliente(nomes.join(', '));
        setEtapa('ida');
        adicionarBot(t.chatAereo.perguntaDataIda);
        return;
      }

      if (etapa === 'ida') {
        dados.current.dataIda = texto;
        adicionarCliente(texto);
        setEtapa('volta');
        adicionarBot(t.chatAereo.perguntaDataVolta);
        return;
      }

      if (etapa === 'volta') {
        dados.current.dataVolta = texto;
        adicionarCliente(texto);
        setEtapa('classe');
        adicionarBot(t.chatAereo.perguntaClasse);
        return;
      }
    },
    [etapa, adicionarBot, adicionarCliente],
  );

  /** Botão "Somente ida" na etapa de volta. */
  const escolherSomenteIda = useCallback(() => {
    dados.current.dataVolta = null;
    adicionarCliente(t.chatAereo.somenteIda);
    setEtapa('classe');
    adicionarBot(t.chatAereo.perguntaClasse);
  }, [adicionarBot, adicionarCliente]);

  /** Escolha de classe (chips) — encerra a coleta e finaliza. */
  const escolherClasse = useCallback(
    (classe: string) => {
      dados.current.classe = classe;
      adicionarCliente(classe);
      void finalizar();
    },
    [adicionarCliente, finalizar],
  );

  const enviarEntrada = useCallback(() => {
    const texto = entrada;
    setEntrada('');
    responder(texto);
  }, [entrada, responder]);

  // Quais controles aparecem no rodapé conforme a etapa.
  const mostraCampoTexto = etapa === 'passageiros' || etapa === 'nomes' || etapa === 'ida' || etapa === 'volta';
  const mostraClasses = etapa === 'classe';

  return (
    <Modal visible={visivel} animationType="slide" transparent onRequestClose={aoFechar}>
      <View style={styles.fundoModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.folha}
        >
          {/* Cabeçalho do consultor */}
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
              <View
                key={m.id}
                style={[styles.balao, m.autor === 'bot' ? styles.balaoBot : styles.balaoCliente]}
              >
                <Text style={m.autor === 'bot' ? styles.textoBot : styles.textoCliente}>
                  {m.texto}
                </Text>
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
            {mostraClasses && (
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

            {mostraCampoTexto && (
              <View style={styles.entradaLinha}>
                <TextInput
                  style={styles.input}
                  placeholder={t.chatAereo.placeholderResposta}
                  placeholderTextColor={cores.textoClaro}
                  value={entrada}
                  onChangeText={setEntrada}
                  onSubmitEditing={enviarEntrada}
                  returnKeyType="send"
                  keyboardType={etapa === 'passageiros' ? 'number-pad' : 'default'}
                  autoFocus={false}
                />
                <Pressable
                  style={[styles.botaoEnviar, !entrada.trim() && styles.botaoEnviarOff]}
                  onPress={enviarEntrada}
                  disabled={!entrada.trim()}
                  accessibilityLabel={t.chatAereo.enviar}
                >
                  <Ionicons name="send" size={18} color={cores.textoInverso} />
                </Pressable>
              </View>
            )}

            {etapa === 'final' && (
              <Pressable style={styles.botaoFechar} onPress={aoFechar}>
                <Text style={styles.botaoFecharTexto}>{t.chatAereo.fechar}</Text>
              </Pressable>
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: cores.verde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cabTitulo: { color: cores.textoInverso, fontWeight: '800', fontSize: 16 },
  statusLinha: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  pontoOnline: { width: 8, height: 8, borderRadius: 999, backgroundColor: cores.verde },
  cabSub: { color: cores.textoInverso, opacity: 0.85, fontSize: 12, fontWeight: '600' },

  conversa: { flex: 1, backgroundColor: cores.fundo },
  conversaConteudo: { padding: 16, gap: 10 },
  balao: { maxWidth: '82%', borderRadius: raio.lg, paddingVertical: 10, paddingHorizontal: 14, ...sombra },
  balaoBot: { alignSelf: 'flex-start', backgroundColor: cores.superficie, borderTopLeftRadius: 4 },
  balaoCliente: { alignSelf: 'flex-end', backgroundColor: cores.verde, borderTopRightRadius: 4 },
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
  botaoEnviar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: cores.verde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoEnviarOff: { opacity: 0.4 },

  botaoFechar: {
    backgroundColor: cores.azulMarinho,
    borderRadius: raio.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botaoFecharTexto: { color: cores.textoInverso, fontWeight: '800', fontSize: 15 },
});
