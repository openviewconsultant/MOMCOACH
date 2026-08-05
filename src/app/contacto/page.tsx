import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Contacto | The Mom Coach',
  description: 'Escríbenos para agendar tu asesoría de sueño o consultar información de nuestros programas.',
  path: '/contacto',
  image: 'https://www.themomcoaching.com/wp-content/uploads/2023/12/DENIS-05.webp',
});

const faqs = [
  {
    q: '¿A partir de qué edad se puede iniciar una asesoría de sueño?',
    a: 'Para recién nacidos (0-4 meses) trabajamos en prevención y creación de hábitos de descanso saludables. A partir de los 4 meses implementamos planes de sueño estructurados y personalizados.',
  },
  {
    q: '¿Las asesorías son virtuales o presenciales?',
    a: 'Son 100% virtuales a través de videollamada y seguimiento continuo por WhatsApp, lo que permite atender a familias en cualquier país del mundo.',
  },
  {
    q: '¿Qué método utilizas para enseñar a dormir?',
    a: 'Trabajamos con enfoques gentiles y progresivos basados en fisiología del sueño y apego seguro. Adaptamos cada técnica al temperamento del bebé y las creencias de la familia.',
  },
  {
    q: '¿Cómo funciona la asesoría de Picky Eaters?',
    a: 'Hacemos una evaluación del comportamiento a la hora de comer y diseñamos un plan de abordaje sensorial y emocional para eliminar la ansiedad en la mesa.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
};

export default function ContactoPage() {
  return (
    <div style={{ paddingTop: '120px', paddingBottom: '80px', backgroundColor: 'var(--color-cream)', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div style={{ padding: '0 5%' }}>

        <Link href="/" className="font-inter" style={{ color: 'var(--color-blue-gray)', fontSize: '0.9rem', display: 'inline-block', marginBottom: '24px' }}>
          ← Volver al inicio
        </Link>

        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 64px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-turquoise)' }} className="font-inter">
            Estamos para ayudarte
          </span>
          <h1 className="font-forum" style={{ fontSize: '3rem', color: 'var(--color-blue-gray)', marginTop: '8px', marginBottom: '16px' }}>
            Hablemos de tu descanso
          </h1>
          <p className="font-inter" style={{ fontSize: '1.05rem', color: 'var(--foreground)', opacity: 0.85, lineHeight: 1.6 }}>
            ¿Tienes dudas sobre cuál programa elegir? Escríbenos por WhatsApp para una respuesta rápida o envíanos un mensaje.
          </p>
        </div>

        {/* Sobre mí / Mi historia */}
        <div
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: '48px 40px',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '48px',
            display: 'grid',
            gridTemplateColumns: 'minmax(180px, 220px) 1fr',
            gap: '40px',
            alignItems: 'start',
          }}
        >
          <img
            src="https://www.themomcoaching.com/wp-content/uploads/2023/12/DENIS-05.webp"
            alt="Denisse, fundadora de The Mom Coach"
            style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: '50%', objectFit: 'cover', boxShadow: 'var(--shadow-sm)' }}
          />
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-turquoise)' }} className="font-inter">
              Sobre mí
            </span>
            <h2 className="font-forum" style={{ fontSize: '1.8rem', color: 'var(--color-blue-gray)', margin: '8px 0 20px' }}>
              Mi historia
            </h2>
            <p className="font-inter" style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--foreground)', opacity: 0.85, marginBottom: '16px' }}>
              Cuando quedé embarazada empecé a investigar sobre puericultura y a leer sobre diferentes temas todos relacionados con la maternidad y la crianza. Ahí encontré apasionante el tema del sueño y el descanso, sobre todo por su relación directa con la salud mental y con la calidad de vida que viene junto con descansar correctamente.
            </p>
            <p className="font-inter" style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--foreground)', opacity: 0.85, marginBottom: '16px' }}>
              Al tener a mi hija, noté como se normaliza el estar privada de sueño y como muchas mamás y familias sufren por falta de descanso. También noté que era común el no hablar del tema ni buscar ayuda por miedo a ser criticadas, por sentir culpa de sentirse mal y por vergüenza de querer aceptar que no todo en la maternidad es color de rosa. Así mismo, noté mucho silencio ante temas como la depresión y la ansiedad post parto.
            </p>
            <p className="font-inter" style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--foreground)', opacity: 0.85 }}>
              The Mom Coach nace para que encontremos soluciones y acompañamiento. Donde no criticamos estilos de crianza, sino que buscamos el método que mejor se ajuste a tu familia. Es el espacio donde las mamás pueden contar con apoyo sin ser juzgadas y donde encontrarán una mano amiga dispuesta a ayudar.
            </p>
          </div>
        </div>

        {/* Grid: Form & Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', marginBottom: '80px' }}>

          {/* Direct Channels */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: 'var(--shadow-md)' }}>
            <h2 className="font-forum" style={{ fontSize: '1.8rem', color: 'var(--color-blue-gray)', marginBottom: '24px' }}>
              Canales Directos
            </h2>

            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>💬</span>
                <div>
                  <h4 className="font-forum" style={{ fontSize: '1.2rem', color: 'var(--color-blue-gray)' }}>WhatsApp</h4>
                  <p className="font-inter" style={{ fontSize: '0.85rem', opacity: 0.7 }}>Respuesta prioritaria en horario de atención</p>
                </div>
              </div>
              <Link href="https://wa.me/573102158656?text=Hola!%20Quiero%20hacer%20una%20consulta" target="_blank">
                <Button variant="primary" style={{ width: '100%' }}>
                  Enviar mensaje por WhatsApp
                </Button>
              </Link>
            </div>

            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>📧</span>
                <div>
                  <h4 className="font-forum" style={{ fontSize: '1.2rem', color: 'var(--color-blue-gray)' }}>Correo electrónico</h4>
                  <p className="font-inter" style={{ fontSize: '0.9rem', color: 'var(--color-turquoise)', fontWeight: 600 }}>denisse@themomcoaching.com</p>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>📱</span>
                <div>
                  <h4 className="font-forum" style={{ fontSize: '1.2rem', color: 'var(--color-blue-gray)' }}>Teléfono</h4>
                  <p className="font-inter" style={{ fontSize: '0.9rem', color: 'var(--color-turquoise)', fontWeight: 600 }}>+57 310 215 8656</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: 'var(--shadow-md)' }}>
            <h2 className="font-forum" style={{ fontSize: '1.8rem', color: 'var(--color-blue-gray)', marginBottom: '24px' }}>
              Envíanos un mensaje
            </h2>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="font-inter" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-blue-gray)', marginBottom: '6px' }}>
                  Nombre completo
                </label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.95rem', outline: 'none' }}
                  className="font-inter"
                />
              </div>

              <div>
                <label className="font-inter" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-blue-gray)', marginBottom: '6px' }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.95rem', outline: 'none' }}
                  className="font-inter"
                />
              </div>

              <div>
                <label className="font-inter" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-blue-gray)', marginBottom: '6px' }}>
                  Mensaje o consulta
                </label>
                <textarea
                  rows={4}
                  placeholder="Cuéntanos la edad de tu bebé y en qué necesitas ayuda..."
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.95rem', outline: 'none', resize: 'vertical' }}
                  className="font-inter"
                />
              </div>

              <Button type="submit" variant="primary" style={{ marginTop: '8px' }}>
                Enviar consulta
              </Button>
            </form>
          </div>

        </div>

        {/* FAQs */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '48px 40px', boxShadow: 'var(--shadow-md)' }}>
          <h2 className="font-forum" style={{ fontSize: '2.2rem', color: 'var(--color-blue-gray)', marginBottom: '32px', textAlign: 'center' }}>
            Preguntas Frecuentes (FAQs)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {faqs.map((item, idx) => (
              <div key={idx}>
                <h3 className="font-forum" style={{ fontSize: '1.25rem', color: 'var(--color-turquoise)', marginBottom: '8px' }}>
                  {item.q}
                </h3>
                <p className="font-inter" style={{ fontSize: '0.92rem', color: 'var(--foreground)', opacity: 0.85, lineHeight: 1.6 }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
