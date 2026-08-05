import React from 'react';
import Button from '../ui/Button';
import DisintegrateImage from '../ui/DisintegrateImage';
import './sections.css';

export default function Hero() {
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
            <span className="hero-line-3 font-forum">hábitos de tu <em>bebé</em></span>
          </h1>
          <p className="hero-tagline font-inter">
            Con mis cursos y asesorías te enseñaré cómo superar todo tipo de problemas relacionados con el sueño de tu bebé de forma gentil y sin métodos que impliquen dejarlo llorar. Juntos lograremos enseñarle a tu bebé a dormir la noche de corrido, enseñarle a dormir en su cuna o enseñarle a tu toddler a quedarse toda la noche en su habitación.
          </p>
          <div className="hero-buttons">
            <Button variant="primary" size="lg">Conoce mis programas</Button>
            <Button variant="secondary" size="lg">Sobre mí</Button>
          </div>
        </div>

        <div className="hero-images">
          <div className="hero-img-main" style={{ background: 'var(--color-turquoise)' }}>
            <DisintegrateImage src="https://www.themomcoaching.com/wp-content/uploads/2024/01/ima01.jpg" alt="Madre e hijo" radius={20} />
          </div>
          <div className="hero-img-secondary" style={{ background: 'var(--color-peach)' }}>
            <DisintegrateImage src="/hero-secondary.jpg" alt="Mamá con sus dos hijos" radius={20} />
          </div>
        </div>
      </div>
    </section>
  );
}
