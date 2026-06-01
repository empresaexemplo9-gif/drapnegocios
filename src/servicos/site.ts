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

/** Monta a URL do checkout oficial, marcando a origem como o app. */
export function linkCheckoutOficial(): string {
  const query = new URLSearchParams({ utm_source: 'app', utm_medium: 'checkout' });
  return `${SITE_OFICIAL.url}/?${query.toString()}`;
}

/** Abre o checkout oficial no navegador do dispositivo. */
export async function abrirCheckoutOficial(): Promise<void> {
  await Linking.openURL(linkCheckoutOficial());
}
