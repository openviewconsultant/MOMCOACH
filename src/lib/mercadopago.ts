import { MercadoPagoConfig } from 'mercadopago';

export function getMercadoPagoClient(): MercadoPagoConfig {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('Falta configurar la variable de entorno MERCADOPAGO_ACCESS_TOKEN');
  }
  return new MercadoPagoConfig({ accessToken });
}

// Con credenciales TEST- (sandbox), Mercado Pago devuelve tanto init_point
// (checkout de producción, que exige loguearse con una cuenta real) como
// sandbox_init_point (checkout de prueba, pensado para usuarios de prueba
// creados en el panel de developers). Hay que usar el segundo mientras se
// esté en modo sandbox, si no el flujo termina pidiendo una cuenta real.
export function isSandboxMode(): boolean {
  return (process.env.MERCADOPAGO_ACCESS_TOKEN || '').startsWith('TEST-');
}

export function resolveCheckoutUrl(preference: { init_point?: string; sandbox_init_point?: string }): string | undefined {
  return isSandboxMode() ? preference.sandbox_init_point || preference.init_point : preference.init_point;
}

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) {
    throw new Error('Falta configurar la variable de entorno NEXT_PUBLIC_SITE_URL');
  }
  return url.replace(/\/+$/, '');
}
