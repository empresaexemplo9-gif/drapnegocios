/**
 * Encaminhamento para a white label da Buson (canal oficial de venda).
 *
 * A compra de passagens é finalizada no canal oficial fornecido pela Buson.
 * O app apenas leva o cliente final até lá — sem reproduzir, adaptar ou
 * embutir o sistema do parceiro, em conformidade com o contrato Buson.
 */
import { Linking } from 'react-native';
import { WHITE_LABEL } from './config';

/**
 * Monta a URL da white label (canal oficial), marcando a origem como o app.
 * `secao` vai como utm_campaign (ex.: 'onibus', 'aereo') para rastreio.
 */
export function linkWhiteLabel(secao?: string, medium = 'app'): string {
  const query = new URLSearchParams({ utm_source: 'app', utm_medium: medium });
  if (secao) query.set('utm_campaign', secao);
  return `${WHITE_LABEL.url}/?${query.toString()}`;
}

/** Abre a white label (canal oficial) no navegador do dispositivo. */
export async function abrirWhiteLabel(secao?: string): Promise<void> {
  await Linking.openURL(linkWhiteLabel(secao));
}

/** O checkout encaminha para a white label (medium = checkout). */
export function linkCheckoutOficial(): string {
  return linkWhiteLabel(undefined, 'checkout');
}

/** Abre o checkout oficial (white label) no navegador do dispositivo. */
export async function abrirCheckoutOficial(): Promise<void> {
  await Linking.openURL(linkCheckoutOficial());
}
