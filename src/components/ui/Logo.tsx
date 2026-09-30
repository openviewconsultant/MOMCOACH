import React from 'react';
import Link from 'next/link';
import { optimizedSrc } from '@/lib/image-opt';

interface LogoProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'monochrome' | 'coral';
}

export default function Logo({ className = '', variant = 'primary' }: LogoProps) {
  return (
    <Link href="/" className={`logo-container ${className}`} aria-label="The Mom Coach Home" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <img 
        src={optimizedSrc('/PHOTO-2026-07-14-08-47-02.jpg', 128)}
        srcSet={`${optimizedSrc('/PHOTO-2026-07-14-08-47-02.jpg', 128)} 1x, ${optimizedSrc('/PHOTO-2026-07-14-08-47-02.jpg', 256)} 2x`}
        width={69}
        height={60}
        alt="The Mom Coach Logo" 
        style={{ height: '60px', width: 'auto', objectFit: 'contain' }} 
      />
    </Link>
  );
}
