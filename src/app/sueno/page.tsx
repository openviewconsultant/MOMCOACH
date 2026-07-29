import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';

import ServiceBookingButton from '@/components/ui/ServiceBookingButton';
import Reveal from '@/components/ui/Reveal';
import SuenoShop from './SuenoShop';
import '@/app/tienda/tienda.css';
import './sueno.css';

export const metadata = {
  title: 'Asesorías de Sueño Infantil | The Mom Coach',
  description: 'Programas y planes de sueño infantil personalizados para bebés de 0 meses a 6 años.',
};

const fallbackServices = [
  {
    id: 'fs-1',
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
    calLink: 'open-view-consultant-7ng550/30min',
    popular: false,
  },
  {
    id: 'fs-2',
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
    calLink: 'open-view-consultant-7ng550/30min',
    popular: true,
  },
  {
    id: 'fs-3',
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
    calLink: 'open-view-consultant-7ng550/30min',
    popular: false,
  },
];

const childOutcomes = [
  'Pueda dormir toda la noche (de 10 a 12 horas).',
  'Aprenda a conciliar el sueño de forma independiente.',
  'Aprenda a despertarse a la hora que debería hacerlo en la mañana.',
  'Genere asociaciones positivas con su habitación, cuna y con la hora de dormir.',
];

const parentOutcomes = [
  'Dormir mejor, con buen descanso en calidad y cantidad.',
  'Predecir los horarios, siestas y noches de tu bebé.',
  'Poner a tu bebé en la cuna despierto y sin llanto.',
];

export default async function SuenoPage() {
  const supabase = await createClient();
  const { data: rawProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .eq('category', 'Sueño infantil')
    .order('created_at', { ascending: false });

  const { data: rawFreebies } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .eq('category', 'Gratuitos')
    .order('created_at', { ascending: false });

  const productsList = (rawProducts ?? []) as Product[];
  const freebies = (rawFreebies ?? []) as Product[];

  const dbServices = productsList.filter((p) => p.product_type === 'service');
  const dbGuides = productsList.filter((p) => p.product_type !== 'service' && p.price > 0);

  const sleepServices = dbServices.length > 0 ? dbServices.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price === 0 ? 'Gratis' : `USD $${p.price}`,
    tag: p.subtitle || 'Sueño Infantil',
    desc: p.description,
    features: Array.isArray(p.features) ? p.features : [],
    whatsappText: p.whatsapp_text || `Hola! Quiero información sobre ${p.title}`,
    calLink: p.cal_link || 'open-view-consultant-7ng550/30min',
    popular: Boolean(p.is_popular),
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
            Servicios de Sueño Infantil
          </span>
          <h1 className="font-forum" style={{ fontSize: '3rem', color: 'var(--color-blue-gray)', marginTop: '8px', marginBottom: '16px' }}>
            Sueño y Descanso Familiar
          </h1>
          <p className="font-inter" style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--foreground)', opacity: 0.85 }}>
            Te acompaño de forma empática y respetuosa para lograr que tu bebé y toda tu familia vuelvan a dormir noches completas.
          </p>
        </Reveal>

        {/* Intro banner */}
        <Reveal as="div" className="sueno-intro">
          <span className="sueno-intro-eyebrow font-inter">Mi enfoque</span>
          <h2 className="font-forum sueno-intro-title">
            Familias Descansadas.<br />
            <em>Familias Felices.</em>
          </h2>
          <p className="font-inter sueno-intro-text">
            Como mamá, sé lo importante que es seguir nuestro instinto. Por eso mis programas de sueño
            tienen un enfoque completamente personalizado y acompañamiento diario. Conseguiremos que
            todos en casa obtengan el descanso que necesitan — sin métodos que impliquen dejarlo llorar.
          </p>
        </Reveal>

        {/* Services Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 560px))', justifyContent: 'center', gap: '32px', marginBottom: '80px' }}>
          {sleepServices.map((service, sIdx) => (
            <Reveal
              key={service.id}
              as="div"
              delay={sIdx * 100}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '40px 32px 36px 32px',
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
              <ServiceBookingButton
                title={service.title}
                price={service.price}
                whatsappText={service.whatsappText}
                popular={service.popular}
                buttonText="Reservar Asesoría"
                calLink={service.calLink || 'open-view-consultant-7ng550/30min'}
              />
            </Reveal>
          ))}
        </div>

        {/* Benefits */}
        <div className="sueno-benefits">
          <Reveal as="div" className="sueno-benefit-card child">
            <div className="sueno-benefit-icon">🌙</div>
            <h3 className="font-forum">Con un plan de entrenamiento, tu hijo logrará:</h3>
            <ul>
              {childOutcomes.map((item) => (
                <li key={item} className="font-inter">{item}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal as="div" delay={120} className="sueno-benefit-card parent">
            <div className="sueno-benefit-icon">💛</div>
            <h3 className="font-forum">Con un plan de entrenamiento, tú lograrás:</h3>
            <ul>
              {parentOutcomes.map((item) => (
                <li key={item} className="font-inter">{item}</li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Guides + Free downloads (interactive) */}
        <SuenoShop guides={dbGuides} freebies={freebies} />

      </div>
    </div>
  );
}
