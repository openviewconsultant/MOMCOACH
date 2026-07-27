import { Resend } from 'resend';

interface PurchasedItem {
  title: string;
  downloadUrl: string;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      default: return '&#39;';
    }
  });
}

export async function sendPurchaseEmail(params: {
  to: string;
  items: PurchasedItem[];
  orderId: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error('Faltan las variables de entorno RESEND_API_KEY y/o RESEND_FROM_EMAIL');
  }

  const resend = new Resend(apiKey);

  const linksHtml = params.items
    .map(
      (item) =>
        `<li style="margin-bottom:12px;"><strong>${escapeHtml(item.title)}</strong><br/><a href="${item.downloadUrl}" style="color:#2C7A7B;">Descargar</a></li>`
    )
    .join('');

  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: 'Tu compra en The Mom Coach — enlaces de descarga',
    html: `
      <div style="font-family: Arial, sans-serif; color:#333; max-width:520px; margin:0 auto;">
        <h2 style="color:#2C7A7B;">¡Gracias por tu compra!</h2>
        <p>Ya puedes descargar tu(s) producto(s) desde los siguientes enlaces. <strong>Cada enlace es válido por 48 horas.</strong></p>
        <ul style="padding-left:20px;">${linksHtml}</ul>
        <p style="font-size:0.85rem; color:#666;">Número de orden: ${escapeHtml(params.orderId)}</p>
        <p style="font-size:0.85rem; color:#666;">Si el enlace expiró o tienes algún problema, responde a este correo y te ayudaremos.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend no pudo enviar el correo: ${error.message}`);
  }
}
