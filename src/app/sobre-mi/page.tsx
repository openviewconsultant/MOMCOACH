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
            <p className="font-inter" style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--foreground)', opacity: 0.9, marginBottom: '16px' }}>
              Soy mamá, consultora de sueño pediátrico certificada y coach en hábitos de alimentación certificada por el Institute for Integrative Nutrition (IIN). También soy educadora de padres certificada en Disciplina Positiva y miembro de la Positive Discipline Association.
            </p>
            <p className="font-inter" style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--foreground)', opacity: 0.9, marginBottom: '24px' }}>
              Creé The Mom Coach para acompañar a las familias a construir hábitos saludables alrededor del sueño y la alimentación, y disfrutar con mayor tranquilidad esta etapa tan importante de la crianza.
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
            Mi historia
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p className="font-inter" style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--foreground)', opacity: 0.9 }}>
              Cuando quedé embarazada de mi primera hija me apasioné por el mundo de la puericultura, la maternidad y la crianza. Ahí descubrí mi pasión por el sueño y el descanso, especialmente por su relación con nuestra salud mental y con la calidad de vida que viene cuando logramos descansar bien.
            </p>
            <p className="font-inter" style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--foreground)', opacity: 0.9 }}>
              Cuando nació mi hija, noté cómo se normaliza vivir privados de sueño y cómo muchas mamás y familias sufren por falta de descanso. También descubrí que muchas veces no hablamos de estos temas ni buscamos ayuda por miedo a ser juzgadas, por sentir culpa o por vergüenza de reconocer que no todo en la maternidad es color de rosa. También encontré mucho silencio alrededor de temas como la ansiedad y la depresión posparto.
            </p>
            <p className="font-inter" style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--foreground)', opacity: 0.9 }}>
              The Mom Coach nace para ofrecer soluciones y acompañamiento. Un espacio donde no juzgamos estilos de crianza, sino que buscamos herramientas que se adapten a cada familia y a sus necesidades.
            </p>
            <p className="font-inter" style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--foreground)', opacity: 0.9 }}>
              Con el tiempo, entendí que acompañar a una familia va mucho más allá del sueño. Por eso también incorporé herramientas de Disciplina Positiva, que nos ayudan a poner límites con respeto, conectar con nuestros hijos y acompañar sus emociones sin dejar de ser firmes.
            </p>
            <p className="font-inter" style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--foreground)', opacity: 0.9 }}>
              The Mom Coach es ese espacio donde puedes encontrar información, herramientas y una mano amiga para transitar la crianza con más confianza, menos culpa y sintiéndote acompañada.
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
