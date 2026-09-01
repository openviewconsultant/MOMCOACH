import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { BlogPost } from '@/lib/types';
import BlogRowActions from './BlogRowActions';

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .order('published_at', { ascending: false });

  const items = (posts ?? []) as BlogPost[];
  const publishedCount = items.filter((p) => p.is_published).length;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title font-fraunces">Blog</h1>
          <p className="admin-subtitle">Publica y gestiona los artículos del blog.</p>
        </div>
        <Link href="/admin/blog/nuevo" className="admin-new-btn">
          + Nuevo artículo
        </Link>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total de artículos</div>
          <div className="admin-stat-value">{items.length}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Publicados</div>
          <div className="admin-stat-value">{publishedCount}</div>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: '16px', color: 'var(--foreground)', opacity: 0.8 }}>
          Aún no hay artículos. Crea el primero.
        </div>
      ) : (
        <div className="admin-product-grid">
          {items.map((post) => (
            <div className="admin-product-card" key={post.id}>
              <div className="admin-product-card-image">
                <div className="admin-product-card-badges">
                  <span className={`admin-badge ${post.is_published ? 'published' : 'draft'}`}>
                    {post.is_published ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
                {post.cover_image_url ? (
                  <img src={post.cover_image_url} alt={post.title} />
                ) : (
                  <span>{post.title}</span>
                )}
              </div>
              <div className="admin-product-card-body">
                <div className="admin-product-card-title">{post.title}</div>
                <div className="admin-product-card-meta">
                  <span>{post.category}</span>
                  <span>{post.read_minutes} min</span>
                </div>
                <BlogRowActions post={post} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
