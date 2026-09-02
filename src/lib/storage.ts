/**
 * Convierte el nombre de un archivo en una clave segura para Supabase Storage:
 * sin tildes, espacios ni caracteres especiales (Storage rechaza esas claves
 * con "Invalid key").
 */
export function safeStorageName(name: string): string {
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : '';
  const cleanBase =
    base
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase()
      .slice(0, 60) || 'archivo';
  return `${cleanBase}${ext.replace(/[^a-z0-9.]/g, '')}`;
}
