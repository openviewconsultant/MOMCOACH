import nodemailer from 'nodemailer';

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

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): { transporter: nodemailer.Transporter; from: string } {
  const user = process.env.GMAIL_USER;
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!user || !appPassword) {
    throw new Error('Faltan las variables de entorno GMAIL_USER y/o GMAIL_APP_PASSWORD');
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass: appPassword },
    });
  }

  const fromName = process.env.GMAIL_FROM_NAME || 'The Mom Coach';
  return { transporter, from: `${fromName} <${user}>` };
}

function getLogoUrl(): string {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.themomcoaching.com').replace(/\/+$/, '');
  return `${siteUrl}/PHOTO-2026-07-14-08-47-02.jpg`;
}

function emailShell(params: { headerEmoji: string; headerTitle: string; bodyHtml: string }): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F2DA; padding:32px 16px; font-family:Arial, sans-serif;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px; width:100%; background:#ffffff; border-radius:20px; overflow:hidden;">
            <tr>
              <td style="background:#ffffff; padding:24px 32px 8px; text-align:center;">
                <img src="${getLogoUrl()}" alt="The Mom Coach" width="160" style="display:inline-block; width:160px; max-width:60%; height:auto;" />
              </td>
            </tr>
            <tr>
              <td style="background:linear-gradient(135deg, #71B0B4, #CD807B); background-color:#71B0B4; padding:28px 32px 28px; text-align:center;">
                <p style="margin:0 0 6px 0; font-size:34px;">${params.headerEmoji}</p>
                <h1 style="margin:0; font-family:Georgia, 'Times New Roman', serif; font-size:26px; color:#ffffff;">
                  ${params.headerTitle}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${params.bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="background:#2d2a26; padding:20px 32px; text-align:center;">
                <p style="margin:0; font-family:Georgia, 'Times New Roman', serif; font-size:15px; color:#F8F2DA;">The Mom Coach</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

export async function sendPurchaseEmail(params: {
  to: string;
  items: PurchasedItem[];
  orderId: string;
}): Promise<void> {
  const { transporter, from } = getTransporter();

  const itemsHtml = params.items
    .map(
      (item) => `
        <tr>
          <td style="padding:0 0 16px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F2DA; border-radius:14px;">
              <tr>
                <td style="padding:18px 20px;">
                  <p style="margin:0 0 12px 0; font-family:Georgia, 'Times New Roman', serif; font-size:17px; color:#4C577C;">
                    ${escapeHtml(item.title)}
                  </p>
                  <a href="${item.downloadUrl}"
                     style="display:inline-block; background:#CD807B; color:#ffffff; text-decoration:none; font-family:Arial, sans-serif; font-size:14px; font-weight:bold; padding:10px 22px; border-radius:999px;">
                    Descargar mi libro
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    )
    .join('');

  const bodyHtml = `
    <p style="margin:0 0 24px 0; font-size:15px; line-height:1.6; color:#2d2a26;">
      Ya puedes descargar tu(s) libro(s). Toca el botón debajo de cada título para acceder a tu archivo.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${itemsHtml}
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
      <tr>
        <td style="background:#F8F2DA; border-radius:12px; padding:14px 18px;">
          <p style="margin:0; font-size:13px; line-height:1.5; color:#4C577C;">
            📩 <strong>Cada enlace es válido solo por 48 horas</strong> desde que recibiste este correo. Después de ese tiempo dejará de funcionar por seguridad.
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:24px 0 0 0; font-size:13px; color:#999;">
      Número de orden: ${escapeHtml(params.orderId)}
    </p>
    <p style="margin:8px 0 0 0; font-size:13px; color:#999;">
      ¿El enlace expiró o tienes algún problema? Responde a este correo y te ayudamos.
    </p>
  `;

  await transporter.sendMail({
    from,
    to: params.to,
    subject: '🎉 Tu compra en The Mom Coach — enlaces de descarga',
    html: emailShell({ headerEmoji: '🎉', headerTitle: '¡Gracias por tu compra!', bodyHtml }),
  });
}

export async function sendBookingConfirmationEmail(params: {
  to: string;
  name: string;
  start: string;
  timeZone: string;
  meetLink: string | null;
  title: string;
}): Promise<void> {
  const { transporter, from } = getTransporter();

  const formattedDate = new Date(params.start).toLocaleString('es-CO', {
    timeZone: params.timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const bodyHtml = `
    <p style="margin:0 0 20px 0; font-size:15px; line-height:1.6; color:#2d2a26;">
      Hola <strong>${escapeHtml(params.name)}</strong>, tu cita quedó confirmada. Aquí tienes los detalles:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F2DA; border-radius:14px; margin-bottom:16px;">
      <tr>
        <td style="padding:18px 20px;">
          <p style="margin:0 0 6px 0; font-family:Georgia, 'Times New Roman', serif; font-size:17px; color:#4C577C;">
            ${escapeHtml(params.title)}
          </p>
          <p style="margin:0; font-size:14px; color:#2d2a26; text-transform:capitalize;">
            📅 ${formattedDate}
          </p>
        </td>
      </tr>
    </table>
    ${
      params.meetLink
        ? `<a href="${params.meetLink}" style="display:inline-block; background:#CD807B; color:#ffffff; text-decoration:none; font-family:Arial, sans-serif; font-size:14px; font-weight:bold; padding:10px 22px; border-radius:999px;">Unirme a la videollamada</a>`
        : ''
    }
    <p style="margin:24px 0 0 0; font-size:13px; color:#999;">
      Te enviamos también una invitación de Google Calendar para que quede guardada en tu calendario. Si necesitas reprogramar o cancelar, responde a este correo.
    </p>
  `;

  await transporter.sendMail({
    from,
    to: params.to,
    subject: `✅ Tu cita "${params.title}" quedó confirmada`,
    html: emailShell({ headerEmoji: '✅', headerTitle: '¡Cita confirmada!', bodyHtml }),
  });
}
