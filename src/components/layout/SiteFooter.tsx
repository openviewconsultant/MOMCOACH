import React from "react";

export default function SiteFooter() {
  return (
    <footer id="contact" style={{
      backgroundColor: '#2A1F1A',
      color: '#E8DDD5',
      padding: '72px 5% 32px',
      fontFamily: 'var(--font-inter)',
    }}>
      {/* Main grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '48px',
        marginBottom: '56px',
      }}>

        {/* Col 1 — Brand */}
        <div>
          <h3 className="font-forum" style={{ fontSize: '1.6rem', color: '#E8DDD5', marginBottom: '20px' }}>
            The Mom Coach
          </h3>
          <p className="font-inter" style={{ fontSize: '0.9rem', lineHeight: '1.8', color: '#B8A99E', marginBottom: '6px' }}>
            +57 3102158656
          </p>
          <p className="font-inter" style={{ fontSize: '0.9rem', color: '#B8A99E', marginBottom: '6px' }}>
            themomcoaching.com
          </p>
          <p className="font-inter" style={{ fontSize: '0.9rem', color: '#B8A99E' }}>
            denisselafaurie00@gmail.com
          </p>
        </div>

        {/* Col 2 — Contact */}
        <div>
          <h4 className="font-inter" style={{ fontSize: '1rem', fontWeight: '600', color: '#E8DDD5', marginBottom: '20px', letterSpacing: '0.05em' }}>
            Contacto
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Inicio', href: '/' },
              { label: 'Sueño', href: '/sueno' },
              { label: 'Alimentación', href: '/alimentacion' },
              { label: 'Privacidad', href: '/politica-de-privacidad' },
            ].map(link => (
              <li key={link.href}>
                <a href={link.href} className="footer-link">{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Links */}
        <div>
          <h4 className="font-inter" style={{ fontSize: '1rem', fontWeight: '600', color: '#E8DDD5', marginBottom: '20px', letterSpacing: '0.05em' }}>
            Links
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Sobre mí', href: '/#about' },
              { label: 'Alimentación', href: '/alimentacion' },
              { label: 'Blog', href: '/#blog' },
              { label: 'Contacto', href: '/#contact' },
            ].map(link => (
              <li key={link.label}>
                <a href={link.href} className="footer-link">{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4 — Social */}
        <div>
          <h4 className="font-inter" style={{ fontSize: '1rem', fontWeight: '600', color: '#E8DDD5', marginBottom: '20px', letterSpacing: '0.05em' }}>
            Síguenos
          </h4>
          <div style={{ display: 'flex', gap: '16px' }}>
            {/* Instagram */}
            <a href="https://instagram.com/themom.coach" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            {/* YouTube */}
            <a href="https://youtube.com/@DenisseTheMomCoach" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="YouTube">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#2A1F1A"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', textAlign: 'center' }}>
        <p className="font-inter" style={{ fontSize: '0.8rem', color: '#7A6A62' }}>
          © 2025 The Mom Coach · Todos los derechos reservados · Diseñado por THE INDIGO STUDIO
        </p>
      </div>
    </footer>
  );
}
