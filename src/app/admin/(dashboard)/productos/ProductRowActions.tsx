'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { deleteProductAction, togglePublishAction } from '../../actions';
import type { Product } from '@/lib/types';

export default function ProductRowActions({ product }: { product: Product }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="admin-row-actions">
      <Link href={`/admin/productos/${product.id}/editar`}>Editar</Link>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(() => {
            togglePublishAction(product.id, !product.is_published);
          })
        }
      >
        {product.is_published ? 'Ocultar' : 'Publicar'}
      </button>
      <button
        type="button"
        className="danger"
        disabled={isPending}
        onClick={() => {
          if (!window.confirm(`¿Eliminar "${product.title}"? Esta acción no se puede deshacer.`)) return;
          startTransition(() => {
            deleteProductAction(product.id);
          });
        }}
      >
        Eliminar
      </button>
    </div>
  );
}
