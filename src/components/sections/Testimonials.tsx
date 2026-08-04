'use client';

import React, { useEffect, useState } from 'react';
import './sections.css';

interface Testimonial {
  quote: string;
  author: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'Denisse entendió la ansiedad que me generaba el llanto de mi hijo y diseñó un plan muy gentil que me permitió llevarlo a cabo. Fue una transición suave en la que pude enseñarle a Mateo a dejar los malos hábitos y que tomara nuevos. Me siento feliz y descansada después de 18 meses.',
    author: 'Carolina, mamá de Mateo de 18 meses',
  },
  {
    quote:
      'Gracias por haberme ayudado, me sentía completamente desesperada cuando contacté contigo. Me dio tanta paz que alguien me dijera que podía acompañar a mi hijo y no solo dejarlo llorar y salir del cuarto. ¡Gracias por todo!',
    author: 'Mamá del Programa de Sueño',
  },
  {
    quote:
      'Lo mejor que tiene el programa es el grupo de WhatsApp. Amalia cumple 3 meses y ya nos está durmiendo la noche de corrido. También ha mejorado muchísimo las siestas. Ya le recomendé el curso a todas mis amigas.',
    author: 'Mamá de Amalia, 3 meses',
  },
  {
    quote:
      'Seguimos tus recomendaciones y hasta ahora 10/10. Retiramos el dreamfeed tal y como nos dijo la pediatra y ya llevamos tres noches siguiendo el plan y todo de maravilla. Última toma entre 7:30 y 8:00 pm y despertar a las 6:00 am.',
    author: 'Mamá del Programa de Sueño',
  },
  {
    quote: 'Hoy fue perfecto porque durmió en la cuna las dos horas y media, y se despertó súper linda y animada.',
    author: 'Mamá del Programa de Sueño',
  },
  {
    quote:
      'El programa cumplió todas nuestras expectativas. Yo estaba con muchos nervios de empezar con la alimentación complementaria y gracias a esta guía nos ha ido de maravilla.',
    author: 'Mamá del Programa de Alimentación Complementaria',
  },
  {
    quote:
      'Me encanta el enfoque que le has dado al curso para empezar a dar alimentación rica en nutrientes desde los primeros meses. Nosotros ya teníamos unas bases, pero mucha de la información es completamente nueva y nos ha encantado.',
    author: 'Mamá del Programa de Alimentación',
  },
  {
    quote: 'Mil gracias, de verdad me siento muy tranquila con tu espacio.',
    author: 'Mamá del Programa de Sueño',
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [paused]);

  const current = testimonials[active];

  return (
    <section className="section testimonials-section" style={{ backgroundColor: 'var(--color-cream)' }}>
      <h2 className="section-title font-forum">Lo que dicen los padres...</h2>

      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          minHeight: '220px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <span className="font-forum" style={{ position: 'absolute', top: '10px', left: '20px', fontSize: '6rem', color: 'var(--color-peach)', opacity: 0.5, lineHeight: 1 }}>"</span>
        <p className="font-inter" style={{ fontSize: '1.2rem', lineHeight: 1.8, position: 'relative', zIndex: 1, marginBottom: '24px', color: 'var(--color-foreground)' }}>
          {current.quote}
        </p>
        <div className="font-inter" style={{ fontWeight: 'bold', color: 'var(--color-blue-gray)' }}>
          — {current.author}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '28px' }}>
          {testimonials.map((t, idx) => (
            <button
              key={t.author + idx}
              type="button"
              aria-label={`Ver testimonio ${idx + 1}`}
              onClick={() => setActive(idx)}
              style={{
                width: idx === active ? '22px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                backgroundColor: idx === active ? 'var(--color-turquoise)' : 'rgba(0,0,0,0.15)',
                transition: 'width 0.25s ease, background-color 0.25s ease',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
