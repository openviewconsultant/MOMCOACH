'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { CartProvider } from '@/lib/cart-context';
import CartDrawer from '../tienda/CartDrawer';
import Navbar from '../sections/Navbar';
import SiteFooter from './SiteFooter';
import DiscoveryCallPopup from '../ui/DiscoveryCallPopup';
import WhatsAppButton from '../ui/WhatsAppButton';

interface PopupConfig {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  enabled: boolean;
  calendarId: string;
}

interface Props {
  children: React.ReactNode;
  popupConfig: PopupConfig;
}

export default function SiteChrome({ children, popupConfig }: Props) {
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
      <DiscoveryCallPopup config={popupConfig} />
      <WhatsAppButton />
      <CartDrawer />
    </CartProvider>
  );
}
