import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Sobre mí | The Mom Coach',
  description: 'Conoce la historia, certificaciones y filosofía detrás de The Mom Coach.',
  path: '/sobre-mi',
  image: '/wp-content/uploads/2023/12/DENIS-05.webp',
});

export default function SobreMiPage() {
  return (
    <div style={{ paddingTop: '120px', paddingBottom: '80px', backgroundColor: 'transparent', minHeight: '100vh' }}>
      <div style={{ padding: '0 5%' }}>
        
        {/* Breadcrumb / Back */}
        <Link href="/" className="font-inter" style={{ color: 'var(--color-blue-gray)', fontSize: '0.9rem', display: 'inline-block', marginBottom: '24px' }}>
          ← Volver al inicio
        </Link>

        {/* Hero Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center', marginBottom: '80px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-turquoise)' }} className="font-inter">
              Conoce a tu coach de confianza
            </span>
            <h1 className="font-fraunces" style={{ fontSize: '3rem', color: 'var(--color-blue-gray)', marginTop: '8px', marginBottom: '24px', lineHeight: 1.15 }}>
              Hola, soy Denisse
            </h1>
            <p className="font-inter" style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--foreground)', opacity: 0.9, marginBottom: '24px' }}>
              Soy mamá, consultora de sueño pediátrico certificada, coach en hábitos de alimentación certificada por el Institute for Integrative Nutrition y educadora de padres certificada en Disciplina Positiva y miembro de The Positive Discipline Association. Fundadora de The Mom Coach: un espacio para acompañar a las familias a construir hábitos saludables de sueño y alimentación de una manera respetuosa, práctica y basada en las necesidades de cada niño.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="https://wa.me/573102158656?text=Hola%20quiero%20conocer%20mas%20sobre%20tus%20asesorias" target="_blank">
                <Button variant="primary">Hablar por WhatsApp</Button>
              </Link>
              <Link href="/sueno">
                <Button variant="secondary">Ver planes de sueño</Button>
              </Link>
            </div>
          </div>
          <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
            <img
              src="/sobre-mi-foto.jpg"
              alt="Denisse, fundadora de The Mom Coach"
              style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>

        {/* Story Section */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '48px', boxShadow: 'var(--shadow-md)', marginBottom: '64px' }}>
          <h2 className="font-fraunces" style={{ fontSize: '2.2rem', color: 'var(--color-blue-gray)', marginBottom: '24px' }}>
            Mi Historia
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p className="font-inter" style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--foreground)', opacity: 0.9 }}>
              Cuando quedé embarazada empecé a investigar sobre puericultura y a leer sobre diferentes temas todos relacionados con la maternidad y la crianza. Ahí encontré apasionante el tema del sueño y el descanso, sobre todo por su relación directa con la salud mental y con la calidad de vida que viene junto con descansar correctamente.
            </p>
            <p className="font-inter" style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--foreground)', opacity: 0.9 }}>
              Al tener a mi hija, noté como se normaliza el estar privado de sueño y como muchas mamás y familias sufren por falta de descanso. También noté que era común el no hablar del tema ni buscar ayuda por miedo a ser criticadas, por sentir culpa de sentirse mal y por vergüenza de querer aceptar que no todo en la maternidad es color de rosa. Así mismo, noté mucho silencio ante temas como la depresión y la ansiedad post parto. Ahí nació también mi pasión por el maravilloso —y a veces desafiante— mundo de la crianza.
            </p>
            <p className="font-inter" style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--foreground)', opacity: 0.9 }}>
              The Mom Coach nace para que encontremos soluciones y acompañamiento. Donde no criticamos estilos de crianza, sino que buscamos el método que mejor se ajuste a tu familia. Es el espacio donde las mamás pueden contar con apoyo sin ser juzgadas y donde encontrarán una mano amiga dispuesta a ayudar. Con el tiempo, seguí formándome y hoy soy consultora de sueño pediátrico certificada, coach en hábitos de alimentación certificada por el Institute for Integrative Nutrition y educadora de padres certificada en Disciplina Positiva, miembro de The Positive Discipline Association.
            </p>
            <p className="font-inter" style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--foreground)', opacity: 0.9 }}>
              Cuando nuestros hijos descansan, se alimentan bien y tienen hábitos saludables, toda la familia puede disfrutar más de la crianza. Estoy aquí para acompañarte en ese camino.
            </p>
          </div>
        </div>

        {/* Certifications Grid */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-turquoise)' }} className="font-inter">
            Acreditaciones
          </span>
          <h2 className="font-fraunces" style={{ fontSize: '2.4rem', color: 'var(--color-blue-gray)', marginTop: '8px', marginBottom: '32px' }}>
            Certificaciones
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', maxWidth: '920px', margin: '0 auto' }}>
            {[
              { title: 'Consultora de Sueño Infantil Certificada', org: 'Academia Consultoría de Sueño (ACS)', badge: '/badge-acs.png' },
              { title: 'Coach en Hábitos de Alimentación', org: 'Institute for Integrative Nutrition (IIN)', badge: '/badge-iin.png' },
              { title: 'Educadora de Padres en Disciplina Positiva', org: 'Positive Discipline Association (PDA)', badge: '/badge-pda.png' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(113, 176, 180, 0.3)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ position: 'relative', width: '64px', height: '64px', margin: '0 auto 12px' }}>
                  <Image src={c.badge} alt={c.org} fill style={{ objectFit: 'contain' }} />
                </div>
                <h4 className="font-fraunces" style={{ fontSize: '1.2rem', color: 'var(--color-blue-gray)', marginBottom: '8px' }}>{c.title}</h4>
                <p className="font-inter" style={{ fontSize: '0.85rem', color: 'var(--foreground)', opacity: 0.7 }}>{c.org}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ background: 'linear-gradient(135deg, var(--color-blue-gray), #384260)', color: 'white', borderRadius: '24px', padding: '48px 32px', textAlign: 'center' }}>
          <h2 className="font-fraunces" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>¿Lista para transformar tus noches y días?</h2>
          <p className="font-inter" style={{ fontSize: '1.05rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 32px' }}>
            Agenda tu llamada de valoración gratuita o explora nuestros programas personalizados.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="https://wa.me/573102158656?text=Hola%20quiero%20agendar%20una%20llamada" target="_blank">
              <Button variant="secondary">Agendar por WhatsApp</Button>
            </Link>
            <Link href="/tienda">
              <Button variant="secondary" style={{ color: 'white', borderColor: 'white' }}>Ver la Tienda</Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
