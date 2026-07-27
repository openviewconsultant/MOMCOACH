import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Blog | The Mom Coach',
  description: 'Artículos, consejos e información basada en evidencia sobre sueño infantil y nutrición.',
};

const blogPosts = [
  {
    id: 1,
    title: '¿Regresión de sueño de los 4 meses? Todo lo que necesitas saber',
    category: 'Sueño Infantil',
    date: '15 Enero, 2026',
    excerpt: 'Descubre por qué ocurre este cambio fisiológico en el cerebro de tu bebé y cómo acompañarlo pacientemente sin perder la calma.',
    readTime: '5 min de lectura',
  },
  {
    id: 2,
    title: 'BLW vs Alimentación Tradicional: ¿Cuál es mejor para tu bebé?',
    category: 'Alimentación',
    date: '02 Enero, 2026',
    excerpt: 'Analizamos las ventajas de la autoalimentación guiada por el bebé frente a los purés y papillas según las últimas recomendaciones pediátricas.',
    readTime: '7 min de lectura',
  },
  {
    id: 3,
    title: '5 Mitos comunes sobre el descanso y las siestas de los recién nacidos',
    category: 'Sueño Infantil',
    date: '20 Diciembre, 2025',
    excerpt: 'Desmitificamos ideas antiguas como "mantenerlo despierto para que duerma más de noche" y te explicamos el papel del sobrecansancio.',
    readTime: '4 min de lectura',
  },
  {
    id: 4,
    title: 'Mi hijo no quiere comer verduras: Estrategias para Picky Eaters',
    category: 'Alimentación',
    date: '10 Diciembre, 2025',
    excerpt: 'Técnicas de exposición sin presión, presentación lúdica de platillos y cómo reducir la ansiedad durante la hora del almuerzo.',
    readTime: '6 min de lectura',
  },
];

export default function BlogPage() {
  return (
    <div style={{ paddingTop: '120px', paddingBottom: '80px', backgroundColor: 'var(--color-cream)', minHeight: '100vh' }}>
      <div style={{ width: '100%', padding: '0 5%' }}>
        
        <Link href="/" className="font-inter" style={{ color: 'var(--color-blue-gray)', fontSize: '0.9rem', display: 'inline-block', marginBottom: '24px' }}>
          ← Volver al inicio
        </Link>

        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 64px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-turquoise)' }} className="font-inter">
            Blog & Noticias
          </span>
          <h1 className="font-forum" style={{ fontSize: '3rem', color: 'var(--color-blue-gray)', marginTop: '8px', marginBottom: '16px' }}>
            Artículos y Consejos
          </h1>
          <p className="font-inter" style={{ fontSize: '1.05rem', color: 'var(--foreground)', opacity: 0.85, lineHeight: 1.6 }}>
            Información práctica y respetuosa respaldada por la ciencia para guiarte en cada etapa de la crianza.
          </p>
        </div>

        {/* Blog Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
          {blogPosts.map((post) => (
            <article
              key={post.id}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-turquoise)', background: 'rgba(113,176,180,0.12)', padding: '4px 10px', borderRadius: '12px' }} className="font-inter">
                    {post.category}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--foreground)', opacity: 0.5 }} className="font-inter">
                    {post.date}
                  </span>
                </div>
                <h3 className="font-forum" style={{ fontSize: '1.5rem', color: 'var(--color-blue-gray)', marginBottom: '12px', lineHeight: 1.3 }}>
                  {post.title}
                </h3>
                <p className="font-inter" style={{ fontSize: '0.9rem', color: 'var(--foreground)', opacity: 0.8, lineHeight: 1.6, marginBottom: '24px' }}>
                  {post.excerpt}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--foreground)', opacity: 0.5 }} className="font-inter">
                  ⏱️ {post.readTime}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-turquoise)' }} className="font-inter">
                  Leer artículo →
                </span>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
}
