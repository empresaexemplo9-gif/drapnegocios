import React, { useEffect, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, sombra } from '../tema';

const LOGO = require('../../assets/logo.png');

/**
 * Banner que aparece automaticamente (somente na web) convidando a instalar o
 * app na tela inicial. No Android/Chrome dispara a janela nativa de instalação
 * ao tocar em "Instalar"; no iOS/Safari mostra as instruções (Compartilhar →
 * Adicionar à Tela de Início), pois o iOS não permite instalação programática.
 *
 * Não renderiza nada no app nativo nem quando já está instalado (standalone).
 */
export function PromptInstalacao() {
  const [evento, setEvento] = useState<{ prompt: () => void; userChoice: Promise<unknown> } | null>(
    null,
  );
  const [visivel, setVisivel] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const w = window as unknown as {
      matchMedia?: (q: string) => { matches: boolean };
      addEventListener: (t: string, cb: (e: unknown) => void) => void;
      removeEventListener: (t: string, cb: (e: unknown) => void) => void;
    };
    const nav = navigator as unknown as { userAgent?: string; standalone?: boolean };

    const jaInstalado =
      w.matchMedia?.('(display-mode: standalone)')?.matches === true || nav.standalone === true;
    if (jaInstalado) return;

    const ua = (nav.userAgent || '').toLowerCase();
    if (/iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua)) {
      setIos(true);
      setVisivel(true);
      return;
    }

    const aoPrompt = (e: unknown) => {
      (e as { preventDefault: () => void }).preventDefault();
      setEvento(e as { prompt: () => void; userChoice: Promise<unknown> });
      setVisivel(true);
    };
    const aoInstalar = () => setVisivel(false);
    w.addEventListener('beforeinstallprompt', aoPrompt);
    w.addEventListener('appinstalled', aoInstalar);
    return () => {
      w.removeEventListener('beforeinstallprompt', aoPrompt);
      w.removeEventListener('appinstalled', aoInstalar);
    };
  }, []);

  if (Platform.OS !== 'web' || !visivel) return null;

  const instalar = async () => {
    if (!evento) return;
    evento.prompt();
    try {
      await evento.userChoice;
    } catch {
      /* ignora */
    }
    setEvento(null);
    setVisivel(false);
  };

  return (
    <View style={styles.barra} pointerEvents="box-none">
      <View style={styles.cartao}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>Instalar o ViajeBrasil</Text>
          <Text style={styles.sub}>
            {ios
              ? 'Toque em Compartilhar e em "Adicionar à Tela de Início".'
              : 'Acesso rápido, em tela cheia, direto da tela inicial.'}
          </Text>
        </View>
        {ios ? (
          <Ionicons name="share-outline" size={24} color={cores.azul} />
        ) : (
          <Pressable style={styles.botao} onPress={instalar}>
            <Text style={styles.botaoTxt}>Instalar</Text>
          </Pressable>
        )}
        <Pressable hitSlop={8} onPress={() => setVisivel(false)} style={styles.fechar}>
          <Ionicons name="close" size={20} color={cores.textoSuave} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    zIndex: 1000,
  },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 12,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
    ...sombra,
  },
  logo: { width: 44, height: 44 },
  titulo: { fontSize: 15, fontWeight: '800', color: cores.azulMarinho },
  sub: { fontSize: 12, color: cores.textoSuave, fontWeight: '600', marginTop: 2 },
  botao: {
    backgroundColor: cores.azul,
    borderRadius: raio.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  botaoTxt: { color: cores.textoInverso, fontWeight: '800', fontSize: 14 },
  fechar: { padding: 4 },
});
