'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { deleteBlogPostAction, togglePublishBlogAction } from '../../actions';
import type { BlogPost } from '@/lib/types';

export default function BlogRowActions({ post }: { post: BlogPost }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="admin-row-actions">
      <Link href={`/admin/blog/${post.id}/editar`}>Editar</Link>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(() => {
            togglePublishBlogAction(post.id, !post.is_published);
          })
        }
      >
        {post.is_published ? 'Ocultar' : 'Publicar'}
      </button>
      <button
        type="button"
        className="danger"
        disabled={isPending}
        onClick={() => {
          if (!window.confirm(`¿Eliminar "${post.title}"? Esta acción no se puede deshacer.`)) return;
          startTransition(() => {
            deleteBlogPostAction(post.id);
          });
        }}
      >
        Eliminar
      </button>
    </div>
  );
}
