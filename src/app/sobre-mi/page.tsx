import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Sobre mí | The Mom Coach',
  description: 'Conoce la historia, certificaciones y filosofía detrás de The Mom Coach.',
};

export default function SobreMiPage() {
  return (
    <div style={{ paddingTop: '120px', paddingBottom: '80px', backgroundColor: 'var(--color-cream)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Breadcrumb / Back */}
        <Link href="/" className="font-inter" style={{ color: 'var(--color-blue-gray)', fontSize: '0.9rem', display: 'inline-block', marginBottom: '24px' }}>
          ← Volver al inicio
        </Link>

        {/* Hero Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center', marginBottom: '80px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-turquoise)' }} className="font-inter">
              Conoce a tu coach
            </span>
            <h1 className="font-forum" style={{ fontSize: '3rem', color: 'var(--color-blue-gray)', marginTop: '8px', marginBottom: '24px', lineHeight: 1.15 }}>
              Hola, soy la creadora de The Mom Coach
            </h1>
            <p className="font-inter" style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--foreground)', opacity: 0.9, marginBottom: '24px' }}>
              Soy enfermera, consultora de sueño infantil certificada y apasionada por la nutrición materno-infantil. Mi misión es acompañarte para que la maternidad no signifique estar agotada sin descanso ni respuestas.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="https://wa.me/573102158656?text=Hola%20quiero%20conocer%20mas%20sobre%20tus%20asesorias" target="_blank">
                <Button variant="primary">Hablar por WhatsApp</Button>
              </Link>
              <Link href="/sueno">
                <Button variant="outline">Ver planes de sueño</Button>
              </Link>
            </div>
          </div>
          <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
            <img
              src="https://www.themomcoaching.com/wp-content/uploads/2023/12/cropped-THE-MOM-COACH-LOGO-PPL.png"
              alt="The Mom Coach"
              style={{ width: '100%', height: 'auto', display: 'block', backgroundColor: 'white', padding: '40px' }}
            />
          </div>
        </div>

        {/* Story Section */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '48px', boxShadow: 'var(--shadow-md)', marginBottom: '64px' }}>
          <h2 className="font-forum" style={{ fontSize: '2.2rem', color: 'var(--color-blue-gray)', marginBottom: '24px' }}>
            Mi Historia y Filosofía
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            <div>
              <h3 className="font-forum" style={{ fontSize: '1.4rem', color: 'var(--color-turquoise)', marginBottom: '12px' }}>
                Respetuosa y Empática
              </h3>
              <p className="font-inter" style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--foreground)', opacity: 0.85 }}>
                Entiendo el agotamiento extremo porque he acompañado a cientos de familias. Ningún método se aplica a la fuerza; cada plan se adapta a la dinámica de tu hogar y al temperamento de tu bebé.
              </p>
            </div>
            <div>
              <h3 className="font-forum" style={{ fontSize: '1.4rem', color: 'var(--color-turquoise)', marginBottom: '12px' }}>
                Basada en Evidencia
              </h3>
              <p className="font-inter" style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--foreground)', opacity: 0.85 }}>
                Combinamos fisiología del sueño y nutrición pediátrica respaldada científicamente con técnicas gentiles que priorizan siempre el apego seguro.
              </p>
            </div>
            <div>
              <h3 className="font-forum" style={{ fontSize: '1.4rem', color: 'var(--color-turquoise)', marginBottom: '12px' }}>
                Resultados Duraderos
              </h3>
              <p className="font-inter" style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--foreground)', opacity: 0.85 }}>
                Te entrego herramientas claras no solo para hoy, sino para manejar regresiones de sueño, cambios de etapa y transiciones de siestas con seguridad.
              </p>
            </div>
          </div>
        </div>

        {/* Certifications Grid */}
        <div style={{ textCenter: 'center', textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-turquoise)' }} className="font-inter">
            Acreditaciones
          </span>
          <h2 className="font-forum" style={{ fontSize: '2.4rem', color: 'var(--color-blue-gray)', marginTop: '8px', marginBottom: '32px' }}>
            Certificaciones Internacionales
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { title: 'Pediatric Sleep Consultant', org: 'Family Sleep Institute' },
              { title: 'Alimentación Complementaria & BLW', org: 'Especialización Pediátrica' },
              { title: 'Manejo de Picky Eaters', org: 'Nutrición Infantil Avanzada' },
              { title: 'Lactancia y Destete Respetuoso', org: 'Formación Materno-Infantil' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(113, 176, 180, 0.3)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>📜</div>
                <h4 className="font-forum" style={{ fontSize: '1.2rem', color: 'var(--color-blue-gray)', marginBottom: '8px' }}>{c.title}</h4>
                <p className="font-inter" style={{ fontSize: '0.85rem', color: 'var(--foreground)', opacity: 0.7 }}>{c.org}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ background: 'linear-gradient(135deg, var(--color-blue-gray), #384260)', color: 'white', borderRadius: '24px', padding: '48px 32px', textAlign: 'center' }}>
          <h2 className="font-forum" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>¿Lista para transformar tus noches y días?</h2>
          <p className="font-inter" style={{ fontSize: '1.05rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 32px' }}>
            Agenda tu llamada de valoración gratuita o explora nuestros programas personalizados.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="https://wa.me/573102158656?text=Hola%20quiero%20agendar%20una%20llamada" target="_blank">
              <Button variant="secondary">Agendar por WhatsApp</Button>
            </Link>
            <Link href="/tienda">
              <Button variant="outline" style={{ color: 'white', borderColor: 'white' }}>Ver la Tienda</Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
