import React from 'react';
import Card from '../ui/Card';
import { StarShape, HalfCirclesShape, FlowerShape } from '../ui/BrandShapes';
import './sections.css';

export default function Services() {
  const packages = [
    {
      title: "Programas de Sueño",
      description: "Programas de sueño infantil que benefician a toda la familia, logrando descanso de calidad para los bebés, niños y padres. Transiciones suaves y amorosas.",
      buttonText: "Saber más",
      buttonHref: "/sueno",
      icon: <StarShape size={110} />,
    },
    {
      title: "Programas en Alimentación",
      description: "Aprende todo lo que necesitas saber para iniciar la alimentación complementaria y prevenir y acompañar la selectividad alimentaria. Te acompaño a fomentar hábitos saludables y a construir desde el inicio una relación positiva con la comida.",
      buttonText: "Saber más",
      buttonHref: "/alimentacion",
      icon: <HalfCirclesShape size={110} />,
    },
    {
      title: "Herramientas para acompañarte en cada etapa de la crianza",
      description: "Encuentra ebooks, recetarios y recursos prácticos sobre sueño, alimentación y comportamiento infantil, creados desde mi experiencia y formación como consultora de sueño pediátrico, coach certificada por el Institute for Integrative Nutrition (IIN) y educadora de padres certificada en Disciplina Positiva.",
      buttonText: "Ver Tienda",
      buttonHref: "/tienda",
      icon: <FlowerShape size={110} />,
    }
  ];

  return (
    <section id="coaching" className="section services-section">
      <h2 className="section-title font-forum">Mis Programas</h2>
      <p className="section-subtitle font-inter">Juntos lograremos enseñarle a tu bebé a dormir y comer mejor, para que disfrutes al máximo de la maternidad.</p>

      <div className="services-grid">
        {packages.map((pkg, index) => (
          <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
            <Card
              title={pkg.title}
              description={pkg.description}
              buttonText={pkg.buttonText}
              buttonHref={pkg.buttonHref}
              icon={pkg.icon}
              className="h-full flex flex-col justify-between"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
