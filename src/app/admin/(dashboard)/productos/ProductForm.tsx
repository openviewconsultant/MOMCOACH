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
  const [isFree, setIsFree] = useState(product ? product.price === 0 : false);

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

      <div className="admin-form-row">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span>Tipo de producto</span>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal' }}>
              <input type="radio" name="priceType" checked={isFree} onChange={() => setIsFree(true)} />
              Gratis
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal' }}>
              <input type="radio" name="priceType" checked={!isFree} onChange={() => setIsFree(false)} />
              De pago
            </label>
          </div>
          {isFree ? (
            <input type="hidden" name="price" value={0} />
          ) : (
            <label style={{ marginTop: '8px' }}>
              Precio (USD)
              <input type="number" name="price" min={0} step={0.01} defaultValue={product?.price && product.price > 0 ? product.price : ''} required />
            </label>
          )}
        </div>

        <label style={{ flex: 1 }}>
          Categoría
          <select name="category" defaultValue={product?.category ?? 'Sueño infantil'} required>
            <option value="Sueño infantil">Sueño infantil</option>
            <option value="Alimentación">Alimentación</option>
            <option value="Gratuitos">Gratuitos</option>
            <option value="Tarjeta de regalo">Tarjeta de regalo</option>
            <option value="Libros">Libros</option>
          </select>
        </label>
      </div>

      <label>
        Portada (imagen, opcional)
        <div className="admin-file-upload">
          <input type="file" accept="image/*" onChange={handleCoverChange} />
          {uploadingCover && <span className="admin-upload-status">Subiendo portada…</span>}
          {coverUrl && <img src={coverUrl} alt="Portada" className="admin-cover-preview" />}
        </div>
      </label>

      <label>
        Archivo del producto (PDF u otro, para la entrega digital)
        <div className="admin-file-upload">
          <input type="file" onChange={handleFileChange} />
          {uploadingFile && <span className="admin-upload-status">Subiendo archivo…</span>}
          {filePath && <span className="admin-upload-status">Archivo cargado ✓</span>}
        </div>
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
