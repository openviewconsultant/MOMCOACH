'use client';

import React, { useState } from 'react';
import './sections.css';

export default function About() {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const handleBadgeClick = (badgeId: string) => {
    if (isMobile) {
      setHoveredBadge(hoveredBadge === badgeId ? null : badgeId);
    }
  };

  const handleMouseEnter = (badgeId: string) => {
    if (!isMobile) {
      setHoveredBadge(badgeId);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setHoveredBadge(null);
    }
  };

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section id="about" className="section about-section">
      <div className="about-grid">
        <div className="about-content animate-fade-in">
          <h2 className="about-title font-fraunces">¡Tu coach de sueño elegida!</h2>
          <p className="about-text font-inter">
            Soy mamá, consultora de sueño pediátrico certificada, coach en hábitos de alimentación certificada por el Institute for Integrative Nutrition y educadora de padres certificada en Disciplina Positiva y miembro de The Positive Discipline Association.
          </p>
          <p className="about-text font-inter">
            Cuando nació mi primera hija, también nació mi pasión por el maravilloso —y a veces desafiante— mundo de la crianza. Como mamá, sé que esta etapa está llena de preguntas, decisiones y momentos en los que necesitamos sentirnos bien aconsejados, y sobre todo, acompañados.
          </p>
          <p className="about-text font-inter">
            Fundé The Mom Coach para acompañar a las familias a construir hábitos saludables de sueño y alimentación de una manera respetuosa, práctica y basada en las necesidades de cada niño. Cuando nuestros hijos descansan, se alimentan bien y tienen hábitos saludables, toda la familia puede disfrutar más de la crianza.
          </p>
          <p className="about-text font-inter">
            Estoy aquí para acompañarte en ese camino.
          </p>
        </div>
        <div className="about-image-wrapper animate-fade-in" style={{ animationDelay: '0.2s', background: 'var(--color-cream)' }}>
           <img src="https://www.themomcoaching.com/wp-content/uploads/2023/12/historia_JPEG.webp" alt="Silueta de madre e hijo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

           <div className="about-badges">
             <div className="about-badges-stack">
               <div
                 className="about-badge-card about-badge-card--pda"
                 onClick={() => handleBadgeClick('pda')}
                 onMouseEnter={() => handleMouseEnter('pda')}
                 onMouseLeave={handleMouseLeave}
                 style={{
                   cursor: 'pointer',
                   transform: hoveredBadge === 'pda' ? 'scale(1.8)' : 'rotate(-4deg) translate(0px, 0px)',
                   zIndex: hoveredBadge === 'pda' ? 10 : 3,
                   transition: 'transform 0.3s ease, z-index 0.3s ease'
                 }}
               >
                 <img src="/badge-pda.png" alt="Miembro de The Positive Discipline Association 2026" className="about-badge" />
               </div>
               <div
                 className="about-badge-card about-badge-card--acs"
                 onClick={() => handleBadgeClick('acs')}
                 onMouseEnter={() => handleMouseEnter('acs')}
                 onMouseLeave={handleMouseLeave}
                 style={{
                   cursor: 'pointer',
                   transform: hoveredBadge === 'acs' ? 'scale(1.8) translate(-20px, 0px)' : (isMobile ? 'rotate(6deg) translate(0px, -8px)' : 'rotate(6deg) translate(10px, -8px)'),
                   zIndex: hoveredBadge === 'acs' ? 10 : 1,
                   transition: 'transform 0.3s ease, z-index 0.3s ease'
                 }}
               >
                 <img src="/badge-acs.png" alt="Consultora de Sueño Infantil Certificada — Academia Consultoría de Sueño" className="about-badge" />
               </div>
               <div
                 className="about-badge-card about-badge-card--iin"
                 onClick={() => handleBadgeClick('iin')}
                 onMouseEnter={() => handleMouseEnter('iin')}
                 onMouseLeave={handleMouseLeave}
                 style={{
                   cursor: 'pointer',
                   transform: hoveredBadge === 'iin' ? 'scale(1.8)' : 'rotate(-6deg) translate(-10px, 8px)',
                   zIndex: hoveredBadge === 'iin' ? 10 : 2,
                   transition: 'transform 0.3s ease, z-index 0.3s ease'
                 }}
               >
                 <img src="/badge-iin.png" alt="Graduada certificada por el Institute for Integrative Nutrition" className="about-badge" />
               </div>
             </div>
           </div>
        </div>
      </div>
    </section>
  );
}
