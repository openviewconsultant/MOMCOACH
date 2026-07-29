'use client';

import React, { useActionState, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { saveBlogPostAction, type BlogPostFormState } from '../../actions';
import type { BlogPost } from '@/lib/types';

const initialState: BlogPostFormState = { error: null };

export default function BlogForm({ post }: { post?: BlogPost }) {
  const [state, formAction, isSubmitting] = useActionState(saveBlogPostAction, initialState);
  const [coverUrl, setCoverUrl] = useState(post?.cover_image_url ?? '');
  const [uploadingCover, setUploadingCover] = useState(false);
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

  const busy = isSubmitting || uploadingCover;

  return (
    <form action={formAction} className="admin-form">
      {post && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="cover_image_url" value={coverUrl} />

      <label>
        Título
        <input type="text" name="title" defaultValue={post?.title} required />
      </label>

      <label>
        Slug (URL). Déjalo vacío para generarlo automáticamente desde el título.
        <input type="text" name="slug" defaultValue={post?.slug ?? ''} placeholder="mi-articulo-de-ejemplo" />
      </label>

      <div className="admin-form-row">
        <label style={{ flex: 1 }}>
          Categoría
          <select name="category" defaultValue={post?.category ?? 'Crianza'} required>
            <option value="Sueño">Sueño</option>
            <option value="Alimentación">Alimentación</option>
            <option value="Crianza">Crianza</option>
          </select>
        </label>

        <label style={{ flex: 1 }}>
          Tiempo de lectura (minutos)
          <input type="number" name="read_minutes" min={1} step={1} defaultValue={post?.read_minutes ?? 5} required />
        </label>
      </div>

      <label>
        Extracto (resumen corto que aparece en la lista del blog)
        <textarea name="excerpt" rows={2} defaultValue={post?.excerpt ?? ''} required />
      </label>

      <label>
        Contenido (separa los párrafos dejando una línea en blanco entre ellos)
        <textarea name="content" rows={14} defaultValue={post?.content ?? ''} required />
      </label>

      <label>
        Portada (imagen, opcional)
        <div className="admin-file-upload">
          <input type="file" accept="image/*" onChange={handleCoverChange} />
          {uploadingCover && <span className="admin-upload-status">Subiendo portada…</span>}
          {coverUrl && <img src={coverUrl} alt="Portada" className="admin-cover-preview" />}
        </div>
      </label>

      <label className="admin-checkbox-row">
        <input type="checkbox" name="is_published" defaultChecked={post?.is_published ?? false} />
        Publicado (visible en el blog)
      </label>

      {(state.error || uploadError) && <p className="admin-error">{state.error || uploadError}</p>}

      <button type="submit" className="admin-submit-btn" disabled={busy}>
        {isSubmitting ? 'Guardando…' : 'Guardar artículo'}
      </button>
    </form>
  );
}
