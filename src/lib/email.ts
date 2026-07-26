import nodemailer from 'nodemailer';

interface PurchasedBook {
  title: string;
  driveLink: string;
}

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error('Faltan las variables de entorno GMAIL_USER y/o GMAIL_APP_PASSWORD');
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
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

export async function sendBookLinksEmail(params: {
  to: string;
  books: PurchasedBook[];
  orderId: string;
}): Promise<void> {
  const transporter = getTransporter();
  const fromName = process.env.ORDER_EMAIL_FROM_NAME || 'The Mom Coach';

  const linksHtml = params.books
    .map(
      (book) =>
        `<li style="margin-bottom:12px;"><strong>${escapeHtml(book.title)}</strong><br/><a href="${book.driveLink}" style="color:#2C7A7B;">Descargar libro</a></li>`
    )
    .join('');

  await transporter.sendMail({
    from: `"${fromName}" <${process.env.GMAIL_USER}>`,
    to: params.to,
    subject: 'Tu compra en The Mom Coach — enlaces de descarga',
    html: `
      <div style="font-family: Arial, sans-serif; color:#333; max-width:520px; margin:0 auto;">
        <h2 style="color:#2C7A7B;">¡Gracias por tu compra!</h2>
        <p>Ya puedes descargar tu(s) libro(s) desde los siguientes enlaces:</p>
        <ul style="padding-left:20px;">${linksHtml}</ul>
        <p style="font-size:0.85rem; color:#666;">Número de orden: ${escapeHtml(params.orderId)}</p>
        <p style="font-size:0.85rem; color:#666;">Si tienes algún problema para acceder al archivo, responde a este correo y te ayudaremos.</p>
      </div>
    `,
  });
}
