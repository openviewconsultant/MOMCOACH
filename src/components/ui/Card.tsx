import React from 'react';
import Image from 'next/image';
import './ui.css';
import Button from './Button';

interface CardProps {
  title: string;
  description: string;
  imageUrl?: string;
  buttonText?: string;
  buttonHref?: string;
  className?: string;
  icon?: React.ReactNode;
}

export default function Card({
  title,
  description,
  imageUrl,
  buttonText,
  buttonHref,
  className = '',
  icon,
}: CardProps) {
  return (
    <div className={`card ${className}`} style={{ position: 'relative' }}>
      {icon && (
        <div style={{ position: 'absolute', top: -28, right: -28, zIndex: 1 }}>
          {icon}
        </div>
      )}
      {imageUrl && (
        <div style={{ position: 'relative', width: '100%', height: '240px' }}>
          <Image 
            src={imageUrl} 
            alt={title} 
            fill
            className="card-image"
          />
        </div>
      )}
      <div className="card-content">
        <h3 className="card-title font-fraunces" style={icon ? { paddingRight: '56px' } : undefined}>{title}</h3>
        <p className="card-description font-inter">{description}</p>
        
        {buttonText && (
          <div style={{ marginTop: 'auto' }}>
             <Button variant="primary" href={buttonHref || '#'}>
               {buttonText}
             </Button>
          </div>
        )}
      </div>
    </div>
  );
}
