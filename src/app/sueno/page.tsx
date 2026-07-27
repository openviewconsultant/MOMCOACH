import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Asesorías de Sueño Infantil | The Mom Coach',
  description: 'Programas y planes de sueño infantil personalizados para bebés de 0 meses a 6 años.',
};

const sleepServices = [
  {
    title: 'Programa Recién Nacidos (0 a 4 meses)',
    price: 'USD $95',
    tag: 'Previene problemas de sueño',
    desc: 'Diseñado para crear bases saludables de sueño desde los primeros días. Aprende sobre ventanas de sueño, ambiente ideal y ritmos biológicos sin presiones.',
    features: [
      'Guía paso a paso de hábitos saludables',
      'Manejo del día y la noche',
      'Prevención del sobrecansancio',
      'Acceso a videollamada o resolución de dudas',
    ],
    whatsappText: 'Hola! Quiero información sobre el Programa Recién Nacidos',
  },
  {
    title: 'Plan de Sueño Infantil (4 meses a 6 años)',
    price: 'USD $260',
    tag: 'Acompañamiento 1 a 1',
    desc: 'Un plan totalmente personalizado según el temperamento de tu hijo y la dinámica familiar, con seguimiento diario para lograr noches completas y descanso continuo.',
    features: [
      'Evaluación inicial completa del caso',
      'Plan personalizado escrito',
      'Llamada de consulta de 60 minutos',
      '2 semanas de seguimiento diario vía WhatsApp',
    ],
    whatsappText: 'Hola! Quiero reservar el Plan de Sueño Infantil (4m a 6 años)',
    popular: true,
  },
  {
    title: 'Llamada de Consulta de Sueño',
    price: 'USD $65',
    tag: 'Sesión express de orientación',
    desc: 'Ideal si necesitas resolver dudas puntuales sobre regresiones de sueño, transiciones de siestas, viajes o ajustar un plan que ya tenías.',
    features: [
      'Videollamada de 45 minutos 1 a 1',
      'Análisis de la rutina actual',
      'Recomendaciones escritas al finalizar',
    ],
    whatsappText: 'Hola! Quiero agendar una Llamada de consulta de sueño',
  },
];

const sleepGuides = [
  { title: 'Guía: Cómo Solucionar las Siestas Cortas', price: 'USD $16', link: '/tienda' },
  { title: 'Guía: Cómo manejar las Regresiones de Sueño', price: 'USD $16', link: '/tienda' },
  { title: 'Guía: Transición de Siestas', price: 'USD $16', link: '/tienda' },
  { title: 'Guía: Sueño, Viajes y Eventos Especiales', price: 'USD $16', link: '/tienda' },
  { title: 'Guía: Todo sobre el chupo', price: 'USD $12', link: '/tienda' },
];

export default function SuenoPage() {
  return (
    <div style={{ paddingTop: '120px', paddingBottom: '80px', backgroundColor: 'var(--color-cream)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        
        <Link href="/" className="font-inter" style={{ color: 'var(--color-blue-gray)', fontSize: '0.9rem', display: 'inline-block', marginBottom: '24px' }}>
          ← Volver al inicio
        </Link>

        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 64px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-turquoise)' }} className="font-inter">
            Servicios de Sueño Infantil
          </span>
          <h1 className="font-forum" style={{ fontSize: '3rem', color: 'var(--color-blue-gray)', marginTop: '8px', marginBottom: '16px' }}>
            Sueño y Descanso Familiar
          </h1>
          <p className="font-inter" style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--foreground)', opacity: 0.85 }}>
            Te acompaño de forma empática y respetuosa para lograr que tu bebé y toda tu familia vuelvan a dormir noches completas.
          </p>
        </div>

        {/* Services Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '80px' }}>
          {sleepServices.map((service, idx) => (
            <div
              key={idx}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '36px 32px',
                boxShadow: service.popular ? 'var(--shadow-lg)' : 'var(--shadow-md)',
                border: service.popular ? '2px solid var(--color-turquoise)' : '1px solid rgba(0,0,0,0.06)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {service.popular && (
                  <span style={{ position: 'absolute', top: '-14px', right: '24px', background: 'var(--color-turquoise)', color: 'white', fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px', borderRadius: '12px', textTransform: 'uppercase' }} className="font-inter">
                    Más popular
                  </span>
                )}
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-coral)', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="font-inter">
                  {service.tag}
                </span>
                <h3 className="font-forum" style={{ fontSize: '1.75rem', color: 'var(--color-blue-gray)', marginTop: '6px', marginBottom: '12px' }}>
                  {service.title}
                </h3>
                <p className="font-forum" style={{ fontSize: '2.2rem', color: 'var(--color-turquoise)', marginBottom: '16px' }}>
                  {service.price}
                </p>
                <p className="font-inter" style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--foreground)', opacity: 0.85, marginBottom: '24px' }}>
                  {service.desc}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0' }}>
                  {service.features.map((feat, fIdx) => (
                    <li key={fIdx} className="font-inter" style={{ fontSize: '0.88rem', color: 'var(--foreground)', opacity: 0.9, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--color-turquoise)', fontWeight: 'bold' }}>✓</span> {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href={`https://wa.me/573102158656?text=${encodeURIComponent(service.whatsappText)}`} target="_blank">
                <Button variant={service.popular ? 'primary' : 'secondary'} style={{ width: '100%' }}>
                  Reservar Asesoría
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Guides Section */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '48px 36px', boxShadow: 'var(--shadow-md)', marginBottom: '64px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 className="font-forum" style={{ fontSize: '2.2rem', color: 'var(--color-blue-gray)', marginBottom: '8px' }}>
              Guías Digitales de Sueño
            </h2>
            <p className="font-inter" style={{ fontSize: '0.95rem', color: 'var(--foreground)', opacity: 0.8 }}>
              Formatos prácticos y descargables para aplicar a tu propio ritmo.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {sleepGuides.map((guide, idx) => (
              <div key={idx} style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', padding: '20px', textAlign: 'center', background: 'var(--color-cream)' }}>
                <h4 className="font-forum" style={{ fontSize: '1.1rem', color: 'var(--color-blue-gray)', marginBottom: '8px' }}>{guide.title}</h4>
                <p className="font-inter" style={{ fontWeight: 600, color: 'var(--color-turquoise)', marginBottom: '16px' }}>{guide.price}</p>
                <Link href={guide.link}>
                  <Button variant="secondary" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>Ir a la tienda</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
