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
  const [productType, setProductType] = useState<'digital' | 'service'>(product?.product_type ?? 'digital');

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
        Modalidad
        <select name="product_type" value={productType} onChange={(e) => setProductType(e.target.value as 'digital' | 'service')}>
          <option value="digital">Producto Digital (Recetario, Guía, PDF)</option>
          <option value="service">Servicio / Asesoría (Programa, Consulta 1 a 1)</option>
        </select>
      </label>

      <label>
        Título
        <input type="text" name="title" defaultValue={product?.title} required />
      </label>

      <label>
        Subtítulo / Etiqueta corta (ej: "BLW & BLISS & Mixto", "Previene problemas de sueño")
        <input type="text" name="subtitle" defaultValue={product?.subtitle ?? ''} />
      </label>

      <label>
        Descripción
        <textarea name="description" defaultValue={product?.description} />
      </label>

      <label>
        Beneficios / Incluye (escribe una característica por línea)
        <textarea
          name="features"
          rows={4}
          placeholder={`Cortes seguros y presentación de alimentos\nPrevención de atragantamiento\nPlanificación de menú`}
          defaultValue={Array.isArray(product?.features) ? product.features.join('\n') : ''}
        />
      </label>

      <label>
        Mensaje predeterminado de WhatsApp (para botón de "Solicitar Asesoría")
        <input
          type="text"
          name="whatsapp_text"
          placeholder="Hola! Quiero información sobre este servicio"
          defaultValue={product?.whatsapp_text ?? ''}
        />
      </label>

      {productType === 'service' && (
        <label>
          Link de Cal.com / Calendario de reserva (ej: open-view-consultant-7ng550/alimentacion)
          <input
            type="text"
            name="cal_link"
            placeholder="open-view-consultant-7ng550/alimentacion"
            defaultValue={product?.cal_link ?? ''}
          />
        </label>
      )}

      <div className="admin-form-row">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span>Tipo de precio</span>
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
          <select name="category" defaultValue={product?.category ?? 'Alimentación'} required>
            <option value="Alimentación">Alimentación</option>
            <option value="Sueño infantil">Sueño infantil</option>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
        <label className="admin-checkbox-row">
          <input type="checkbox" name="is_popular" defaultChecked={product?.is_popular ?? false} />
          Destacado / Recomendado (Muestra la etiqueta especial en la tarjeta)
        </label>

        <label className="admin-checkbox-row">
          <input type="checkbox" name="is_published" defaultChecked={product?.is_published ?? true} />
          Publicado (visible en la web)
        </label>
      </div>

      {(state.error || uploadError) && <p className="admin-error">{state.error || uploadError}</p>}

      <button type="submit" className="admin-submit-btn" disabled={busy}>
        {isSubmitting ? 'Guardando…' : 'Guardar producto'}
      </button>
    </form>
  );
}
