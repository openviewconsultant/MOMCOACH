import Link from 'next/link';
import { giftCardEmailHtml } from '@/lib/email';
import { generateGiftCardCode, GIFT_CARD_PROGRAM_LABEL } from '@/lib/gift-cards';

// Vista previa del correo que recibe quien es regalado con una gift card.
export default function GiftCardEmailPreviewPage() {
  const html = giftCardEmailHtml({
    recipientName: 'Ejemplo',
    purchaserEmail: 'quien-regala@ejemplo.com',
    code: generateGiftCardCode(),
    amount: 50,
    programLabel: GIFT_CARD_PROGRAM_LABEL.sueno,
    message: 'Para que tú y el bebé descansen mejor. ¡Con cariño!',
  })
    // el logo va como adjunto (cid:) en el correo real; para la vista previa
    // usamos el archivo público.
    .replace(/src="cid:momcoach-logo"/g, 'src="/PHOTO-2026-07-14-08-47-02.jpg"');

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title font-fraunces">Vista previa del correo</h1>
          <p className="admin-subtitle">
            Así se ve el correo que recibe la persona regalada.{' '}
            <Link href="/admin/gift-cards" style={{ color: 'var(--color-turquoise)' }}>
              ← Volver a Gift Cards
            </Link>
          </p>
        </div>
      </div>

      <iframe
        title="Vista previa del correo de gift card"
        srcDoc={html}
        style={{
          width: '100%',
          maxWidth: 640,
          height: 900,
          border: '1px solid rgba(0,0,0,0.12)',
          borderRadius: 16,
          background: '#fff',
        }}
      />
    </div>
  );
}
