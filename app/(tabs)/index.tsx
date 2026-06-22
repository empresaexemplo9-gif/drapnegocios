import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { empresa } from '../../src/dados/empresa';
import { cores, espaco, raio, sombras, tipografia } from '../../src/tema';
import { t } from '../../src/i18n';
import { Avatar, BotaoInstalarApp, Cartao, ChatbotAereo, HeroGradiente, LogoMarca, Selo } from '../../src/componentes';
import { listarOfertasHome } from '../../src/servicos';
import { OFERTAS_PADRAO, type OfertaPadrao } from '../../src/dados/ofertasPadrao';
import type { HomeOferta } from '../../src/tipos';

/** Roxo do card "Corporativo" (só nesta vitrine, fora da paleta base). */
const ROXO = '#6D4FB0';

/** Imagem ilustrativa genérica e estável (Lorem Picsum), determinística por seed.
 *  Resolução mais alta (≈3:2) para telas retina enquanto as fotos reais não chegam. */
const foto = (seed: string, w = 900) => `https://picsum.photos/seed/vb-${seed}/${w}/${Math.round(w * 0.66)}`;

const CARDS = [
  { chave: 'onibus', emoji: '🚌', titulo: t.vitrine.onibusTitulo, sub: t.vitrine.onibusSub, cor: cores.verde },
  { chave: 'aereo', emoji: '✈️', titulo: t.vitrine.aereoTitulo, sub: t.vitrine.aereoSub, cor: cores.azul },
  { chave: 'corporativo', emoji: '💼', titulo: t.vitrine.corporativoTitulo, sub: t.vitrine.corporativoSub, cor: ROXO },
  { chave: 'hospedagem', emoji: '🏨', titulo: t.vitrine.hospedagemTitulo, sub: t.vitrine.hospedagemSub, cor: cores.laranja, emBreve: true },
];

/** Oferta normalizada exibida na vitrine (vem do backend ou do fallback). */
interface OfertaView {
  chave: string;
  titulo: string;
  preco?: number;
  badge?: string;
  imagem: string;
}

/** Mapeia uma oferta do backend para a forma exibida na vitrine. */
function paraView(o: HomeOferta): OfertaView {
  return {
    chave: o.id,
    titulo: o.cidade || o.titulo,
    preco: o.preco != null ? Number(o.preco) : undefined,
    badge: o.badge ?? undefined,
    imagem: o.imagem_url || foto(o.titulo || o.id, 800),
  };
}

/** Fallbacks estáticos (quando o backend não tem itens/está fora) — derivados
 *  de OFERTAS_PADRAO (mesma fonte usada pelo admin), com fotos reais. */
function padraoView(o: OfertaPadrao, i: number): OfertaView {
  return { chave: `${o.secao}-${i}`, titulo: o.cidade || o.titulo, preco: o.preco, badge: o.badge, imagem: o.imagem_url };
}
const DESTAQUES_FALLBACK: OfertaView[] = OFERTAS_PADRAO.filter((o) => o.secao === 'destaque').map(padraoView);
const OFERTAS_FALLBACK: OfertaView[] = OFERTAS_PADRAO.filter((o) => o.secao === 'oferta').map(padraoView);

const FEATURES = [
  { emoji: '🔒', titulo: t.vitrine.seg1Titulo, sub: t.vitrine.seg1Sub },
  { emoji: '🎟️', titulo: t.vitrine.seg2Titulo, sub: t.vitrine.seg2Sub },
  { emoji: '💳', titulo: t.vitrine.seg3Titulo, sub: t.vitrine.seg3Sub },
  { emoji: '📱', titulo: t.vitrine.seg4Titulo, sub: t.vitrine.seg4Sub },
];

const SOCIAL: { icone: keyof typeof Ionicons.glyphMap; url: string }[] = [
  { icone: 'logo-instagram', url: empresa.redes.instagram },
  { icone: 'logo-facebook', url: empresa.redes.facebook },
  { icone: 'logo-youtube', url: empresa.redes.youtube },
  { icone: 'logo-whatsapp', url: empresa.whatsappUrl },
];

export default function Inicio() {
  const router = useRouter();
  const alturaBarra = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const largoRodape = width >= 900; // distribui o rodapé em colunas no desktop
  const [email, setEmail] = useState('');
  const [chatAereoAberto, setChatAereoAberto] = useState(false);
  // Conteúdo data-driven: começa no fallback e troca pelo backend se houver.
  const [destaques, setDestaques] = useState<OfertaView[]>(DESTAQUES_FALLBACK);
  const [ofertas, setOfertas] = useState<OfertaView[]>(OFERTAS_FALLBACK);

  useEffect(() => {
    let ativo = true;
    listarOfertasHome()
      .then((lista) => {
        if (!ativo || lista.length === 0) return;
        const dest = lista.filter((o) => o.secao === 'destaque').map(paraView);
        const grade = lista.filter((o) => o.secao !== 'destaque').map(paraView);
        if (dest.length) setDestaques(dest);
        if (grade.length) setOfertas(grade);
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <View style={styles.tela}>
      <HeroGradiente
        eyebrow={t.app.slogan}
        titulo={t.vitrine.heroTitulo}
        subtitulo={t.vitrine.heroSub}
        topo={
          <View style={styles.heroTopo}>
            <View style={styles.marcaArea}>
              <LogoMarca tamanho={48} />
              <Text style={styles.marca}>
                <Text style={{ color: cores.textoInverso }}>viaje</Text>
                <Text style={{ color: cores.verde }}>brasil</Text>
              </Text>
            </View>
            <Pressable
              style={styles.faleConosco}
              hitSlop={6}
              onPress={() => router.push('/atendimento')}
            >
              <Ionicons name="chatbubbles" size={16} color={cores.textoInverso} />
              <Text style={styles.faleConoscoTexto}>{t.vitrine.faleConosco}</Text>
            </Pressable>
          </View>
        }
      />

      <ScrollView
        style={styles.fundo}
        contentContainerStyle={{ paddingBottom: alturaBarra + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Seleção de produto */}
        <View style={styles.bloco}>
          <Text style={styles.pergunta}>
            <Text style={{ color: cores.azulMarinho }}>{t.vitrine.perguntaA}</Text>
            <Text style={{ color: cores.verde }}>{t.vitrine.perguntaB}</Text>
          </Text>
          <View style={styles.grade}>
            {CARDS.map((c) => (
              <Cartao
                key={c.chave}
                style={[styles.card, c.emBreve && { opacity: 0.85 }]}
                elevacao="md"
                aoPressionar={
                  c.emBreve
                    ? undefined
                    : c.chave === 'onibus'
                      ? () => router.push('/onibus')
                      : c.chave === 'aereo'
                        ? () => setChatAereoAberto(true)
                        : undefined
                }
              >
                <View style={styles.cardTopo}>
                  <Avatar inicial={c.emoji} tamanho={44} cor={c.cor + '1A'} corConteudo={c.cor} />
                </View>
                <View style={styles.cardTituloLinha}>
                  <Text style={[styles.cardTitulo, { color: c.cor }]}>{c.titulo}</Text>
                  {c.emBreve && <Selo texto={t.vitrine.emBreve} tom="laranja" />}
                </View>
                <Text style={styles.cardSub}>{c.sub}</Text>
              </Cartao>
            ))}
          </View>
        </View>

        {/* Carrossel "Destino em alta" */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carrossel}>
          {destaques.map((d) => (
            <ImageBackground
              key={d.chave}
              source={{ uri: d.imagem }}
              style={styles.banner}
              imageStyle={{ borderRadius: raio.lg }}
            >
              <LinearGradient
                colors={['transparent', cores.overlayEscuro]}
                style={[StyleSheet.absoluteFillObject, { borderRadius: raio.lg }]}
              />
              <View style={styles.bannerConteudo}>
                <Selo texto={`🔥 ${d.badge || t.vitrine.destinoEmAlta}`} tom="verde" />
                <Text style={styles.bannerCidade}>{d.titulo}</Text>
                <Text style={styles.bannerLinha}>{t.vitrine.passagensOnibus}</Text>
                {d.preco != null && (
                  <Text style={styles.bannerPreco}>
                    <Text style={styles.bannerAPartir}>{t.vitrine.aPartirDe} </Text>R$ {d.preco}
                  </Text>
                )}
                <Pressable style={styles.btnVerde}>
                  <Text style={styles.btnVerdeTexto}>{t.vitrine.verHorarios}</Text>
                </Pressable>
              </View>
            </ImageBackground>
          ))}
        </ScrollView>

        {/* Ofertas imperdíveis (data-driven) */}
        <View style={styles.bloco}>
          <View style={styles.secaoTopo}>
            <Text style={styles.secaoTitulo}>{t.vitrine.ofertasTitulo}</Text>
            <Pressable>
              <Text style={styles.verTodas}>{t.vitrine.verTodasOfertas} →</Text>
            </Pressable>
          </View>
          <View style={styles.grade}>
            {ofertas.map((o) => (
              <Cartao key={o.chave} style={styles.oferta} elevacao="md">
                <View>
                  <Image source={{ uri: o.imagem }} style={styles.ofertaImg} />
                  {o.badge ? <Selo texto={o.badge} tom="laranja" style={styles.ofertaBadge} /> : null}
                </View>
                <View style={styles.ofertaCorpo}>
                  <Text style={styles.ofertaCidade} numberOfLines={1}>
                    {o.titulo}
                  </Text>
                  {o.preco != null && (
                    <Text style={styles.ofertaPreco}>
                      <Text style={styles.ofertaAPartir}>{t.vitrine.aPartirDe} </Text>
                      <Text style={styles.ofertaValor}>R$ {o.preco}</Text>
                    </Text>
                  )}
                  <Pressable style={styles.btnVerde}>
                    <Text style={styles.btnVerdeTexto}>{t.vitrine.verOpcoes}</Text>
                  </Pressable>
                </View>
              </Cartao>
            ))}
          </View>
        </View>

        {/* Por que viajar */}
        <View style={[styles.bloco, { backgroundColor: cores.superficieAlt, paddingVertical: espaco.xl }]}>
          <Text style={[styles.secaoTitulo, { textAlign: 'center', marginBottom: espaco.lg }]}>
            <Text>Por que viajar com a </Text>
            <Text style={{ color: cores.verde }}>ViajeBrasil?</Text>
          </Text>
          <View style={styles.grade}>
            {FEATURES.map((f) => (
              <Cartao key={f.titulo} style={styles.feature} elevacao="sm">
                <Avatar inicial={f.emoji} tamanho={48} cor={cores.fundo} corConteudo={cores.verde} />
                <Text style={styles.featureTitulo}>{f.titulo}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </Cartao>
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
          <View style={styles.rodapeInner}>
            {/* Colunas principais (lado a lado no desktop, empilhadas no mobile) */}
            <View style={[styles.rodapeCols, largoRodape && styles.rodapeColsRow]}>
              <View style={[styles.rodapeCol, largoRodape && styles.rodapeColFlex]}>
                <Text style={styles.rodapeBaixe}>{t.vitrine.baixeApp}</Text>
                <Text style={styles.rodapeBaixeSub}>{t.vitrine.baixeAppSub}</Text>
                {/* Instalar PWA — só em Android/iOS (web); lojas removidas por ora. */}
                <BotaoInstalarApp />
              </View>

              <View style={[styles.rodapeCol, largoRodape && styles.rodapeColFlex]}>
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
              </View>

              <View style={styles.rodapeCol}>
                <Text style={styles.rodapeRotulo}>{t.vitrine.sigaNos}</Text>
                <View style={styles.social}>
                  {SOCIAL.map((s) => (
                    <Pressable key={s.icone} hitSlop={8} onPress={() => Linking.openURL(s.url)}>
                      <Ionicons name={s.icone} size={24} color={cores.textoInverso} />
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.rodapeLinha} />

            {/* Base institucional */}
            <View style={[largoRodape && styles.rodapeBaseRow]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rodapeEmpresa}>{t.vitrine.empresaNome}</Text>
                <Text style={styles.rodapeCnpj}>{t.vitrine.cnpj}</Text>
              </View>
              <View style={[styles.rodapeLinks, largoRodape && { marginTop: 0 }]}>
                <Pressable>
                  <Text style={styles.rodapeLink}>{t.vitrine.politica}</Text>
                </Pressable>
                <Text style={styles.rodapeSep}>·</Text>
                <Pressable onPress={() => router.push('/termos')}>
                  <Text style={styles.rodapeLink}>{t.vitrine.termos}</Text>
                </Pressable>
              </View>
            </View>
            <Text style={styles.rodapeCopy}>{t.vitrine.copyright}</Text>
          </View>
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

  heroTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  marcaArea: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  marca: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  faleConosco: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: raio.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  faleConoscoTexto: { color: cores.textoInverso, fontWeight: '700', fontSize: 12 },

  bloco: { paddingHorizontal: espaco.lg, paddingTop: espaco.lg },
  pergunta: { ...tipografia.tituloGrande, textAlign: 'center', marginBottom: espaco.lg, lineHeight: 34 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: espaco.md },
  card: { width: '47%', flexGrow: 1, minHeight: 168 },
  cardTopo: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: espaco.sm },
  cardTituloLinha: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: espaco.sm },
  cardTitulo: { ...tipografia.subtitulo },
  cardSub: { color: cores.textoSuave, fontSize: 13, marginTop: 6, fontWeight: '500', lineHeight: 18 },

  carrossel: { paddingHorizontal: espaco.lg, paddingTop: espaco.xl, gap: espaco.md },
  banner: { width: 300, height: 190, justifyContent: 'flex-end', backgroundColor: cores.azulMarinho, borderRadius: raio.lg },
  bannerConteudo: { padding: espaco.lg, gap: 2 },
  bannerCidade: { color: cores.textoInverso, fontSize: 22, fontWeight: '800', marginTop: 6 },
  bannerLinha: { color: cores.textoInverso, opacity: 0.9, fontSize: 13, fontWeight: '600' },
  bannerPreco: { color: cores.verde, fontSize: 20, fontWeight: '800', marginTop: 2 },
  bannerAPartir: { color: cores.textoInverso, opacity: 0.9, fontSize: 13, fontWeight: '600' },

  btnVerde: { backgroundColor: cores.verde, borderRadius: raio.md, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center', marginTop: 10 },
  btnVerdeTexto: { color: cores.textoInverso, fontWeight: '800', fontSize: 14 },

  secaoTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: espaco.md },
  secaoTitulo: { ...tipografia.titulo, color: cores.azulMarinho, flex: 1, paddingRight: 8 },
  verTodas: { color: cores.verde, fontWeight: '800', fontSize: 13 },

  oferta: { width: '47%', flexGrow: 1, padding: 0, overflow: 'hidden' },
  ofertaImg: { width: '100%', height: 110, backgroundColor: cores.azulMarinho },
  ofertaBadge: { position: 'absolute', top: 10, left: 10 },
  ofertaCorpo: { padding: espaco.md, gap: 4 },
  ofertaCidade: { ...tipografia.secao, color: cores.azulMarinho },
  ofertaPreco: { fontSize: 14 },
  ofertaAPartir: { color: cores.textoSuave, fontSize: 13, fontWeight: '600' },
  ofertaValor: { color: cores.verde, fontWeight: '800' },

  feature: { width: '47%', flexGrow: 1, alignItems: 'center', gap: 6 },
  featureTitulo: { ...tipografia.secao, color: cores.azulMarinho, textAlign: 'center' },
  featureSub: { fontSize: 12, color: cores.textoSuave, textAlign: 'center', lineHeight: 17, fontWeight: '500' },

  newsletter: { backgroundColor: cores.azulMarinho, margin: espaco.lg, borderRadius: raio.lg, padding: 18, gap: espaco.md },
  newsletterTopo: { flexDirection: 'row', gap: espaco.md, alignItems: 'center' },
  newsletterTitulo: { color: cores.textoInverso, fontWeight: '800', fontSize: 17 },
  newsletterSub: { color: cores.textoInverso, opacity: 0.85, fontSize: 12, marginTop: 2 },
  newsletterForm: { flexDirection: 'row', gap: espaco.sm },
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
  rodapeInner: { width: '100%', maxWidth: 1100, alignSelf: 'center' },
  rodapeCols: { gap: 20 },
  rodapeColsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 48 },
  rodapeCol: { gap: 12 },
  rodapeColFlex: { flex: 1 },
  rodapeBaseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  rodapeBaixe: { color: cores.textoInverso, fontWeight: '800', fontSize: 18 },
  rodapeBaixeSub: { color: cores.textoInverso, opacity: 0.8, fontSize: 13, marginTop: 4, fontWeight: '500' },
  lojas: { flexDirection: 'row', gap: espaco.md, marginTop: espaco.md },
  loja: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: raio.md, paddingVertical: 10, paddingHorizontal: 14 },
  lojaTexto: { color: cores.textoInverso, fontWeight: '700', fontSize: 13 },
  rodapeLinha: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 20 },
  rodapeSeguranca: { flexDirection: 'row', gap: espaco.sm, alignItems: 'center', marginBottom: 18 },
  rodapeSegTitulo: { color: cores.textoInverso, fontWeight: '800', fontSize: 14 },
  rodapeSegSub: { color: cores.textoInverso, opacity: 0.8, fontSize: 12, marginTop: 2 },
  rodapeRotulo: { color: cores.textoClaro, fontSize: 12, fontWeight: '800', letterSpacing: 0.5, marginBottom: 10 },
  pagamentos: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, marginBottom: 18 },
  pagamentosTexto: { color: cores.textoInverso, opacity: 0.9, fontSize: 13, fontWeight: '600' },
  social: { flexDirection: 'row', gap: 20, marginBottom: 4 },
  rodapeEmpresa: { color: cores.textoInverso, fontWeight: '800', fontSize: 13 },
  rodapeCnpj: { color: cores.textoInverso, opacity: 0.7, fontSize: 12, marginTop: 2 },
  rodapeLinks: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, marginTop: 12 },
  rodapeLink: { color: cores.textoInverso, opacity: 0.9, fontSize: 12, fontWeight: '700' },
  rodapeSep: { color: cores.textoClaro },
  rodapeCopy: { color: cores.textoClaro, fontSize: 11, marginTop: 12 },
});
