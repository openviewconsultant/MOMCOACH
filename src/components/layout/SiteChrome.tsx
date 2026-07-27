'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { CartProvider } from '@/lib/cart-context';
import CartDrawer from '../tienda/CartDrawer';
import Navbar from '../sections/Navbar';
import SiteFooter from './SiteFooter';
import DiscoveryCallPopup from '../ui/DiscoveryCallPopup';
import CalendlyPreloader from '../ui/CalendlyPreloader';
import WhatsAppButton from '../ui/WhatsAppButton';

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <Navbar />
      <main>{children}</main>
      <SiteFooter />
      <DiscoveryCallPopup />
      <CalendlyPreloader />
      <WhatsAppButton />
      <CartDrawer />
    </CartProvider>
  );
}
