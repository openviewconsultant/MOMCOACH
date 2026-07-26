export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  description: string;
  /** Enlace de Google Drive ("Cualquier persona con el enlace puede ver/descargar") con el archivo del libro. */
  driveLink: string;
  /** URL de portada opcional. Si se omite, se muestra una portada de reemplazo. */
  img?: string;
}

/**
 * TODO: reemplazar por el catálogo real de libros.
 * - `driveLink` debe apuntar a un archivo de Google Drive compartido como
 *   "Cualquier persona con el enlace puede ver" (o descargar).
 * - `price` está en pesos colombianos (COP), sin decimales.
 */
export const books: Book[] = [
  {
    id: 'guia-sueno-primer-ano',
    title: 'Guía completa del sueño infantil: primer año',
    author: 'The Mom Coach',
    price: 45000,
    description: 'Todo lo que necesitas saber para acompañar el sueño de tu bebé durante su primer año de vida.',
    driveLink: 'https://drive.google.com/drive/folders/REEMPLAZAR-ID-CARPETA',
  },
  {
    id: 'libro-alimentacion-complementaria',
    title: 'Alimentación complementaria sin estrés',
    author: 'The Mom Coach',
    price: 38000,
    description: 'Una guía práctica para iniciar la alimentación complementaria de tu bebé con confianza.',
    driveLink: 'https://drive.google.com/drive/folders/REEMPLAZAR-ID-CARPETA',
  },
  {
    id: 'libro-picky-eaters',
    title: 'Picky Eaters: estrategias para niños selectivos',
    author: 'The Mom Coach',
    price: 32000,
    description: 'Herramientas y recetas para transformar la hora de comer en una experiencia positiva.',
    driveLink: 'https://drive.google.com/drive/folders/REEMPLAZAR-ID-CARPETA',
  },
];

export function getBookById(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}
