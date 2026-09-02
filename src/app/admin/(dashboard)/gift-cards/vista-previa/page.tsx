import Link from 'next/link';
import {
  giftCardEmailHtml,
  purchaseEmailHtml,
  bookingConfirmationEmailHtml,
} from '@/lib/email';
import { generateGiftCardCode, GIFT_CARD_PROGRAM_LABEL } from '@/lib/gift-cards';

// El logo va como adjunto (cid:) en el correo real; para la vista previa
// usamos el archivo público.
const withPublicLogo = (html: string) =>
  html.replace(/src="cid:momcoach-logo"/g, 'src="/logo-black.png"');

const PREVIEWS: { label: string; html: string }[] = [
  {
    label: 'Gift Card (regalo recibido)',
    html: withPublicLogo(
      giftCardEmailHtml({
        recipientName: 'Ana',
        purchaserEmail: 'quien-regala@ejemplo.com',
        code: generateGiftCardCode(),
        amount: 120,
        programLabel: GIFT_CARD_PROGRAM_LABEL.sueno,
        message: 'Para que tú y el bebé descansen mejor. ¡Con cariño!',
      })
    ),
  },
  {
    label: 'Compra de recursos digitales',
    html: withPublicLogo(
      purchaseEmailHtml({
        orderId: '8f3a1c92-1b7d-4e5a-9c2f-2a6b8e4d0f11',
        items: [
          { title: 'Guía de Sueño para Recién Nacidos', downloadUrl: '#' },
          { title: 'Recetario de Alimentación Complementaria', downloadUrl: '#' },
        ],
      })
    ),
  },
  {
    label: 'Confirmación de cita / asesoría',
    html: withPublicLogo(
      bookingConfirmationEmailHtml({
        name: 'Ana',
        start: new Date(Date.now() + 3 * 864e5).toISOString(),
        timeZone: 'America/Bogota',
        meetLink: 'https://meet.google.com/abc-defg-hij',
        title: 'Plan de Sueño Infantil (4 meses a 6 años)',
      })
    ),
  },
];

export default function EmailPreviewPage() {
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title font-fraunces">Vista previa de correos</h1>
          <p className="admin-subtitle">
            Así se ven los correos que envía la tienda.{' '}
            <Link href="/admin/gift-cards" style={{ color: 'var(--color-turquoise)' }}>
              ← Volver a Gift Cards
            </Link>
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28 }}>
        {PREVIEWS.map((p) => (
          <div key={p.label} style={{ flex: '1 1 320px', minWidth: 300 }}>
            <p className="font-inter" style={{ fontWeight: 600, margin: '0 0 8px', fontSize: '0.9rem' }}>
              {p.label}
            </p>
            <iframe
              title={p.label}
              srcDoc={p.html}
              style={{
                width: '100%',
                height: 820,
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: 16,
                background: '#EFE7CE',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
