import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { BlogPost } from '@/lib/types';
import Reveal from '@/components/ui/Reveal';
import { buildMetadata } from '@/lib/seo';
import './blog.css';

export const metadata = buildMetadata({
  title: 'Blog | The Mom Coach',
  description: 'Artículos, consejos e información basada en evidencia sobre sueño infantil, alimentación y crianza.',
  path: '/blog',
});

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: rawPosts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  const posts = (rawPosts ?? []) as BlogPost[];

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '80px', backgroundColor: 'var(--color-cream)', minHeight: '100vh' }}>
      <div style={{ padding: '0 5%' }}>

        <Link href="/" className="font-inter" style={{ color: 'var(--color-blue-gray)', fontSize: '0.9rem', display: 'inline-block', marginBottom: '24px' }}>
          ← Volver al inicio
        </Link>

        {/* Header */}
        <Reveal as="div" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 64px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-turquoise)' }} className="font-inter">
            Blog & Noticias
          </span>
          <h1 className="font-forum" style={{ fontSize: '3rem', color: 'var(--color-blue-gray)', marginTop: '8px', marginBottom: '16px' }}>
            Artículos y Consejos
          </h1>
        </Reveal>

        {posts.length === 0 ? (
          <div className="blog-empty-state font-inter">
            Muy pronto encontrarás aquí artículos y consejos.
          </div>
        ) : (
          <div className="blog-grid">
            {posts.map((post, idx) => (
              <Reveal key={post.id} as="div" delay={idx * 60}>
                <Link href={`/blog/${post.slug}`} className="blog-card" style={{ display: 'flex', height: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
                    <div>
                      <div className="blog-card-top">
                        <span className="blog-card-category font-inter">{post.category}</span>
                        <span className="blog-card-date font-inter">{formatDate(post.published_at)}</span>
                      </div>
                      <h3 className="font-forum blog-card-title">{post.title}</h3>
                      <p className="font-inter blog-card-excerpt">{post.excerpt}</p>
                    </div>
                    <div className="blog-card-footer">
                      <span className="blog-card-readtime font-inter">⏱️ {post.read_minutes} min de lectura</span>
                      <span className="blog-card-cta font-inter">Leer artículo →</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
