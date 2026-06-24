'use server';

import { gerarConteudo } from '@/lib/ia';

export interface EstadoGerador {
  texto: string;
  viaIA: boolean;
  erro?: string;
}

export async function gerarAction(
  _prev: EstadoGerador,
  formData: FormData,
): Promise<EstadoGerador> {
  const tema = String(formData.get('tema') ?? '').trim();
  if (tema.length < 3) {
    return { texto: '', viaIA: false, erro: 'Descreva o tema ou produto da campanha.' };
  }
  const redes = formData.getAll('redes').map(String);
  const r = await gerarConteudo({
    objetivo: String(formData.get('objetivo') ?? 'post'),
    tema,
    tom: String(formData.get('tom') ?? 'profissional'),
    redes,
  });
  return { texto: r.texto, viaIA: r.viaIA };
}
