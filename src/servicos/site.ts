/**
 * Encaminhamento para o site oficial da Viaje Brasil.
 *
 * A compra de passagens é finalizada no canal oficial (site próprio da
 * Viaje Brasil, que opera a Buson por trás). O app apenas leva o cliente
 * final até lá — sem reproduzir, adaptar ou embutir o sistema do parceiro,
 * em conformidade com o contrato Buson (cláusulas 5 e 12).
 */
import { Linking } from 'react-native';
import { SITE_OFICIAL } from './config';

/**
 * Monta a URL da white label (canal oficial), marcando a origem como o app.
 * `secao` permite direcionar (ex.: 'onibus', 'aereo') quando o canal suportar.
 */
export function linkWhiteLabel(secao?: string, medium = 'app'): string {
  const query = new URLSearchParams({ utm_source: 'app', utm_medium: medium });
  if (secao) query.set('secao', secao);
  return `${SITE_OFICIAL.url}/?${query.toString()}`;
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
