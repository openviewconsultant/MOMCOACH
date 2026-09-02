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
  image: '/wp-content/uploads/2024/01/Bebe-comiendo-feliz-2-600x600.jpg',
});

const childOutcomes = [
  'Explore nuevos alimentos con confianza y sin presión.',
  'Reconozca sus señales de hambre y saciedad.',
  'Se siente a la mesa con calma y disfrute el momento de comer.',
  'Construya una relación positiva y duradera con la comida.',
];

const parentOutcomes = [
  'Ofrecer comidas balanceadas sin pelear ni negociar.',
  'Saber qué esperar según la edad y la etapa de tu hijo.',
  'Manejar la selectividad y el rechazo con estrategias claras.',
];

const fallbackServices = [
  {
    id: 'f-1',
    title: 'Programa Inicio de Alimentación Complementaria (0 a 12 meses)',
    price: 'USD $85',
    priceNumber: 85,
    tag: 'Acompañamiento 0 a 12 meses',
    desc: 'Todo lo que necesitas saber para comenzar la alimentación de tu bebé a partir de los 6 meses de forma segura, relajada y nutritiva.',
    features: [
      'Llamadas grupales de seguimiento',
      'Acompañamiento vía WhatsApp',
      'Recetarios prácticos',
      'Menús semanales equilibrados',
    ],
    whatsappText: 'Hola! Quiero información del Programa de Alimentación Complementaria',
    calLink: 'open-view-consultant-7ng550/alimentacion',
    popular: true,
    image: '/wp-content/uploads/2024/01/Bebe-comiendo-feliz-2-600x600.jpg',
    paymentProvider: 'mercadopago' as const,
    hotmartUrl: null as string | null,
    calendarId: null as string | null,
  },
  {
    id: 'f-2',
    title: 'Llamada de Consulta',
    price: 'USD $75',
    priceNumber: 75,
    tag: 'Orientación inicial',
    desc: 'Una breve llamada de orientación inicial, ideal si necesitas resolver dudas puntuales sobre inicio de la alimentación, BLW o selectividad alimentaria.',
    features: [
      'Videollamada de 45 minutos 1 a 1',
      'Análisis de la rutina alimentaria actual',
      'Recomendaciones escritas al finalizar',
    ],
    whatsappText: 'Hola! Quiero agendar una Llamada de consulta de alimentación',
    calLink: 'open-view-consultant-7ng550/alimentacion',
    popular: false,
    image: '/wp-content/uploads/2024/01/infant-baby-eating-finger-food-2023-11-27-04-54-34-utc-scaled-e1705513415708-600x600.jpg',
    paymentProvider: 'mercadopago' as const,
    hotmartUrl: null as string | null,
    calendarId: null as string | null,
  },
  {
    id: 'f-3',
    title: 'Programa Selectividad Alimentaria (1 a 7 años)',
    price: 'USD $120',
    priceNumber: 120,
    tag: '',
    desc: 'Especial para niños que rechazan alimentos, sienten neofobia alimentaria o tienen comidas muy estresantes en la mesa.',
    features: [
      'Evaluación detallada de la conducta alimentaria',
      'Estrategias sensoriales y de exposición progresiva',
      'Ebook / workbook de acompañamiento',
      '3 semanas de seguimiento',
    ],
    whatsappText: 'Hola! Quiero reservar el Programa de Selectividad Alimentaria',
    calLink: 'open-view-consultant-7ng550/alimentacion',
    popular: false,
    image: '/wp-content/uploads/2024/01/nathan-dumlao-ns1xhGumyH8-unsplash_edited.webp',
    paymentProvider: 'mercadopago' as const,
    hotmartUrl: null as string | null,
    calendarId: null as string | null,
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
    priceNumber: p.price,
    calendarId: p.booking_calendar_id,
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
    <div style={{ paddingTop: '120px', paddingBottom: '80px', backgroundColor: 'transparent', minHeight: '100vh' }}>
      <div style={{ padding: '0 5%' }}>

        <Link href="/" className="font-inter" style={{ color: 'var(--color-blue-gray)', fontSize: '0.9rem', display: 'inline-block', marginBottom: '24px' }}>
          ← Volver al inicio
        </Link>

        {/* Header */}
        <Reveal as="div" style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 64px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-turquoise)' }} className="font-inter">
            Nutrición y hábitos de alimentación
          </span>
          <h1 className="font-fraunces" style={{ fontSize: 'clamp(1.9rem, 7vw, 3rem)', color: 'var(--color-blue-gray)', marginTop: '8px', marginBottom: '16px' }}>
            Alimentación Sin Estrés
          </h1>
          <p className="font-inter" style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--foreground)', opacity: 0.85 }}>
            Aprende a construir hábitos saludables y una relación positiva con la comida desde el primer bocado. Convirtamos juntos los momentos en la mesa en un espacio grato para toda la familia.
          </p>
        </Reveal>

        {/* Services Cards (de pago) */}
        <Reveal as="div" style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px' }}>
          <h2 className="font-fraunces" style={{ fontSize: 'clamp(1.55rem, 5vw, 2.2rem)', color: 'var(--color-blue-gray)', marginTop: '8px' }}>
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
                  Más popular
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
                  <h3 className="font-fraunces" style={{ fontSize: '1.75rem', color: 'var(--color-blue-gray)', marginTop: '6px', marginBottom: '12px' }}>
                    {service.id.startsWith('f-') ? (
                      service.title
                    ) : (
                      <Link href={`/tienda/${service.id}`} style={{ color: 'inherit' }}>
                        {service.title}
                      </Link>
                    )}
                  </h3>
                  <p className="font-fraunces" style={{ fontSize: 'clamp(1.55rem, 5vw, 2.2rem)', color: 'var(--color-turquoise)', marginBottom: '16px' }}>
                    {service.price}
                  </p>
                  {service.id.startsWith('f-') ? (
                    <p className="font-inter" style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--foreground)', opacity: 0.85, marginBottom: '24px' }}>
                      {service.desc}
                    </p>
                  ) : (
                    <Link href={`/tienda/${service.id}`} className="font-inter" style={{ display: 'inline-block', marginBottom: '24px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-turquoise)' }}>
                      Ver todos los detalles →
                    </Link>
                  )}
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
                {service.id.startsWith('f-') ? (
                  <ServiceBookingButton
                    productId={service.id}
                    title={service.title}
                    price={service.priceNumber}
                    calendarId={service.calendarId}
                    popular={service.popular}
                    buttonText="Solicitar Programa"
                  />
                ) : (
                  <Link
                    href={`/tienda/${service.id}`}
                    className={`btn btn-${service.popular ? 'primary' : 'secondary'} btn-md`}
                    style={{ width: '100%', textAlign: 'center' }}
                  >
                    {service.paymentProvider === 'hotmart' && service.hotmartUrl ? 'Comprar' : 'Solicitar Programa'}
                  </Link>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        {/* Intro banner (debajo de los programas) */}
        <Reveal as="div" className="aliment-intro">
          <h2 className="font-fraunces aliment-intro-title">
            Te acompaño en la alimentación de tu hijo, desde su primer bocado.
          </h2>
          <p className="font-inter aliment-intro-text" style={{ fontWeight: 600 }}>
            Una relación sana con la comida comienza en casa.
          </p>
          <p className="font-inter aliment-intro-text">
            La relación con la comida inicia desde que nacemos. Generamos vínculos y asociaciones, tanto
            positivas como negativas, a partir de nuestras experiencias y de cómo se manejen en casa los
            distintos factores alrededor de la hora de comer y de los alimentos.
          </p>
          <p className="font-inter aliment-intro-text">
            Te acompaño a fomentar hábitos saludables y a construir una relación positiva con la comida
            desde el inicio, con asesorías de alimentación para niños de 0 a 5 años, adaptadas a las
            necesidades de cada etapa.
          </p>
          <p className="font-inter aliment-intro-text">
            Aprender a comer bien no se trata solo de qué comen, sino también de cómo viven y disfrutan la
            experiencia de alimentarse. Fomentar hábitos saludables en torno a la comida promueve el
            bienestar físico y emocional a lo largo de toda la vida.
          </p>
        </Reveal>

        {/* Benefits */}
        <div className="aliment-benefits">
          <Reveal as="div" className="aliment-benefit-card child">
            <h3 className="font-fraunces">Con el acompañamiento, tu hijo logrará:</h3>
            <ul>
              {childOutcomes.map((item) => (
                <li key={item} className="font-inter">{item}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal as="div" delay={120} className="aliment-benefit-card parent">
            <h3 className="font-fraunces">Con el acompañamiento, tú lograrás:</h3>
            <ul>
              {parentOutcomes.map((item) => (
                <li key={item} className="font-inter">{item}</li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Recipe books, guides (de pago) + Free downloads (gratis) */}
        <CategoryDigitalShop
          guides={dbGuides}
          freebies={freebies}
          guidesTitle="EBooks y Recetarios"
          guidesSubtitle="Ideas nutritivas, preparaciones fáciles y orientación práctica para el día a día."
        />

      </div>
    </div>
  );
}
