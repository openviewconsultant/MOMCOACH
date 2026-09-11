/**
 * Formularios de admisión (Google Forms) que se envían a la clienta en el
 * correo de "Pago recibido" cuando el pago de ciertos productos queda aprobado.
 *
 * Clave: `id` del producto en la tabla `products`.
 * Valor: URL del formulario. En el correo se muestra como un enlace
 * ("Haz clic aquí para diligenciar el formulario"), nunca como URL cruda.
 */
export const PRODUCT_INTAKE_FORMS: Record<string, string> = {
  // Plan de Sueño Infantil (4 meses a 6 años)
  'c1036eba-c771-41fe-9e35-c37f72cfb134': 'https://forms.gle/5ZizW2P41Q2TVuxB6',
};

/** Devuelve el primer formulario configurado para alguno de los productos de la orden. */
export function intakeFormForProducts(productIds: Array<string | null | undefined>): string | null {
  for (const id of productIds) {
    if (id && PRODUCT_INTAKE_FORMS[id]) return PRODUCT_INTAKE_FORMS[id];
  }
  return null;
}
