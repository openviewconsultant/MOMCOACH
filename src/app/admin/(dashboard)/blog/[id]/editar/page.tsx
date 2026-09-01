import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BlogForm from '../../BlogForm';
import type { BlogPost } from '@/lib/types';

export default async function EditarArticuloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from('blog_posts').select('*').eq('id', id).single();

  if (!post) {
    notFound();
  }

  return (
    <div>
      <Link href="/admin/blog" className="admin-back-link">← Volver al blog</Link>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title font-fraunces">Editar artículo</h1>
          <p className="admin-subtitle">{post.title}</p>
        </div>
      </div>
      <BlogForm post={post as BlogPost} />
    </div>
  );
}
