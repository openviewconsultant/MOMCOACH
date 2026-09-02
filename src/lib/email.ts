import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

interface PurchasedItem {
  title: string;
  downloadUrl: string;
}

const LOGO_FILENAME = 'PHOTO-2026-07-14-08-47-02.jpg';
const LOGO_CID = 'momcoach-logo';

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

// Embedding the logo as a cid: attachment (instead of a remote <img src="...">
// pointing at NEXT_PUBLIC_SITE_URL) means it always renders — it doesn't
// depend on the site being publicly reachable, and mail clients don't block
// it as "external content".
function getLogoAttachment(): nodemailer.SendMailOptions['attachments'] {
  try {
    const filePath = path.join(process.cwd(), 'public', LOGO_FILENAME);
    return [
      {
        filename: LOGO_FILENAME,
        content: fs.readFileSync(filePath),
        cid: LOGO_CID,
      },
    ];
  } catch {
    return [];
  }
}

// Colors are all explicit (both as inline `style` and, where it matters most,
// as `bgcolor`/`color` attributes) and the <head> opts out of automatic
// "dark mode" re-coloring (Gmail app, Outlook.com, etc.), which otherwise
// inverts our light card design into unreadable dark-on-dark text and can
// hide images. This keeps the email looking the same regardless of the
// recipient's device theme.
function emailShell(params: { headerEmoji: string; headerTitle: string; bodyHtml: string }): string {
  return `<!doctype html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-scheme" content="light" />
    <title>The Mom Coach</title>
    <!--[if mso]>
    <style>table, td { font-family: Arial, sans-serif !important; }</style>
    <![endif]-->
    <style>
      body { margin:0; padding:0; background-color:#F8F2DA; }
      /* Force our own palette even when the client tries to auto-darken. */
      :root { color-scheme: light; supported-color-scheme: light; }
      [data-ogsc] .force-bg-cream { background-color:#F8F2DA !important; }
      [data-ogsc] .force-bg-white { background-color:#ffffff !important; }
      [data-ogsc] .force-bg-dark { background-color:#2d2a26 !important; }
      [data-ogsc] .force-text-dark { color:#2d2a26 !important; }
      [data-ogsc] .force-text-blue { color:#4C577C !important; }
      [data-ogsc] .force-text-cream { color:#F8F2DA !important; }
      @media (prefers-color-scheme: dark) {
        .force-bg-cream { background-color:#F8F2DA !important; }
        .force-bg-white { background-color:#ffffff !important; }
        .force-bg-dark { background-color:#2d2a26 !important; }
        .force-text-dark { color:#2d2a26 !important; }
        .force-text-blue { color:#4C577C !important; }
        .force-text-cream { color:#F8F2DA !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#F8F2DA;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#F8F2DA" class="force-bg-cream" style="background:#F8F2DA; padding:32px 16px; font-family:Arial, sans-serif;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" bgcolor="#ffffff" class="force-bg-white" style="max-width:560px; width:100%; background:#ffffff; border-radius:20px; overflow:hidden;">
            <tr>
              <td bgcolor="#ffffff" class="force-bg-white" style="background:#ffffff; padding:24px 32px 8px; text-align:center;">
                <img src="cid:${LOGO_CID}" alt="The Mom Coach" width="160" height="160" style="display:inline-block; width:160px; max-width:60%; height:auto; border-radius:16px; border:0; outline:none;" />
              </td>
            </tr>
            <tr>
              <td bgcolor="#71B0B4" style="background:linear-gradient(135deg, #71B0B4, #CD807B); background-color:#71B0B4; padding:28px 32px 28px; text-align:center;">
                <p style="margin:0 0 6px 0; font-size:34px;">${params.headerEmoji}</p>
                <h1 style="margin:0; font-family:Georgia, 'Times New Roman', serif; font-size:26px; color:#ffffff;">
                  ${params.headerTitle}
                </h1>
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" class="force-bg-white" style="background:#ffffff; padding:32px;">
                ${params.bodyHtml}
              </td>
            </tr>
            <tr>
              <td bgcolor="#2d2a26" class="force-bg-dark" style="background:#2d2a26; padding:26px 32px; text-align:center;">
                <p class="force-text-cream" style="margin:0 0 4px; font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#F8F2DA; letter-spacing:0.02em;">The Mom Coach</p>
                <p style="margin:0; font-family:Arial, sans-serif; font-size:11px; color:rgba(248,242,218,0.55); letter-spacing:0.08em; text-transform:uppercase;">Coach de sueño infantil y alimentación complementaria</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#F8F2DA" class="force-bg-cream" style="background:#F8F2DA; border-radius:14px;">
              <tr>
                <td style="padding:18px 20px;">
                  <p class="force-text-blue" style="margin:0 0 12px 0; font-family:Georgia, 'Times New Roman', serif; font-size:17px; color:#4C577C;">
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
    <p class="force-text-dark" style="margin:0 0 24px 0; font-size:15px; line-height:1.6; color:#2d2a26;">
      Ya puedes descargar tu(s) libro(s). Toca el botón debajo de cada título para acceder a tu archivo.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${itemsHtml}
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
      <tr>
        <td bgcolor="#F8F2DA" class="force-bg-cream" style="background:#F8F2DA; border-radius:12px; padding:14px 18px;">
          <p class="force-text-blue" style="margin:0; font-size:13px; line-height:1.5; color:#4C577C;">
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
    attachments: getLogoAttachment(),
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

  const formattedDate = new Date(params.start)
    .toLocaleString('es-CO', {
      timeZone: params.timeZone,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(/[\xa0 ]/g, ' ');

  const bodyHtml = `
    <p class="force-text-dark" style="margin:0 0 20px 0; font-size:15px; line-height:1.6; color:#2d2a26;">
      Hola <strong>${escapeHtml(params.name)}</strong>, tu cita quedó confirmada. Aquí tienes los detalles:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#F8F2DA" class="force-bg-cream" style="background:#F8F2DA; border-radius:14px; margin-bottom:16px;">
      <tr>
        <td style="padding:18px 20px;">
          <p class="force-text-blue" style="margin:0 0 6px 0; font-family:Georgia, 'Times New Roman', serif; font-size:17px; color:#4C577C;">
            ${escapeHtml(params.title)}
          </p>
          <p class="force-text-dark" style="margin:0; font-size:14px; color:#2d2a26; text-transform:capitalize;">
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
    attachments: getLogoAttachment(),
  });
}

interface GiftCardEmailParams {
  to: string;
  recipientName: string | null;
  purchaserEmail: string;
  code: string;
  amount: number;
  programLabel: string;
  message: string | null;
}

/** Devuelve el HTML del correo de gift card (sin enviarlo). Útil para previsualizar. */
export function giftCardEmailHtml(params: Omit<GiftCardEmailParams, 'to'>): string {
  const greeting = params.recipientName ? `Hola <strong>${escapeHtml(params.recipientName)}</strong>,` : 'Hola,';

  const bodyHtml = `
    <p class="force-text-dark" style="margin:0 0 20px 0; font-size:15px; line-height:1.6; color:#2d2a26;">
      ${greeting} te han regalado una <strong>Gift Card de The Mom Coach</strong> para el ${escapeHtml(params.programLabel)}.
    </p>
    ${
      params.message
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#F8F2DA" class="force-bg-cream" style="background:#F8F2DA; border-radius:14px; margin-bottom:16px;">
             <tr><td style="padding:16px 20px;">
               <p style="margin:0 0 4px; font-size:12px; letter-spacing:0.06em; text-transform:uppercase; color:#7A6A62;">Mensaje de ${escapeHtml(params.purchaserEmail)}</p>
               <p class="force-text-dark" style="margin:0; font-size:14px; line-height:1.6; color:#2d2a26; font-style:italic;">"${escapeHtml(params.message)}"</p>
             </td></tr>
           </table>`
        : ''
    }
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#4C577C" style="background:#4C577C; border-radius:16px; margin-bottom:20px;">
      <tr><td style="padding:26px 24px; text-align:center;">
        <p style="margin:0 0 6px; font-size:13px; letter-spacing:0.08em; text-transform:uppercase; color:rgba(255,255,255,0.7);">Saldo de tu Gift Card</p>
        <p style="margin:0 0 16px; font-family:Georgia,'Times New Roman',serif; font-size:34px; color:#ffffff;">USD $${params.amount}</p>
        <p style="margin:0 0 6px; font-size:13px; letter-spacing:0.08em; text-transform:uppercase; color:rgba(255,255,255,0.7);">Código</p>
        <p style="margin:0; font-family:'Courier New',monospace; font-size:22px; font-weight:bold; letter-spacing:0.12em; color:#EFC6A1;">${escapeHtml(params.code)}</p>
      </td></tr>
    </table>
    <p class="force-text-dark" style="margin:0 0 8px 0; font-size:14px; line-height:1.6; color:#2d2a26;">
      <strong>¿Cómo canjearla?</strong>
    </p>
    <p class="force-text-dark" style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#2d2a26;">
      Entra a la tienda, agrega al carrito los recursos que quieras del ${escapeHtml(params.programLabel)} y, en el carrito, escribe tu código en el campo <em>"¿Tienes una Gift Card?"</em>. Se descontará automáticamente del total y el saldo restante queda disponible para tu próxima compra.
    </p>
    <p style="margin:0; font-size:13px; color:#999;">
      Esta Gift Card es válida solo para productos del ${escapeHtml(params.programLabel)}. Si tienes dudas, responde a este correo.
    </p>
  `;

  return emailShell({ headerEmoji: '🎁', headerTitle: '¡Tienes un regalo!', bodyHtml });
}

export async function sendGiftCardEmail(params: GiftCardEmailParams): Promise<void> {
  const { transporter, from } = getTransporter();
  await transporter.sendMail({
    from,
    to: params.to,
    subject: `🎁 Te regalaron una Gift Card de The Mom Coach`,
    html: giftCardEmailHtml(params),
    attachments: getLogoAttachment(),
  });
}
