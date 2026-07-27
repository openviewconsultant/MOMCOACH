'use client';

import React, { useActionState, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { saveProductAction, type ProductFormState } from '../../actions';
import type { Product } from '@/lib/types';

const initialState: ProductFormState = { error: null };

export default function ProductForm({ product }: { product?: Product }) {
  const [state, formAction, isSubmitting] = useActionState(saveProductAction, initialState);
  const [coverUrl, setCoverUrl] = useState(product?.cover_image_url ?? '');
  const [filePath, setFilePath] = useState(product?.file_path ?? '');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setUploadError(null);
    try {
      const supabase = createClient();
      const path = `${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from('portadas').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('portadas').getPublicUrl(path);
      setCoverUrl(data.publicUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'No se pudo subir la portada');
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setUploadError(null);
    try {
      const supabase = createClient();
      const path = `${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from('productos').upload(path, file, { upsert: true });
      if (error) throw error;
      setFilePath(path);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'No se pudo subir el archivo');
    } finally {
      setUploadingFile(false);
    }
  }

  const busy = isSubmitting || uploadingCover || uploadingFile;

  return (
    <form action={formAction} className="admin-form">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="cover_image_url" value={coverUrl} />
      <input type="hidden" name="file_path" value={filePath} />

      <label>
        Título
        <input type="text" name="title" defaultValue={product?.title} required />
      </label>

      <label>
        Descripción
        <textarea name="description" defaultValue={product?.description} />
      </label>

      <label>
        Precio (COP, 0 = gratis)
        <input type="number" name="price" min={0} step={1} defaultValue={product?.price ?? 0} required />
      </label>

      <label>
        Categoría
        <input type="text" name="category" defaultValue={product?.category ?? 'Libros'} required />
      </label>

      <label>
        Portada (imagen, opcional)
        <input type="file" accept="image/*" onChange={handleCoverChange} />
        {uploadingCover && <span>Subiendo portada…</span>}
        {coverUrl && <img src={coverUrl} alt="Portada" style={{ maxWidth: 120, borderRadius: 8 }} />}
      </label>

      <label>
        Archivo del producto (PDF u otro, para la entrega digital)
        <input type="file" onChange={handleFileChange} />
        {uploadingFile && <span>Subiendo archivo…</span>}
        {filePath && <span>Archivo cargado ✓</span>}
      </label>

      <label className="admin-checkbox-row">
        <input type="checkbox" name="is_published" defaultChecked={product?.is_published ?? false} />
        Publicado (visible en la tienda)
      </label>

      {(state.error || uploadError) && <p className="admin-error">{state.error || uploadError}</p>}

      <button type="submit" className="admin-submit-btn" disabled={busy}>
        {isSubmitting ? 'Guardando…' : 'Guardar producto'}
      </button>
    </form>
  );
}
