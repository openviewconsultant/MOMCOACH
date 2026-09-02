import React from 'react';
import './sections.css';

export default function Stats() {
  return (
    <section className="section stats-section" style={{ backgroundColor: 'var(--color-blue-gray)', color: 'white', textAlign: 'center' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 className="font-fraunces" style={{ fontSize: 'clamp(1.9rem, 7vw, 3rem)', marginBottom: '24px', color: 'var(--color-peach)' }}>
          Resultados Positivos
        </h2>
        <p className="font-inter" style={{ fontSize: '1.2rem', lineHeight: 1.8, marginBottom: '40px' }}>
          Más de 3.000 familias alrededor del mundo han confiado en The Mom Coach para acompañarlas en el proceso de sueño de sus hijos. Un buen descanso transforma las noches y también los días. Los programas de sueño traen beneficios tanto para los niños como para sus padres.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
          <div>
            <h3 className="font-fraunces" style={{ fontSize: '4rem', color: 'var(--color-coral)' }}>90%</h3>
            <p className="font-inter" style={{ fontSize: '1.1rem' }}>
              De las familias notaron mejoras en los patrones de sueño de sus bebés y lograron tramos de sueño más largos en la noche.
            </p>
          </div>
        </div>
        <p className="font-inter" style={{ fontSize: '1.2rem', fontStyle: 'italic', marginTop: '40px' }}>
          Familias en todo el mundo han confiado en mis programas.
        </p>
      </div>
    </section>
  );
}
