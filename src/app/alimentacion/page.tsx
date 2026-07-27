import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';

import ServiceBookingButton from '@/components/ui/ServiceBookingButton';

export const metadata = {
  title: 'Alimentación Infantil & BLW | The Mom Coach',
  description: 'Asesorías de alimentación complementaria, manejo de picky eaters y recetarios saludables.',
};

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
    popular: true,
  },
  {
    id: 'f-2',
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
    popular: false,
  },
];

const fallbackProducts = [
  { id: 'fp-1', title: 'Guía: Destete progresivo, guiado por la madre', price: 'USD $32', link: '/tienda' },
  { id: 'fp-2', title: 'Guía: Todo sobre los Picky Eaters', price: 'USD $32', link: '/tienda' },
  { id: 'fp-3', title: 'Recetario Booster Calórico', price: 'USD $16', link: '/tienda' },
  { id: 'fp-4', title: 'Recetario: Postres Saludables', price: 'USD $10', link: '/tienda' },
  { id: 'fp-5', title: 'Recetario Completo - The Mom Coach', price: 'USD $18', link: '/tienda' },
];

export default async function AlimentacionPage() {
  const supabase = await createClient();
  const { data: rawProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .eq('category', 'Alimentación')
    .order('created_at', { ascending: false });

  const productsList = (rawProducts ?? []) as Product[];

  const dbServices = productsList.filter(
    (p) => p.product_type === 'service' || (p.features && p.features.length > 0)
  );

  const dbProducts = productsList.filter(
    (p) => p.product_type !== 'service' && (!p.features || p.features.length === 0)
  );

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
  })) : fallbackServices;

  const foodProducts = dbProducts.length > 0 ? dbProducts.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price === 0 ? 'Gratis' : `USD $${p.price}`,
    link: '/tienda',
  })) : fallbackProducts;

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '80px', backgroundColor: 'var(--color-cream)', minHeight: '100vh' }}>
      <div style={{ padding: '0 5%' }}>
        
        <Link href="/" className="font-inter" style={{ color: 'var(--color-blue-gray)', fontSize: '0.9rem', display: 'inline-block', marginBottom: '24px' }}>
          ← Volver al inicio
        </Link>

        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 64px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-turquoise)' }} className="font-inter">
            Nutrición y Alimentación Infantil
          </span>
          <h1 className="font-forum" style={{ fontSize: '3rem', color: 'var(--color-blue-gray)', marginTop: '8px', marginBottom: '16px' }}>
            Alimentación Sin Estrés
          </h1>
          <p className="font-inter" style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--foreground)', opacity: 0.85 }}>
            Desde el primer bocado a los 6 meses hasta convertir la mesa en un espacio de disfrute y nutrición para tus hijos.
          </p>
        </div>

        {/* Services Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 560px))', justifyContent: 'center', gap: '32px', marginBottom: '80px' }}>
          {foodServices.map((service) => (
            <div
              key={service.id}
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
                    Recomendado
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
                buttonText="Solicitar Asesoría"
                calLink={service.calLink || 'open-view-consultant-7ng550/alimentacion'}
              />
            </div>
          ))}
        </div>

        {/* Recipe books & Guides */}
        {foodProducts.length > 0 && (
          <div style={{ background: 'white', borderRadius: '24px', padding: '48px 36px', boxShadow: 'var(--shadow-md)', marginBottom: '64px' }}>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <h2 className="font-forum" style={{ fontSize: '2.2rem', color: 'var(--color-blue-gray)', marginBottom: '8px' }}>
                Recetarios y Guías de Alimentación
              </h2>
              <p className="font-inter" style={{ fontSize: '0.95rem', color: 'var(--foreground)', opacity: 0.8 }}>
                Ideas nutritivas, preparaciones fáciles y orientación práctica para el día a día.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {foodProducts.map((p) => (
                <div key={p.id} style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', padding: '20px', textAlign: 'center', background: 'var(--color-cream)' }}>
                  <h4 className="font-forum" style={{ fontSize: '1.1rem', color: 'var(--color-blue-gray)', marginBottom: '8px' }}>{p.title}</h4>
                  <p className="font-inter" style={{ fontWeight: 600, color: 'var(--color-turquoise)', marginBottom: '16px' }}>{p.price}</p>
                  <Link href={p.link}>
                    <Button variant="secondary" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>Ver en la Tienda</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
