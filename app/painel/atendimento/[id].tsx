/**
 * Detalhe de um atendimento geral (consultor/admin) — chat com o cliente.
 *
 * Fila ISOLADA dos leads aéreos. O consultor responde por aqui e pode marcar
 * o atendimento como resolvido (ou reabrir).
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores, espaco, raio, tipografia } from '../../../src/tema';
import { t } from '../../../src/i18n';
import { Botao, Cartao } from '../../../src/componentes';
import {
  enviarMensagemAtendimento,
  listarMensagensAtendimento,
  mudarStatusAtendimento,
} from '../../../src/servicos';
import type { MensagemChat, StatusAtendimento } from '../../../src/tipos';

export default function DetalheAtendimento() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [texto, setTexto] = useState('');
  const [status, setStatus] = useState<StatusAtendimento>('em_atendimento');
  const [salvando, setSalvando] = useState(false);

  // Polling das mensagens.
  useEffect(() => {
    if (!id) return;
    let ativo = true;
    const buscar = async () => {
      try {
        const msgs = await listarMensagensAtendimento(String(id));
        if (ativo) {
          setMensagens(msgs);
          setErro('');
        }
      } catch {
        if (ativo) setErro(t.painel.erroAtendimentos);
      } finally {
        if (ativo) setCarregando(false);
      }
    };
    void buscar();
    const tid = setInterval(buscar, 4000);
    return () => {
      ativo = false;
      clearInterval(tid);
    };
  }, [id]);

  const enviar = useCallback(async () => {
    const t0 = texto.trim();
    if (!t0) return;
    setTexto('');
    try {
      await enviarMensagemAtendimento(String(id), t0);
      setMensagens(await listarMensagensAtendimento(String(id)));
      setStatus((s) => (s === 'novo' ? 'em_atendimento' : s));
    } catch {
      /* ignora */
    }
  }, [id, texto]);

  const alternarResolvido = useCallback(async () => {
    if (salvando) return;
    const novo: StatusAtendimento = status === 'resolvido' ? 'em_atendimento' : 'resolvido';
    setSalvando(true);
    try {
      await mudarStatusAtendimento(String(id), novo);
      setStatus(novo);
    } catch {
      /* mantém */
    } finally {
      setSalvando(false);
    }
  }, [id, status, salvando]);

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={cores.verde} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Text style={styles.titulo}>{t.painel.tituloAtendimento}</Text>

      <Botao
        titulo={status === 'resolvido' ? t.painel.reabrir : t.painel.marcarResolvido}
        icone={status === 'resolvido' ? 'refresh' : 'checkmark-circle'}
        variante={status === 'resolvido' ? 'secundario' : 'destaque'}
        carregando={salvando}
        aoPressionar={alternarResolvido}
      />

      <Cartao elevacao="sm" style={{ gap: espaco.sm }}>
        {mensagens.length === 0 ? (
          <Text style={styles.aviso}>{erro || t.painel.semMensagens}</Text>
        ) : (
          mensagens.map((m) => (
            <View key={m.id} style={[styles.msg, m.autor === 'consultor' ? styles.msgConsultor : styles.msgCliente]}>
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
          value={texto}
          onChangeText={setTexto}
          placeholder={t.painel.placeholderMsg}
          placeholderTextColor={cores.textoClaro}
          onSubmitEditing={enviar}
          returnKeyType="send"
        />
        <Pressable
          style={[styles.botaoEnviar, !texto.trim() && { opacity: 0.4 }]}
          onPress={enviar}
          disabled={!texto.trim()}
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
  titulo: { ...tipografia.tituloGrande, color: cores.azulMarinho },
  aviso: { ...tipografia.corpoSuave, color: cores.textoSuave },
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
