import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { BlogPost } from '@/lib/types';
import Reveal from '@/components/ui/Reveal';
import '../blog.css';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!post) return { title: 'Artículo | The Mom Coach' };

  return {
    title: `${post.title} | The Mom Coach`,
    description: post.excerpt,
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!post) {
    notFound();
  }

  const typedPost = post as BlogPost;
  const paragraphs = typedPost.content.split(/\n\n+/).filter(Boolean);

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '80px', backgroundColor: 'var(--color-cream)', minHeight: '100vh' }}>
      <div style={{ padding: '0 5%' }}>

        <Link href="/blog" className="font-inter" style={{ color: 'var(--color-blue-gray)', fontSize: '0.9rem', display: 'inline-block', marginBottom: '24px' }}>
          ← Volver al blog
        </Link>

        <Reveal as="article" className="blog-post-article">
          <div className="blog-card-top" style={{ marginBottom: '20px' }}>
            <span className="blog-card-category font-inter">{typedPost.category}</span>
            <span className="blog-card-date font-inter">{formatDate(typedPost.published_at)}</span>
          </div>

          <h1 className="font-forum" style={{ fontSize: '2.4rem', color: 'var(--color-blue-gray)', marginBottom: '12px', lineHeight: 1.25 }}>
            {typedPost.title}
          </h1>

          <p className="font-inter" style={{ fontSize: '0.85rem', color: 'var(--foreground)', opacity: 0.5, marginBottom: '36px' }}>
            ⏱️ {typedPost.read_minutes} min de lectura
          </p>

          {typedPost.cover_image_url && (
            <img
              src={typedPost.cover_image_url}
              alt={typedPost.title}
              style={{ width: '100%', borderRadius: '20px', marginBottom: '36px', display: 'block' }}
            />
          )}

          <div className="blog-post-content">
            {paragraphs.map((para, idx) => (
              <p key={idx} className="font-inter">{para}</p>
            ))}
          </div>
        </Reveal>

      </div>
    </div>
  );
}
