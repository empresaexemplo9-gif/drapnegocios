import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores, espaco, raio, tipografia } from '../../src/tema';
import { t } from '../../src/i18n';
import { Botao, Cartao, Chip, Selo, tomStatusLead } from '../../src/componentes';
import {
  atualizarLead,
  enviarMensagem,
  linkWhatsApp,
  listarMensagens,
  obterLead,
} from '../../src/servicos';
import type { Lead, MensagemChat, StatusLead } from '../../src/tipos';

const STATUSES: StatusLead[] = ['novo', 'atribuido', 'em_atendimento', 'convertido', 'perdido'];

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={styles.linha}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

export default function DetalheLead() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [textoChat, setTextoChat] = useState('');

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const l = await obterLead(String(id));
        if (ativo) setLead(l);
      } catch {
        if (ativo) setErro(t.painel.erro);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [id]);

  // Polling das mensagens do chat.
  useEffect(() => {
    if (!id) return;
    let ativo = true;
    const buscar = async () => {
      try {
        const msgs = await listarMensagens(String(id));
        if (ativo) setMensagens(msgs);
      } catch {
        /* ignora */
      }
    };
    void buscar();
    const tid = setInterval(buscar, 4000);
    return () => {
      ativo = false;
      clearInterval(tid);
    };
  }, [id]);

  const enviarChat = useCallback(async () => {
    const texto = textoChat.trim();
    if (!texto) return;
    setTextoChat('');
    try {
      await enviarMensagem(String(id), texto);
      const msgs = await listarMensagens(String(id));
      setMensagens(msgs);
      setLead((prev) => (prev && prev.status !== 'em_atendimento' && (prev.status === 'novo' || prev.status === 'atribuido')
        ? { ...prev, status: 'em_atendimento' }
        : prev));
    } catch {
      /* ignora */
    }
  }, [id, textoChat]);

  const mudarStatus = useCallback(
    async (status: StatusLead) => {
      if (!lead || salvando) return;
      setSalvando(true);
      try {
        const atualizado = await atualizarLead(lead.id, { status });
        setLead((prev) => (prev ? { ...prev, status: atualizado.status } : prev));
      } catch {
        // mantém o status anterior
      } finally {
        setSalvando(false);
      }
    },
    [lead, salvando],
  );

  const abrirWhatsApp = useCallback(() => {
    if (!lead?.contato_telefone) return;
    const nome = (lead.contato_nome || lead.nomes?.[0] || '').split(' ')[0] || 'tudo bem';
    const link = linkWhatsApp(lead.contato_telefone, t.painel.saudacaoWpp(nome));
    if (link) void Linking.openURL(link);
  }, [lead]);

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={cores.verde} />
      </View>
    );
  }
  if (erro || !lead) {
    return (
      <View style={styles.centro}>
        <Text style={styles.aviso}>{erro || t.painel.erro}</Text>
      </View>
    );
  }

  const wpp = linkWhatsApp(lead.contato_telefone || '');

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <View style={styles.cabecalho}>
        <Text style={styles.trecho}>
          {(lead.origem_cidade || '—') + ' → ' + (lead.destino_cidade || '—')}
        </Text>
        <Selo texto={t.statusLead[lead.status]} tom={tomStatusLead(lead.status)} />
      </View>

      <Cartao elevacao="sm" style={styles.bloco}>
        <Linha rotulo={t.painel.passageiros} valor={String(lead.numero_passageiros)} />
        <Linha rotulo="Nome(s)" valor={lead.nomes?.join(', ') || '—'} />
        <Linha rotulo={t.painel.ida} valor={lead.data_ida || '—'} />
        <Linha rotulo={t.painel.volta} valor={lead.data_volta || t.painel.somenteIda} />
        <Linha rotulo={t.painel.classe} valor={lead.classe || '—'} />
        <Linha rotulo={t.painel.contato} valor={lead.contato_telefone || t.painel.semContato} />
      </Cartao>

      {wpp ? (
        <Botao titulo={t.painel.whatsapp} icone="logo-whatsapp" variante="destaque" aoPressionar={abrirWhatsApp} />
      ) : (
        <View style={styles.semWpp}>
          <Ionicons name="alert-circle-outline" size={18} color={cores.alerta} />
          <Text style={styles.semWppTexto}>{t.painel.semWhatsapp}</Text>
        </View>
      )}

      <Text style={styles.secao}>{t.painel.atualizarStatus}</Text>
      <View style={styles.chips}>
        {STATUSES.map((s) => (
          <Chip key={s} rotulo={t.statusLead[s]} selecionado={lead.status === s} aoPressionar={() => mudarStatus(s)} />
        ))}
      </View>
      {salvando ? <ActivityIndicator color={cores.verde} style={{ marginTop: espaco.sm }} /> : null}

      {/* Chat com o cliente */}
      <Text style={styles.secao}>{t.painel.conversa}</Text>
      <Cartao elevacao="sm" style={{ gap: espaco.sm }}>
        {mensagens.length === 0 ? (
          <Text style={styles.aviso}>{t.painel.semMensagens}</Text>
        ) : (
          mensagens.map((m) => (
            <View
              key={m.id}
              style={[styles.msg, m.autor === 'consultor' ? styles.msgConsultor : styles.msgCliente]}
            >
              <Text style={styles.msgAutor}>{m.autor === 'consultor' ? t.painel.voce : t.painel.cliente}</Text>
              <Text style={m.autor === 'consultor' ? styles.msgTextoConsultor : styles.msgTextoCliente}>
                {m.texto}
              </Text>
            </View>
          ))
        )}
      </Cartao>
      <View style={styles.entradaLinha}>
        <TextInput
          style={styles.input}
          value={textoChat}
          onChangeText={setTextoChat}
          placeholder={t.painel.placeholderMsg}
          placeholderTextColor={cores.textoClaro}
          onSubmitEditing={enviarChat}
          returnKeyType="send"
        />
        <Pressable
          style={[styles.botaoEnviar, !textoChat.trim() && { opacity: 0.4 }]}
          onPress={enviarChat}
          disabled={!textoChat.trim()}
        >
          <Ionicons name="send" size={18} color={cores.textoInverso} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg, gap: espaco.lg },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.fundo },
  aviso: { ...tipografia.corpoSuave, color: cores.textoSuave },
  cabecalho: { gap: espaco.sm },
  trecho: { ...tipografia.tituloGrande, color: cores.azulMarinho },
  bloco: { gap: espaco.sm },
  linha: { flexDirection: 'row', justifyContent: 'space-between', gap: espaco.md },
  rotulo: { ...tipografia.corpoSuave, color: cores.textoSuave },
  valor: { ...tipografia.corpo, color: cores.texto, flexShrink: 1, textAlign: 'right' },
  semWpp: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  semWppTexto: { ...tipografia.corpoSuave, color: cores.textoSuave },
  secao: { ...tipografia.secao, color: cores.azulMarinho },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  msg: { maxWidth: '85%', borderRadius: raio.md, paddingVertical: 8, paddingHorizontal: 12 },
  msgConsultor: { alignSelf: 'flex-end', backgroundColor: cores.verde },
  msgCliente: { alignSelf: 'flex-start', backgroundColor: cores.superficieAlt },
  msgAutor: { fontSize: 10, fontWeight: '800', opacity: 0.7, marginBottom: 2, color: cores.azulMarinho },
  msgTextoConsultor: { ...tipografia.corpoSuave, color: cores.textoInverso },
  msgTextoCliente: { ...tipografia.corpoSuave, color: cores.texto },
  entradaLinha: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  input: {
    flex: 1,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: cores.texto,
    ...tipografia.corpoSuave,
  },
  botaoEnviar: { width: 44, height: 44, borderRadius: 999, backgroundColor: cores.verde, alignItems: 'center', justifyContent: 'center' },
});
