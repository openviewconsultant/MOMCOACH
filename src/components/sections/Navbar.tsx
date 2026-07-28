'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import { useCart } from '@/lib/cart-context';
import './sections.css';

const navItems = [
  { href: '/', label: 'Inicio' },
  { href: '/sobre-mi', label: 'Sobre mi' },
  { href: '/sueno', label: 'Sueño' },
  { href: '/alimentacion', label: 'Alimentación' },
  { href: '/tienda', label: 'Shop' },
  { href: '/blog', label: 'Blog' },
  { href: '/contacto', label: 'Contacto' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems, openCart } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <div className="navbar-wrapper">
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <Logo variant="primary" />

        {/* Desktop links */}
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="nav-link font-inter">{item.label}</Link>
            </li>
          ))}
        </ul>

        <div className="nav-actions hidden-mobile">
          <button type="button" onClick={openCart} className="nav-cart-btn" aria-label="Ver carrito">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {totalItems > 0 && <span className="nav-cart-badge font-inter">{totalItems}</span>}
          </button>

          <Link href="/admin" className="nav-admin-btn" aria-label="Administración">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </Link>
        </div>

        {/* Hamburger button — only visible on mobile */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú"
          id="nav-hamburger-btn"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Mobile slide-in menu */}
      <div className={`nav-mobile-menu ${menuOpen ? 'open' : ''}`} role="dialog" aria-modal="true">
        {/* Top bar inside menu */}
        <div className="nav-mobile-header">
          <Logo variant="primary" />
          <button className="nav-mobile-close" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <ul className="nav-mobile-links">
          {navItems.map((item, i) => (
            <li key={item.href} style={{ animationDelay: `${i * 0.06}s` }} className="nav-mobile-item">
              <Link
                href={item.href}
                className="nav-mobile-link font-forum"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="nav-mobile-cta">
          <button
            type="button"
            onClick={() => { setMenuOpen(false); openCart(); }}
            className="nav-btn-modern nav-btn-full nav-mobile-cart-btn"
            aria-label="Ver carrito"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Carrito{totalItems > 0 ? ` (${totalItems})` : ''}
          </button>
          <Button variant="primary" className="nav-btn-modern nav-btn-full">Llamada de descubrimiento</Button>
          <p className="nav-mobile-tagline font-inter">Transformando la maternidad con amor y evidencia</p>
          <Link href="/admin" className="nav-mobile-admin-link font-inter" onClick={() => setMenuOpen(false)}>
            Administración
          </Link>
        </div>
      </div>
    </div>
  );
}
