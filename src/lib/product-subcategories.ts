/**
 * Subcategorías de producto: única fuente para el formulario del admin, el
 * filtro del admin y el filtro de la tienda. Antes cada uno tenía su propia
 * lista y no coincidían (el formulario no ofrecía Ebook/Recetario/Asesoría,
 * y la tienda no filtraba por Curso).
 */
export const PRODUCT_SUBCATEGORIES = [
  'Ebook',
  'Recetario',
  'Asesoría',
  'Curso',
  'Tarjeta de regalo',
  'Gratuitos',
] as const;

export type ProductSubcategory = (typeof PRODUCT_SUBCATEGORIES)[number];
