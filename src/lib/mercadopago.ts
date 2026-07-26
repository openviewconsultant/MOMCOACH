import { MercadoPagoConfig } from 'mercadopago';

export function getMercadoPagoClient(): MercadoPagoConfig {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('Falta configurar la variable de entorno MERCADOPAGO_ACCESS_TOKEN');
  }
  return new MercadoPagoConfig({ accessToken });
}

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) {
    throw new Error('Falta configurar la variable de entorno NEXT_PUBLIC_SITE_URL');
  }
  return url.replace(/\/+$/, '');
}
