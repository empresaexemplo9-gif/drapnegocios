import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, espaco, raio, tipografia } from '../../src/tema';
import { t } from '../../src/i18n';
import { Botao, Campo, Cartao, Selo } from '../../src/componentes';
import {
  atualizarOferta,
  criarOferta,
  enviarFotoOferta,
  excluirOferta,
  listarOfertasAdmin,
} from '../../src/servicos';
import { OFERTAS_PADRAO } from '../../src/dados/ofertasPadrao';
import type { HomeOferta } from '../../src/tipos';

interface Form {
  id?: string;
  titulo: string;
  cidade: string;
  preco: string;
  imagem_url: string;
  badge: string;
  ordem: string;
  ativo: boolean;
}

const FORM_VAZIO: Form = { titulo: '', cidade: '', preco: '', imagem_url: '', badge: '', ordem: '0', ativo: true };

function paraForm(o: HomeOferta): Form {
  return {
    id: o.id,
    titulo: o.titulo ?? '',
    cidade: o.cidade ?? '',
    preco: o.preco != null ? String(o.preco) : '',
    imagem_url: o.imagem_url ?? '',
    badge: o.badge ?? '',
    ordem: String(o.ordem ?? 0),
    ativo: o.ativo !== false,
  };
}

export default function AdminOfertas() {
  const [ofertas, setOfertas] = useState<HomeOferta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState<Form | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [populando, setPopulando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [erroForm, setErroForm] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setOfertas(await listarOfertasAdmin());
    } catch {
      // mantém a lista atual
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const set = (campo: keyof Form, valor: string | boolean) => setForm((f) => (f ? { ...f, [campo]: valor } : f));

  const popular = async () => {
    setPopulando(true);
    try {
      for (const o of OFERTAS_PADRAO) {
        await criarOferta({
          titulo: o.titulo,
          cidade: o.cidade,
          preco: o.preco,
          badge: o.badge,
          imagem_url: o.imagem_url,
          ordem: o.ordem,
          ativo: true,
        });
      }
      await carregar();
    } catch {
      // ignora
    } finally {
      setPopulando(false);
    }
  };

  const enviarFoto = async () => {
    setEnviandoFoto(true);
    setErroForm('');
    try {
      const url = await enviarFotoOferta();
      if (url) set('imagem_url', url);
    } catch (e) {
      setErroForm(e instanceof Error ? e.message : 'Falha no envio da foto.');
    } finally {
      setEnviandoFoto(false);
    }
  };

  const salvar = async () => {
    if (!form || !form.titulo.trim()) return;
    setSalvando(true);
    setErroForm('');
    try {
      const dados: Partial<HomeOferta> = {
        titulo: form.titulo.trim(),
        cidade: form.cidade.trim() || null,
        preco: form.preco.trim() ? Number(form.preco.replace(',', '.')) : null,
        imagem_url: form.imagem_url.trim() || null,
        badge: form.badge.trim() || null,
        ordem: Number(form.ordem) || 0,
        ativo: form.ativo,
      };
      if (form.id) await atualizarOferta(form.id, dados);
      else await criarOferta(dados);
      setForm(null);
      await carregar();
    } catch (e) {
      setErroForm(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  };

  const remover = async () => {
    if (!form?.id) return;
    setSalvando(true);
    try {
      await excluirOferta(form.id);
      setForm(null);
      await carregar();
    } catch {
      // ignora
    } finally {
      setSalvando(false);
    }
  };

  return (
    <View style={styles.tela}>
      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <View style={styles.topo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.titulo}>{t.admin.ofertasTitulo}</Text>
            <Text style={styles.sub}>{t.admin.previewTitulo}</Text>
          </View>
          <Pressable style={styles.btnNova} onPress={() => { setErroForm(''); setForm(FORM_VAZIO); }}>
            <Ionicons name="add" size={18} color={cores.textoInverso} />
            <Text style={styles.btnNovaTexto}>{t.admin.nova}</Text>
          </Pressable>
        </View>

        {carregando ? (
          <ActivityIndicator size="large" color={cores.verde} style={{ marginTop: espaco.xl }} />
        ) : ofertas.length === 0 ? (
          <Cartao elevacao="sm" style={styles.vazio}>
            <Ionicons name="pricetags-outline" size={40} color={cores.textoClaro} />
            <Text style={styles.vazioTexto}>{t.admin.semOfertas}</Text>
            <Botao
              titulo={t.admin.popularAtuais}
              icone="sparkles"
              variante="destaque"
              aoPressionar={popular}
              carregando={populando}
              estilo={{ alignSelf: 'stretch' }}
            />
          </Cartao>
        ) : (
          <View style={styles.grade}>
            {ofertas.map((o) => (
              <Pressable
                key={o.id}
                style={styles.cardWrap}
                onPress={() => { setErroForm(''); setForm(paraForm(o)); }}
              >
                <Cartao style={styles.card} elevacao="md">
                  <View>
                    {o.imagem_url ? (
                      <Image source={{ uri: o.imagem_url }} style={styles.cardImg} />
                    ) : (
                      <View style={[styles.cardImg, styles.semImg]}>
                        <Ionicons name="image-outline" size={26} color={cores.textoClaro} />
                      </View>
                    )}
                    {o.badge ? <Selo texto={o.badge} tom="laranja" style={styles.cardBadge} /> : null}
                    {o.ativo === false ? <Selo texto={t.admin.inativa} tom="neutro" style={styles.cardBadgeDir} /> : null}
                    <View style={styles.editarHint}>
                      <Ionicons name="create" size={14} color={cores.textoInverso} />
                    </View>
                  </View>
                  <View style={styles.cardCorpo}>
                    <Text style={styles.cardCidade} numberOfLines={1}>{o.cidade || o.titulo}</Text>
                    {o.preco != null && (
                      <Text style={styles.cardPreco}>
                        <Text style={styles.cardAPartir}>{t.vitrine.aPartirDe} </Text>
                        <Text style={styles.cardValor}>R$ {Number(o.preco)}</Text>
                      </Text>
                    )}
                    <View style={styles.btnVerde}>
                      <Text style={styles.btnVerdeTexto}>{t.vitrine.verOpcoes}</Text>
                    </View>
                    <Text style={styles.toqueEditar}>{t.admin.toqueEditar}</Text>
                  </View>
                </Cartao>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Formulário (modal) */}
      <Modal visible={!!form} animationType="slide" transparent onRequestClose={() => setForm(null)}>
        <View style={styles.modalFundo}>
          <View style={styles.modalFolha}>
            <View style={styles.modalTopo}>
              <Text style={styles.modalTitulo}>{form?.id ? t.admin.editarTitulo : t.admin.novaTitulo}</Text>
              <Pressable hitSlop={10} onPress={() => setForm(null)}>
                <Ionicons name="close" size={24} color={cores.azulMarinho} />
              </Pressable>
            </View>

            {form && (
              <ScrollView contentContainerStyle={styles.modalConteudo} showsVerticalScrollIndicator={false}>
                {/* Imagem */}
                <Text style={styles.rotulo}>{t.admin.fImagem}</Text>
                <View style={styles.fotoArea}>
                  {form.imagem_url ? (
                    <Image source={{ uri: form.imagem_url }} style={styles.fotoPreview} />
                  ) : (
                    <View style={[styles.fotoPreview, styles.semImg]}>
                      <Ionicons name="image-outline" size={28} color={cores.textoClaro} />
                      <Text style={styles.semFotoTexto}>{t.admin.semFoto}</Text>
                    </View>
                  )}
                  {Platform.OS === 'web' && (
                    <Botao
                      titulo={form.imagem_url ? t.admin.trocarFoto : t.admin.enviarFoto}
                      icone="cloud-upload-outline"
                      variante="contorno"
                      tamanho="sm"
                      aoPressionar={enviarFoto}
                      carregando={enviandoFoto}
                      estilo={{ alignSelf: 'stretch' }}
                    />
                  )}
                </View>
                <Campo
                  placeholder={t.admin.urlOuFoto}
                  value={form.imagem_url}
                  onChangeText={(v) => set('imagem_url', v)}
                  autoCapitalize="none"
                  containerStyle={{ marginTop: espaco.sm }}
                />

                <Campo rotulo={t.admin.fTitulo} value={form.titulo} onChangeText={(v) => set('titulo', v)} containerStyle={styles.campo} />
                <Campo rotulo={t.admin.fCidade} value={form.cidade} onChangeText={(v) => set('cidade', v)} containerStyle={styles.campo} />
                <Campo rotulo={t.admin.fPreco} value={form.preco} onChangeText={(v) => set('preco', v)} keyboardType="numeric" containerStyle={styles.campo} />
                <Campo rotulo={t.admin.fBadge} value={form.badge} onChangeText={(v) => set('badge', v)} containerStyle={styles.campo} />
                <Campo rotulo={t.admin.fOrdem} value={form.ordem} onChangeText={(v) => set('ordem', v)} keyboardType="number-pad" containerStyle={styles.campo} />

                <View style={styles.switchLinha}>
                  <Text style={styles.switchTexto}>{t.admin.fAtivo}</Text>
                  <Switch value={form.ativo} onValueChange={(v) => set('ativo', v)} trackColor={{ true: cores.verde }} />
                </View>

                {erroForm ? <Text style={styles.erro}>{erroForm}</Text> : null}

                <View style={styles.modalAcoes}>
                  {form.id ? (
                    <Pressable style={styles.btnExcluir} onPress={remover} disabled={salvando}>
                      <Ionicons name="trash-outline" size={18} color={cores.erro} />
                      <Text style={styles.btnExcluirTexto}>{t.admin.excluir}</Text>
                    </Pressable>
                  ) : (
                    <View style={{ flex: 1 }} />
                  )}
                  <Botao titulo={t.admin.salvar} variante="destaque" aoPressionar={salvar} carregando={salvando} estilo={{ flex: 1 }} />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg, gap: espaco.md },
  topo: { flexDirection: 'row', alignItems: 'flex-start', gap: espaco.md },
  titulo: { ...tipografia.titulo, color: cores.azulMarinho },
  sub: { ...tipografia.corpoSuave, color: cores.textoSuave, marginTop: 2 },
  btnNova: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: cores.verde,
    borderRadius: raio.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  btnNovaTexto: { ...tipografia.legenda, color: cores.textoInverso },

  vazio: { alignItems: 'center', gap: espaco.md, paddingVertical: espaco.xl },
  vazioTexto: { ...tipografia.corpoSuave, color: cores.textoSuave, textAlign: 'center' },

  grade: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: espaco.md },
  cardWrap: { width: '47%', flexGrow: 1 },
  card: { padding: 0, overflow: 'hidden' },
  cardImg: { width: '100%', height: 110, backgroundColor: cores.superficieAlt },
  semImg: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  cardBadge: { position: 'absolute', top: 10, left: 10 },
  cardBadgeDir: { position: 'absolute', top: 10, right: 10 },
  editarHint: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(13,28,54,0.65)',
    borderRadius: 999,
    padding: 6,
  },
  cardCorpo: { padding: espaco.md, gap: 4 },
  cardCidade: { ...tipografia.secao, color: cores.azulMarinho },
  cardPreco: { fontSize: 14 },
  cardAPartir: { color: cores.textoSuave, fontSize: 13, fontWeight: '600' },
  cardValor: { color: cores.verde, fontWeight: '800' },
  btnVerde: { backgroundColor: cores.verde, borderRadius: raio.md, paddingVertical: 9, alignItems: 'center', marginTop: 6, opacity: 0.95 },
  btnVerdeTexto: { color: cores.textoInverso, fontWeight: '800', fontSize: 13 },
  toqueEditar: { ...tipografia.legenda, color: cores.textoClaro, textAlign: 'center', marginTop: 2 },

  modalFundo: { flex: 1, backgroundColor: 'rgba(13,28,54,0.45)', justifyContent: 'flex-end' },
  modalFolha: {
    maxHeight: '92%',
    backgroundColor: cores.fundo,
    borderTopLeftRadius: raio.xl,
    borderTopRightRadius: raio.xl,
  },
  modalTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espaco.lg,
    paddingVertical: espaco.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.borda,
  },
  modalTitulo: { ...tipografia.subtitulo, color: cores.azulMarinho },
  modalConteudo: { padding: espaco.lg, gap: espaco.sm, paddingBottom: espaco.xxl },
  rotulo: { ...tipografia.legenda, color: cores.textoSuave },
  fotoArea: { gap: espaco.sm },
  fotoPreview: { width: '100%', height: 150, borderRadius: raio.md, backgroundColor: cores.superficieAlt },
  semFotoTexto: { ...tipografia.legenda, color: cores.textoClaro },
  campo: { marginTop: espaco.xs },
  switchLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: espaco.sm },
  switchTexto: { ...tipografia.corpo, color: cores.texto },
  erro: { ...tipografia.corpoSuave, color: cores.erro, marginTop: espaco.sm },
  modalAcoes: { flexDirection: 'row', alignItems: 'center', gap: espaco.md, marginTop: espaco.lg },
  btnExcluir: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, flex: 1, paddingVertical: 12 },
  btnExcluirTexto: { ...tipografia.botao, color: cores.erro },
});
