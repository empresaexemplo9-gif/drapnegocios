import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, sombra } from '../../src/tema';
import { t } from '../../src/i18n';
import { LogoMarca, ChatbotAereo } from '../../src/componentes';
import { abrirWhiteLabel } from '../../src/servicos';

/** Roxo do card "Corporativo" (só nesta vitrine, fora da paleta base). */
const ROXO = '#6D4FB0';

/** Fotos reais das cidades (enviadas pelo cliente, uso livre) em public/destinos/.
 * Seeds sem foto caem em placeholder estável (Lorem Picsum). */
const FOTO_DESTINO: Record<string, string> = {
  rio: '/destinos/rio.jpg',
  ssa: '/destinos/salvador.jpg',
  bh: '/destinos/belo-horizonte.jpg',
  sao: '/destinos/sao-paulo.jpg',
  floripa: '/destinos/florianopolis.jpg',
};
const foto = (seed: string, w = 640) =>
  FOTO_DESTINO[seed] ?? `https://picsum.photos/seed/vb-${seed}/${w}/400`;

const CARDS = [
  { chave: 'onibus', emoji: '🚌', titulo: t.vitrine.onibusTitulo, sub: t.vitrine.onibusSub, cor: cores.verde, selecionado: true },
  { chave: 'aereo', emoji: '✈️', titulo: t.vitrine.aereoTitulo, sub: t.vitrine.aereoSub, cor: cores.azul },
  { chave: 'corporativo', emoji: '💼', titulo: t.vitrine.corporativoTitulo, sub: t.vitrine.corporativoSub, cor: ROXO },
  { chave: 'hospedagem', emoji: '🏨', titulo: t.vitrine.hospedagemTitulo, sub: t.vitrine.hospedagemSub, cor: cores.laranja, emBreve: true },
];

const DESTINOS_ALTA = [
  { cidade: 'Rio de Janeiro', preco: 189, seed: 'rio' },
  { cidade: 'Salvador', preco: 119, seed: 'ssa' },
  { cidade: 'São Paulo', preco: 149, seed: 'sao' },
  { cidade: 'Florianópolis', preco: 199, seed: 'floripa' },
];

const OFERTAS = [
  { cidade: 'Rio de Janeiro', preco: 189, off: '20% OFF', seed: 'rio' },
  { cidade: 'Belo Horizonte – MG', preco: 149, off: '15% OFF', seed: 'bh' },
  { cidade: 'São Paulo – SP', preco: 129, off: '10% OFF', seed: 'sao' },
  { cidade: 'Salvador – BA', preco: 119, off: '10% OFF', seed: 'ssa' },
];

const FEATURES = [
  { emoji: '🔒', titulo: t.vitrine.seg1Titulo, sub: t.vitrine.seg1Sub },
  { emoji: '🎟️', titulo: t.vitrine.seg2Titulo, sub: t.vitrine.seg2Sub },
  { emoji: '💳', titulo: t.vitrine.seg3Titulo, sub: t.vitrine.seg3Sub },
  { emoji: '📱', titulo: t.vitrine.seg4Titulo, sub: t.vitrine.seg4Sub },
];

const SOCIAL: (keyof typeof Ionicons.glyphMap)[] = [
  'logo-instagram',
  'logo-facebook',
  'logo-youtube',
  'logo-whatsapp',
];

export default function Inicio() {
  const insets = useSafeAreaInsets();
  const alturaBarra = useBottomTabBarHeight();
  const [email, setEmail] = useState('');
  // Chatbot de Passagens Aéreas: atendimento dentro do próprio app.
  const [chatAereoAberto, setChatAereoAberto] = useState(false);

  return (
    <View style={styles.tela}>
      {/* Cabeçalho */}
      <View style={[styles.cabecalho, { paddingTop: insets.top + 10 }]}>
        <View style={styles.marcaArea}>
          <LogoMarca tamanho={38} />
          <Text style={styles.marca}>
            <Text style={{ color: cores.textoInverso }}>viaje</Text>
            <Text style={{ color: cores.verde }}>brasil</Text>
          </Text>
        </View>
        <View style={styles.acoesTopo}>
          <Pressable style={styles.faleConosco} hitSlop={6}>
            <Ionicons name="call" size={18} color={cores.textoInverso} />
            <Text style={styles.faleConoscoTexto}>{t.vitrine.faleConosco}</Text>
          </Pressable>
          <Pressable hitSlop={8}>
            <Ionicons name="menu" size={28} color={cores.textoInverso} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.fundo}
        contentContainerStyle={{ paddingBottom: alturaBarra + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Aba "Passagens" */}
        <View style={styles.aba}>
          <View style={styles.abaItem}>
            <Ionicons name="briefcase" size={20} color={cores.verde} />
            <Text style={styles.abaTexto}>{t.vitrine.passagens}</Text>
          </View>
          <View style={styles.abaSublinha} />
        </View>

        {/* Seleção de produto */}
        <View style={styles.bloco}>
          <Text style={styles.pergunta}>
            <Text style={{ color: cores.azulMarinho }}>{t.vitrine.perguntaA}</Text>
            <Text style={{ color: cores.verde }}>{t.vitrine.perguntaB}</Text>
          </Text>
          <View style={styles.grade}>
            {CARDS.map((c) => (
              <Pressable
                key={c.chave}
                style={[styles.card, c.selecionado && { borderColor: cores.verde, borderWidth: 2 }, c.emBreve && { opacity: 0.85 }]}
                disabled={c.emBreve}
                onPress={
                  c.chave === 'onibus'
                    ? () => abrirWhiteLabel('onibus')
                    : c.chave === 'aereo'
                      ? () => setChatAereoAberto(true)
                      : undefined
                }
              >
                <View style={styles.cardTopo}>
                  <Text style={styles.cardEmoji}>{c.emoji}</Text>
                  {c.selecionado && <Ionicons name="checkmark-circle" size={24} color={cores.verde} />}
                </View>
                <View style={styles.cardTituloLinha}>
                  <Text style={[styles.cardTitulo, { color: c.cor }]}>{c.titulo}</Text>
                  {c.emBreve && (
                    <View style={styles.emBreve}>
                      <Text style={styles.emBreveTexto}>{t.vitrine.emBreve}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardSub}>{c.sub}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Carrossel "Destino em alta" */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carrossel}>
          {DESTINOS_ALTA.map((d) => (
            <ImageBackground
              key={d.seed}
              source={{ uri: foto(d.seed) }}
              style={styles.banner}
              imageStyle={{ borderRadius: raio.lg }}
            >
              <View style={styles.bannerOverlay} />
              <View style={styles.bannerConteudo}>
                <Text style={styles.bannerSelo}>🔥 {t.vitrine.destinoEmAlta.toUpperCase()}</Text>
                <Text style={styles.bannerCidade}>{d.cidade}</Text>
                <Text style={styles.bannerLinha}>{t.vitrine.passagensOnibus}</Text>
                <Text style={styles.bannerPreco}>
                  <Text style={styles.bannerAPartir}>{t.vitrine.aPartirDe} </Text>R$ {d.preco}
                </Text>
                <Pressable style={styles.btnVerde}>
                  <Text style={styles.btnVerdeTexto}>{t.vitrine.verHorarios}</Text>
                </Pressable>
              </View>
            </ImageBackground>
          ))}
        </ScrollView>

        {/* Ofertas imperdíveis */}
        <View style={styles.bloco}>
          <View style={styles.secaoTopo}>
            <Text style={styles.secaoTitulo}>{t.vitrine.ofertasTitulo}</Text>
            <Pressable>
              <Text style={styles.verTodas}>{t.vitrine.verTodasOfertas} →</Text>
            </Pressable>
          </View>
          <View style={styles.grade}>
            {OFERTAS.map((o) => (
              <View key={o.cidade} style={styles.oferta}>
                <View>
                  <Image source={{ uri: foto(o.seed, 500) }} style={styles.ofertaImg} />
                  <View style={styles.ofertaBadge}>
                    <Text style={styles.ofertaBadgeTexto}>{o.off}</Text>
                  </View>
                </View>
                <View style={styles.ofertaCorpo}>
                  <Text style={styles.ofertaCidade}>{o.cidade}</Text>
                  <Text style={styles.ofertaPreco}>
                    <Text style={styles.ofertaAPartir}>{t.vitrine.aPartirDe} </Text>
                    <Text style={{ color: cores.verde, fontWeight: '800' }}>R$ {o.preco}</Text>
                  </Text>
                  <Pressable style={styles.btnVerde}>
                    <Text style={styles.btnVerdeTexto}>{t.vitrine.verOpcoes}</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Por que viajar */}
        <View style={[styles.bloco, { backgroundColor: cores.superficieAlt, paddingVertical: 24 }]}>
          <Text style={[styles.secaoTitulo, { textAlign: 'center', color: cores.azulMarinho, marginBottom: 18 }]}>
            <Text>Por que viajar com a </Text>
            <Text style={{ color: cores.verde }}>ViajeBrasil?</Text>
          </Text>
          <View style={styles.grade}>
            {FEATURES.map((f) => (
              <View key={f.titulo} style={styles.feature}>
                <Text style={styles.featureEmoji}>{f.emoji}</Text>
                <Text style={styles.featureTitulo}>{f.titulo}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Newsletter */}
        <View style={styles.newsletter}>
          <View style={styles.newsletterTopo}>
            <Ionicons name="mail" size={22} color={cores.textoInverso} />
            <View style={{ flex: 1 }}>
              <Text style={styles.newsletterTitulo}>{t.vitrine.newsletterTitulo}</Text>
              <Text style={styles.newsletterSub}>{t.vitrine.newsletterSub}</Text>
            </View>
          </View>
          <View style={styles.newsletterForm}>
            <TextInput
              style={styles.newsletterInput}
              placeholder={t.vitrine.seuEmail}
              placeholderTextColor={cores.textoClaro}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Pressable style={styles.btnVerde}>
              <Text style={styles.btnVerdeTexto}>{t.vitrine.cadastrar}</Text>
            </Pressable>
          </View>
        </View>

        {/* Rodapé */}
        <View style={styles.rodape}>
          <Text style={styles.rodapeBaixe}>{t.vitrine.baixeApp}</Text>
          <Text style={styles.rodapeBaixeSub}>{t.vitrine.baixeAppSub}</Text>
          <View style={styles.lojas}>
            <Pressable style={styles.loja}>
              <Ionicons name="logo-google-playstore" size={20} color={cores.textoInverso} />
              <Text style={styles.lojaTexto}>Google Play</Text>
            </Pressable>
            <Pressable style={styles.loja}>
              <Ionicons name="logo-apple" size={20} color={cores.textoInverso} />
              <Text style={styles.lojaTexto}>App Store</Text>
            </Pressable>
          </View>

          <View style={styles.rodapeLinha} />

          <View style={styles.rodapeSeguranca}>
            <Ionicons name="shield-checkmark" size={20} color={cores.verde} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rodapeSegTitulo}>{t.vitrine.compraSegura}</Text>
              <Text style={styles.rodapeSegSub}>{t.vitrine.compraSeguraSub}</Text>
            </View>
          </View>

          <Text style={styles.rodapeRotulo}>{t.vitrine.formasPagamento}</Text>
          <View style={styles.pagamentos}>
            <Ionicons name="card" size={22} color={cores.textoInverso} />
            <Text style={styles.pagamentosTexto}>Pix · Visa · Mastercard · Boleto</Text>
          </View>

          <Text style={styles.rodapeRotulo}>{t.vitrine.sigaNos}</Text>
          <View style={styles.social}>
            {SOCIAL.map((s) => (
              <Pressable key={s} hitSlop={8}>
                <Ionicons name={s} size={24} color={cores.textoInverso} />
              </Pressable>
            ))}
          </View>

          <View style={styles.rodapeLinha} />
          <Text style={styles.rodapeEmpresa}>{t.vitrine.empresaNome}</Text>
          <Text style={styles.rodapeCnpj}>{t.vitrine.cnpj}</Text>
          <View style={styles.rodapeLinks}>
            <Pressable>
              <Text style={styles.rodapeLink}>{t.vitrine.politica}</Text>
            </Pressable>
            <Text style={styles.rodapeSep}>·</Text>
            <Pressable>
              <Text style={styles.rodapeLink}>{t.vitrine.termos}</Text>
            </Pressable>
          </View>
          <Text style={styles.rodapeCopy}>{t.vitrine.copyright}</Text>
        </View>
      </ScrollView>

      {/* Atendimento de Passagens Aéreas — chatbot dentro do app. */}
      <ChatbotAereo visivel={chatAereoAberto} aoFechar={() => setChatAereoAberto(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.azulMarinho },
  fundo: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: {
    backgroundColor: cores.azulMarinho,
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marcaArea: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  marca: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  acoesTopo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  faleConosco: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  faleConoscoTexto: { color: cores.textoInverso, fontWeight: '700', fontSize: 13 },

  aba: { backgroundColor: cores.superficie, paddingHorizontal: 16, paddingTop: 14 },
  abaItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 10 },
  abaTexto: { color: cores.azulMarinho, fontWeight: '800', fontSize: 18 },
  abaSublinha: { height: 3, width: 120, backgroundColor: cores.verde, borderRadius: 999 },

  bloco: { paddingHorizontal: 16, paddingTop: 18 },
  pergunta: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 18, lineHeight: 32 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 },
  card: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 16,
    minHeight: 165,
    ...sombra,
  },
  cardTopo: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 },
  cardEmoji: { fontSize: 32 },
  cardTituloLinha: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  cardTitulo: { fontSize: 17, fontWeight: '800' },
  cardSub: { color: cores.textoSuave, fontSize: 13, marginTop: 6, fontWeight: '500', lineHeight: 18 },
  emBreve: { backgroundColor: cores.laranja, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  emBreveTexto: { color: cores.textoInverso, fontSize: 11, fontWeight: '800' },

  carrossel: { paddingHorizontal: 16, paddingTop: 20, gap: 14 },
  banner: { width: 300, height: 190, justifyContent: 'flex-end', backgroundColor: cores.azulMarinho, borderRadius: raio.lg },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(13,28,54,0.45)', borderRadius: raio.lg },
  bannerConteudo: { padding: 16 },
  bannerSelo: { color: cores.verde, fontSize: 11, fontWeight: '800', marginBottom: 4 },
  bannerCidade: { color: cores.textoInverso, fontSize: 22, fontWeight: '800' },
  bannerLinha: { color: cores.textoInverso, opacity: 0.9, fontSize: 13, fontWeight: '600' },
  bannerPreco: { color: cores.verde, fontSize: 20, fontWeight: '800', marginTop: 2 },
  bannerAPartir: { color: cores.textoInverso, opacity: 0.9, fontSize: 13, fontWeight: '600' },

  btnVerde: { backgroundColor: cores.verde, borderRadius: raio.md, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center', marginTop: 10 },
  btnVerdeTexto: { color: cores.textoInverso, fontWeight: '800', fontSize: 14 },

  secaoTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  secaoTitulo: { fontSize: 20, fontWeight: '800', color: cores.azulMarinho, flex: 1, paddingRight: 8 },
  verTodas: { color: cores.verde, fontWeight: '800', fontSize: 13 },

  oferta: { width: '47%', flexGrow: 1, backgroundColor: cores.superficie, borderRadius: raio.lg, overflow: 'hidden', ...sombra },
  ofertaImg: { width: '100%', height: 110, backgroundColor: cores.azulMarinho },
  ofertaBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: cores.laranja, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  ofertaBadgeTexto: { color: cores.textoInverso, fontSize: 11, fontWeight: '800' },
  ofertaCorpo: { padding: 12, gap: 4 },
  ofertaCidade: { fontSize: 15, fontWeight: '800', color: cores.azulMarinho },
  ofertaPreco: { fontSize: 14 },
  ofertaAPartir: { color: cores.textoSuave, fontSize: 13, fontWeight: '600' },

  feature: { width: '47%', flexGrow: 1, backgroundColor: cores.superficie, borderRadius: raio.lg, padding: 16, alignItems: 'center', ...sombra },
  featureEmoji: { fontSize: 30, marginBottom: 8 },
  featureTitulo: { fontSize: 15, fontWeight: '800', color: cores.azulMarinho, textAlign: 'center' },
  featureSub: { fontSize: 12, color: cores.textoSuave, textAlign: 'center', marginTop: 6, lineHeight: 17, fontWeight: '500' },

  newsletter: { backgroundColor: cores.azulMarinho, margin: 16, borderRadius: raio.lg, padding: 18, gap: 14 },
  newsletterTopo: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  newsletterTitulo: { color: cores.textoInverso, fontWeight: '800', fontSize: 17 },
  newsletterSub: { color: cores.textoInverso, opacity: 0.85, fontSize: 12, marginTop: 2 },
  newsletterForm: { flexDirection: 'row', gap: 10 },
  newsletterInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: raio.md,
    paddingHorizontal: 14,
    color: cores.textoInverso,
    fontSize: 14,
    fontWeight: '600',
  },

  rodape: { backgroundColor: '#0F1C36', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 28 },
  rodapeBaixe: { color: cores.textoInverso, fontWeight: '800', fontSize: 18 },
  rodapeBaixeSub: { color: cores.textoInverso, opacity: 0.8, fontSize: 13, marginTop: 4, fontWeight: '500' },
  lojas: { flexDirection: 'row', gap: 12, marginTop: 14 },
  loja: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: raio.md, paddingVertical: 10, paddingHorizontal: 14 },
  lojaTexto: { color: cores.textoInverso, fontWeight: '700', fontSize: 13 },
  rodapeLinha: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 20 },
  rodapeSeguranca: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 18 },
  rodapeSegTitulo: { color: cores.textoInverso, fontWeight: '800', fontSize: 14 },
  rodapeSegSub: { color: cores.textoInverso, opacity: 0.8, fontSize: 12, marginTop: 2 },
  rodapeRotulo: { color: cores.textoClaro, fontSize: 12, fontWeight: '800', letterSpacing: 0.5, marginBottom: 10 },
  pagamentos: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  pagamentosTexto: { color: cores.textoInverso, opacity: 0.9, fontSize: 13, fontWeight: '600' },
  social: { flexDirection: 'row', gap: 20, marginBottom: 4 },
  rodapeEmpresa: { color: cores.textoInverso, fontWeight: '800', fontSize: 13 },
  rodapeCnpj: { color: cores.textoInverso, opacity: 0.7, fontSize: 12, marginTop: 2 },
  rodapeLinks: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  rodapeLink: { color: cores.textoInverso, opacity: 0.9, fontSize: 12, fontWeight: '700' },
  rodapeSep: { color: cores.textoClaro },
  rodapeCopy: { color: cores.textoClaro, fontSize: 11, marginTop: 12 },
});
