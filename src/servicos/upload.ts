/**
 * Envio de foto (admin) — abre o seletor de arquivo na web, lê em base64 e
 * envia para `/api/admin/upload` (Vercel Blob), retornando a URL pública.
 * Disponível na versão web (o admin é usado no navegador).
 */
import { Platform } from 'react-native';
import { enviarJson } from './apiVercel';

interface ArquivoWeb {
  nome: string;
  contentType: string;
  base64: string;
}

export async function enviarFotoOferta(): Promise<string | null> {
  if (Platform.OS !== 'web') {
    throw new Error('O envio de foto está disponível na versão web. No app, cole a URL da imagem.');
  }
  const arquivo = await escolherArquivoWeb();
  if (!arquivo) return null;
  const { url } = await enviarJson<{ url: string }>('POST', '/api/admin/upload', arquivo);
  return url;
}

/** Abre o seletor de arquivo do navegador e devolve o conteúdo em base64. */
function escolherArquivoWeb(): Promise<ArquivoWeb | null> {
  const doc = (globalThis as { document?: any }).document;
  const Leitor = (globalThis as { FileReader?: any }).FileReader;
  if (!doc || !Leitor) return Promise.resolve(null);

  return new Promise((resolve) => {
    const input = doc.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new Leitor();
      reader.onload = () => {
        const res = String(reader.result ?? '');
        const base64 = res.includes(',') ? res.slice(res.indexOf(',') + 1) : res;
        resolve({ nome: file.name, contentType: file.type || 'image/jpeg', base64 });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    input.click();
  });
}
