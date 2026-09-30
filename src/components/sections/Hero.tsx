import React from 'react';
import { preload } from 'react-dom';
import { optimizedSrc, optimizedSrcSet } from '@/lib/image-opt';
import Button from '../ui/Button';
import DisintegrateImage from '../ui/DisintegrateImage';
import './sections.css';

const HERO_MAIN_SIZES = '(max-width: 768px) 85vw, 480px';
const HERO_SECONDARY_SIZES = '(max-width: 768px) 45vw, 300px';

export default function Hero() {
  // La foto principal es el LCP: se pide en cuanto llega el HTML, ya optimizada.
  preload(optimizedSrc('/hero-main.jpg', 828), {
    as: 'image',
    imageSrcSet: optimizedSrcSet('/hero-main.jpg'),
    imageSizes: HERO_MAIN_SIZES,
    fetchPriority: 'high',
  });

  return (
    <section className="section hero-section">
      <div className="hero-grid">
        <div className="hero-content animate-fade-in">
          <h1 className="hero-headline">
            <span className="hero-line-1 font-inter">Te ayudo a</span>
            <span className="hero-line-2-wrap">
              <span className="hero-line-2 font-fraunces">mejorar los</span>
              <svg className="hero-underline-svg" viewBox="0 0 320 16" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <path d="M4 10 C60 4, 160 14, 316 6" stroke="var(--color-turquoise)" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="hero-line-3 font-fraunces">hábitos de tu bebé</span>
          </h1>
          <p className="hero-tagline font-inter">
            Con mis programas te acompañaré a resolver los retos de sueño y alimentación de tus hijos, desde los 0 hasta los 7 años. Te enseñaré a construir hábitos saludables de una manera gentil y respetuosa, sin dejarlo llorar. Juntos trabajaremos para lograr noches más tranquilas, momentos agradables en la mesa y crear las bases sólidas de aquellos hábitos que acompañarán a tus hijos a lo largo de su vida.
          </p>
          <div className="hero-buttons">
            <Button variant="primary" size="lg" href="/sueno">Conoce mis programas</Button>
            <Button variant="secondary" size="lg" href="/sobre-mi">Sobre mí</Button>
          </div>
        </div>

        {/* TODO: agregar insignia de Disciplina Positiva cuando el cliente
            entregue el archivo (pendiente — checklist items 9 y 23). */}

        <div className="hero-images">
          <div className="hero-img-main" style={{ background: 'var(--color-turquoise)' }}>
            <DisintegrateImage src="/hero-main.jpg" alt="Madre e hijo" radius={20} sizes={HERO_MAIN_SIZES} priority />
          </div>
          <div className="hero-img-secondary" style={{ background: 'var(--color-peach)' }}>
            <DisintegrateImage src="/hero-secondary.jpg" alt="Mamá con sus dos hijos" radius={20} sizes={HERO_SECONDARY_SIZES} />
          </div>
        </div>
      </div>
    </section>
  );
}
