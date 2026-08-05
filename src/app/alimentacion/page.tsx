import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';

import ServiceBookingButton from '@/components/ui/ServiceBookingButton';
import Reveal from '@/components/ui/Reveal';
import CategoryDigitalShop from '@/components/tienda/CategoryDigitalShop';
import { buildMetadata } from '@/lib/seo';
import '@/app/tienda/tienda.css';
import './alimentacion.css';

export const metadata = buildMetadata({
  title: 'Alimentación Infantil & BLW | The Mom Coach',
  description: 'Asesorías de alimentación complementaria, manejo de picky eaters y recetarios saludables.',
  path: '/alimentacion',
  image: 'https://www.themomcoaching.com/wp-content/uploads/2024/01/Bebe-comiendo-feliz-2-600x600.jpg',
});

const fallbackServices = [
  {
    id: 'f-1',
    title: 'Curso Inicio de Alimentación Complementaria',
    price: 'USD $85',
    tag: 'BLW & BLISS & Mixto',
    desc: 'Todo lo que necesitas saber para comenzar la alimentación de tu bebé a partir de los 6 meses de forma segura, relajada y nutritiva.',
    features: [
      'Cortes seguros y presentación de alimentos',
      'Prevención de atragantamiento vs arcadas',
      'Planificación de menú semanal equilibrado',
      'Acceso a material descargable y recetario',
    ],
    whatsappText: 'Hola! Quiero información del Curso de Alimentación Complementaria',
    calLink: 'open-view-consultant-7ng550/alimentacion',
    popular: true,
    image: 'https://www.themomcoaching.com/wp-content/uploads/2024/01/Bebe-comiendo-feliz-2-600x600.jpg',
    paymentProvider: 'mercadopago' as const,
    hotmartUrl: null as string | null,
  },
  {
    id: 'f-2',
    title: 'Llamada de Consulta de Alimentación',
    price: 'USD $65',
    tag: 'Sesión express de orientación',
    desc: 'Ideal si necesitas resolver dudas puntuales sobre inicio de la alimentación, selectividad alimentaria o ajustar un plan que ya tenías.',
    features: [
      'Videollamada de 45 minutos 1 a 1',
      'Análisis de la rutina alimentaria actual',
      'Recomendaciones escritas al finalizar',
    ],
    whatsappText: 'Hola! Quiero agendar una Llamada de consulta de alimentación',
    calLink: 'open-view-consultant-7ng550/alimentacion',
    popular: false,
    image: 'https://www.themomcoaching.com/wp-content/uploads/2024/01/infant-baby-eating-finger-food-2023-11-27-04-54-34-utc-scaled-e1705513415708-600x600.jpg',
    paymentProvider: 'mercadopago' as const,
    hotmartUrl: null as string | null,
  },
  {
    id: 'f-3',
    title: 'Asesoría para Picky Eaters (Comedores Selectivos)',
    price: 'USD $120',
    tag: 'Acompañamiento Personalizado',
    desc: 'Especial para niños que rechazan alimentos, sienten neofobia alimentaria o tienen comidas muy estresantes en la mesa.',
    features: [
      'Evaluación detallada de la conducta alimentaria',
      'Estrategias sensoriales y de exposición progresiva',
      'Sesión 1 a 1 de 60 minutos con la familia',
      'Plan de acción escrito + seguimiento',
    ],
    whatsappText: 'Hola! Quiero reservar la Asesoría para Picky Eaters',
    calLink: 'open-view-consultant-7ng550/alimentacion',
    popular: false,
    image: 'https://www.themomcoaching.com/wp-content/uploads/2024/01/nathan-dumlao-ns1xhGumyH8-unsplash_edited.webp',
    paymentProvider: 'mercadopago' as const,
    hotmartUrl: null as string | null,
  },
];

export default async function AlimentacionPage() {
  const supabase = await createClient();
  const { data: rawProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .or('category.eq.Alimentación,price.eq.0')
    .order('created_at', { ascending: false });

  const productsList = (rawProducts ?? []) as Product[];
  // Free downloads are shown regardless of topic (matches the legacy
  // site's behavior of promoting every lead magnet on every content page).
  const freebies = productsList.filter((p) => p.price === 0);

  const foodProductsList = productsList.filter((p) => p.category === 'Alimentación');
  const dbServices = foodProductsList.filter((p) => p.product_type === 'service');
  const dbGuides = foodProductsList.filter((p) => p.product_type !== 'service' && p.price > 0);

  const foodServices = dbServices.length > 0 ? dbServices.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price === 0 ? 'Gratis' : `USD $${p.price}`,
    tag: p.subtitle || 'Alimentación',
    desc: p.description,
    features: Array.isArray(p.features) ? p.features : [],
    whatsappText: p.whatsapp_text || `Hola! Quiero información sobre ${p.title}`,
    calLink: p.cal_link || 'open-view-consultant-7ng550/alimentacion',
    popular: Boolean(p.is_popular),
    image: p.cover_image_url,
    paymentProvider: p.payment_provider,
    hotmartUrl: p.hotmart_url,
  })) : fallbackServices;

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '80px', backgroundColor: 'var(--color-cream)', minHeight: '100vh' }}>
      <div style={{ padding: '0 5%' }}>

        <Link href="/" className="font-inter" style={{ color: 'var(--color-blue-gray)', fontSize: '0.9rem', display: 'inline-block', marginBottom: '24px' }}>
          ← Volver al inicio
        </Link>

        {/* Header */}
        <Reveal as="div" style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 64px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-turquoise)' }} className="font-inter">
            Nutrición y Alimentación Infantil
          </span>
          <h1 className="font-forum" style={{ fontSize: '3rem', color: 'var(--color-blue-gray)', marginTop: '8px', marginBottom: '16px' }}>
            Alimentación Sin Estrés
          </h1>
          <p className="font-inter" style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--foreground)', opacity: 0.85 }}>
            Desde el primer bocado a los 6 meses hasta convertir la mesa en un espacio de disfrute y nutrición para tus hijos.
          </p>
        </Reveal>

        {/* Intro banner */}
        <Reveal as="div" className="aliment-intro">
          <span className="aliment-intro-eyebrow font-inter">Te ayudo con la alimentación de tu bebé</span>
          <h2 className="font-forum aliment-intro-title">Una relación sana con la comida empieza desde casa</h2>
          <p className="font-inter aliment-intro-text">
            La relación con la comida inicia desde que nacemos. Generamos vínculos y asociaciones, tanto
            positivas como negativas, a partir de nuestras experiencias y de cómo se manejen en casa los
            distintos factores alrededor de la hora de comer y de los alimentos.
          </p>
          <p className="font-inter aliment-intro-text">
            Te enseño cómo fomentar en tus hijos una relación saludable con la comida. Conoce mis asesorías
            en alimentación de 0 a 5 años — la que elijas dependerá de la edad de tu hijo.
          </p>
          <p className="font-inter aliment-intro-text">
            Fomentar hábitos saludables en torno a la comida promueve el bienestar físico y emocional a lo
            largo de toda la vida.
          </p>
        </Reveal>

        {/* Services Cards (de pago) */}
        <Reveal as="div" style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-coral)' }} className="font-inter">
            Asesorías de pago
          </span>
          <h2 className="font-forum" style={{ fontSize: '2.2rem', color: 'var(--color-blue-gray)', marginTop: '8px' }}>
            Acompañamiento 1 a 1
          </h2>
        </Reveal>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px', marginBottom: '80px' }}>
          {foodServices.map((service, sIdx) => (
            <Reveal
              key={service.id}
              as="div"
              delay={sIdx * 100}
              style={{
                background: 'white',
                borderRadius: '24px',
                boxShadow: service.popular ? 'var(--shadow-lg)' : 'var(--shadow-md)',
                border: service.popular ? '2px solid var(--color-turquoise)' : '1px solid rgba(0,0,0,0.06)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flex: '1 1 320px',
                maxWidth: '560px',
              }}
            >
              {service.popular && (
                <span style={{ position: 'absolute', top: '-14px', right: '24px', background: 'var(--color-turquoise)', color: 'white', fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px', borderRadius: '12px', textTransform: 'uppercase', zIndex: 2 }} className="font-inter">
                  Recomendado
                </span>
              )}
              {service.image && (
                <div style={{ width: '100%', aspectRatio: '16 / 10', borderRadius: '24px 24px 0 0', overflow: 'hidden' }}>
                  <img
                    src={service.image}
                    alt={service.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              )}
              <div style={{ padding: '32px 32px 36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-coral)', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.3, marginBottom: '6px' }} className="font-inter">
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
                  {service.features.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0' }}>
                      {service.features.map((feat, fIdx) => (
                        <li key={fIdx} className="font-inter" style={{ fontSize: '0.88rem', color: 'var(--foreground)', opacity: 0.9, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: 'var(--color-turquoise)', fontWeight: 'bold' }}>✓</span> {feat}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {service.paymentProvider === 'hotmart' && service.hotmartUrl ? (
                  <a
                    href={service.hotmartUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn btn-${service.popular ? 'primary' : 'secondary'} btn-md`}
                    style={{ width: '100%', textAlign: 'center' }}
                  >
                    Comprar
                  </a>
                ) : (
                  <ServiceBookingButton
                    title={service.title}
                    price={service.price}
                    whatsappText={service.whatsappText}
                    popular={service.popular}
                    buttonText="Solicitar Asesoría"
                    calLink={service.calLink || 'open-view-consultant-7ng550/alimentacion'}
                  />
                )}
              </div>
            </Reveal>
          ))}
        </div>

        {/* Recipe books, guides (de pago) + Free downloads (gratis) */}
        <CategoryDigitalShop
          guides={dbGuides}
          freebies={freebies}
          guidesTitle="Recetarios y Guías de Alimentación"
          guidesSubtitle="Ideas nutritivas, preparaciones fáciles y orientación práctica para el día a día. Contenido descargable de pago."
        />

      </div>
    </div>
  );
}
