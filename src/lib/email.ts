import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

interface PurchasedItem {
  title: string;
  downloadUrl: string;
}

const LOGO_FILENAME = 'logo-black.png';
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
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://themomcoaching.com').replace(/\/$/, '');
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
      body { margin:0; padding:0; background-color:#EFE7CE; }
      /* Force our own palette even when the client tries to auto-darken. */
      :root { color-scheme: light; supported-color-scheme: light; }
      [data-ogsc] .force-bg-cream { background-color:#F8F2DA !important; }
      [data-ogsc] .force-bg-page { background-color:#EFE7CE !important; }
      [data-ogsc] .force-bg-white { background-color:#ffffff !important; }
      [data-ogsc] .force-bg-dark { background-color:#2d2a26 !important; }
      [data-ogsc] .force-text-dark { color:#2d2a26 !important; }
      [data-ogsc] .force-text-blue { color:#4C577C !important; }
      [data-ogsc] .force-text-cream { color:#F8F2DA !important; }
      @media (prefers-color-scheme: dark) {
        .force-bg-cream { background-color:#F8F2DA !important; }
        .force-bg-page { background-color:#EFE7CE !important; }
        .force-bg-white { background-color:#ffffff !important; }
        .force-bg-dark { background-color:#2d2a26 !important; }
        .force-text-dark { color:#2d2a26 !important; }
        .force-text-blue { color:#4C577C !important; }
        .force-text-cream { color:#F8F2DA !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#EFE7CE;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#EFE7CE" class="force-bg-page" style="background:#EFE7CE; padding:36px 16px; font-family:Arial, sans-serif;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px; width:100%;">
            <!-- Logo -->
            <tr>
              <td align="center" style="padding:0 0 20px 0;">
                <img src="cid:${LOGO_CID}" alt="The Mom Coach" width="128" height="128" style="display:block; width:128px; height:auto; border:0; outline:none;" />
              </td>
            </tr>
            <!-- Card -->
            <tr>
              <td bgcolor="#ffffff" class="force-bg-white" style="background:#ffffff; border-radius:22px; overflow:hidden; box-shadow:0 8px 30px rgba(76,87,124,0.10);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td height="5" bgcolor="#71B0B4" style="background:#71B0B4; line-height:5px; font-size:5px;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td bgcolor="#ffffff" class="force-bg-white" style="background:#ffffff; padding:34px 34px 6px; text-align:center;">
                      <p style="margin:0 0 10px 0; font-size:38px; line-height:1;">${params.headerEmoji}</p>
                      <h1 class="force-text-blue" style="margin:0; font-family:Georgia, 'Times New Roman', serif; font-size:27px; line-height:1.25; color:#4C577C;">
                        ${params.headerTitle}
                      </h1>
                      <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:16px auto 0;">
                        <tr><td width="48" height="3" bgcolor="#CD807B" style="background:#CD807B; line-height:3px; font-size:3px; border-radius:3px;">&nbsp;</td></tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td bgcolor="#ffffff" class="force-bg-white" style="background:#ffffff; padding:26px 34px 34px;">
                      ${params.bodyHtml}
                    </td>
                  </tr>
                  <tr>
                    <td bgcolor="#2d2a26" class="force-bg-dark" style="background:#2d2a26; padding:24px 32px; text-align:center;">
                      <p class="force-text-cream" style="margin:0 0 5px; font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#F8F2DA; letter-spacing:0.02em;">The Mom Coach</p>
                      <p style="margin:0 0 10px; font-family:Arial, sans-serif; font-size:11px; color:rgba(248,242,218,0.55); letter-spacing:0.08em; text-transform:uppercase;">Sueño infantil &amp; alimentación complementaria</p>
                      <a href="${siteUrl}" style="font-family:Arial, sans-serif; font-size:12px; color:#EFC6A1; text-decoration:none;">themomcoaching.com</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:18px 12px 0; font-family:Arial, sans-serif; font-size:11px; line-height:1.5; color:#9A8C7E;">
                Recibiste este correo porque hiciste una compra o reserva en The Mom Coach.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** HTML del correo de compra (sin enviarlo). Útil para previsualizar. */
export function purchaseEmailHtml(params: { items: PurchasedItem[]; orderId: string }): string {
  const itemsHtml = params.items
    .map(
      (item) => `
        <tr>
          <td style="padding:0 0 14px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#F8F2DA" class="force-bg-cream" style="background:#F8F2DA; border-radius:14px;">
              <tr>
                <td style="padding:18px 20px;">
                  <p class="force-text-blue" style="margin:0 0 14px 0; font-family:Georgia, 'Times New Roman', serif; font-size:17px; line-height:1.4; color:#4C577C;">
                    ${escapeHtml(item.title)}
                  </p>
                  <a href="${item.downloadUrl}"
                     style="display:inline-block; background:#CD807B; color:#ffffff; text-decoration:none; font-family:Arial, sans-serif; font-size:14px; font-weight:bold; padding:11px 26px; border-radius:999px;">
                    Descargar &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    )
    .join('');

  const bodyHtml = `
    <p class="force-text-dark" style="margin:0 0 22px 0; font-size:15px; line-height:1.6; color:#2d2a26;">
      ¡Tu compra está lista! Toca el botón debajo de cada título para descargar tu archivo.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${itemsHtml}
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
      <tr>
        <td bgcolor="#F1EAD3" class="force-bg-cream" style="background:#F1EAD3; border-radius:12px; padding:14px 18px;">
          <p class="force-text-blue" style="margin:0; font-size:13px; line-height:1.55; color:#4C577C;">
            📩 <strong>Cada enlace vence a las 48&nbsp;horas</strong> de recibir este correo. Descarga y guarda tus archivos cuanto antes.
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:22px 0 0 0; font-size:13px; line-height:1.5; color:#9A8C7E;">
      Orden <strong style="color:#7A6A62;">${escapeHtml(params.orderId)}</strong> &nbsp;·&nbsp; ¿El enlace expiró o tienes algún problema? Responde a este correo y te ayudamos.
    </p>
  `;

  return emailShell({ headerEmoji: '🎉', headerTitle: '¡Gracias por tu compra!', bodyHtml });
}

export async function sendPurchaseEmail(params: {
  to: string;
  items: PurchasedItem[];
  orderId: string;
}): Promise<void> {
  const { transporter, from } = getTransporter();
  await transporter.sendMail({
    from,
    to: params.to,
    subject: '🎉 Tu compra en The Mom Coach — enlaces de descarga',
    html: purchaseEmailHtml({ items: params.items, orderId: params.orderId }),
    attachments: getLogoAttachment(),
  });
}

/** HTML del correo de confirmación de cita (sin enviarlo). Útil para previsualizar. */
export function bookingConfirmationEmailHtml(params: {
  name: string;
  start: string;
  timeZone: string;
  meetLink: string | null;
  title: string;
}): string {
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
      Hola <strong>${escapeHtml(params.name)}</strong>, tu cita quedó <strong>confirmada</strong>. Aquí tienes los detalles:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#4C577C" style="background:#4C577C; border-radius:16px; margin-bottom:18px;">
      <tr>
        <td style="padding:22px 24px;">
          <p style="margin:0 0 10px; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.7);">Tu cita</p>
          <p style="margin:0 0 10px; font-family:Georgia, 'Times New Roman', serif; font-size:19px; line-height:1.35; color:#ffffff;">
            ${escapeHtml(params.title)}
          </p>
          <p style="margin:0; font-size:15px; color:#EFC6A1; text-transform:capitalize;">
            📅 ${formattedDate}
          </p>
        </td>
      </tr>
    </table>
    ${
      params.meetLink
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 4px;"><tr><td align="center">
             <a href="${params.meetLink}" style="display:inline-block; background:#CD807B; color:#ffffff; text-decoration:none; font-family:Arial, sans-serif; font-size:15px; font-weight:bold; padding:13px 36px; border-radius:999px;">Unirme a la videollamada</a>
           </td></tr></table>`
        : ''
    }
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0;">
      <tr>
        <td bgcolor="#F1EAD3" class="force-bg-cream" style="background:#F1EAD3; border-radius:12px; padding:14px 18px;">
          <p class="force-text-blue" style="margin:0; font-size:13px; line-height:1.55; color:#4C577C;">
            🗓️ Te enviamos también una invitación de Google Calendar. ¿Necesitas reprogramar o cancelar? Responde a este correo.
          </p>
        </td>
      </tr>
    </table>
  `;

  return emailShell({ headerEmoji: '✅', headerTitle: '¡Cita confirmada!', bodyHtml });
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
  await transporter.sendMail({
    from,
    to: params.to,
    subject: `✅ Tu cita "${params.title}" quedó confirmada`,
    html: bookingConfirmationEmailHtml(params),
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
  const greeting = params.recipientName
    ? `Hola <strong>${escapeHtml(params.recipientName)}</strong>,`
    : 'Hola,';
  const program = escapeHtml(params.programLabel);
  const storeUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://themomcoaching.com').replace(/\/$/, '');

  const step = (n: string, text: string) => `
    <tr>
      <td width="34" valign="top" style="padding:0 12px 14px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td width="26" height="26" align="center" valign="middle" bgcolor="#71B0B4"
              style="background:#71B0B4; border-radius:999px; font-family:Arial,sans-serif; font-size:13px; font-weight:bold; color:#ffffff; line-height:26px;">${n}</td>
        </tr></table>
      </td>
      <td valign="top" class="force-text-dark" style="padding:0 0 14px 0; font-family:Arial,sans-serif; font-size:14px; line-height:1.55; color:#2d2a26;">${text}</td>
    </tr>`;

  const bodyHtml = `
    <p class="force-text-dark" style="margin:0 0 22px 0; font-size:15px; line-height:1.6; color:#2d2a26;">
      ${greeting} te regalaron una <strong>Gift Card de The Mom Coach</strong> para el ${program}. 🌙
    </p>

    ${
      params.message
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px 0;">
             <tr>
               <td width="4" bgcolor="#CD807B" style="background:#CD807B; border-radius:4px;"></td>
               <td bgcolor="#F8F2DA" class="force-bg-cream" style="background:#F8F2DA; border-radius:0 12px 12px 0; padding:14px 18px;">
                 <p style="margin:0 0 5px; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#8A776C;">Un mensaje para ti</p>
                 <p class="force-text-dark" style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:15px; line-height:1.6; color:#2d2a26; font-style:italic;">&ldquo;${escapeHtml(params.message)}&rdquo;</p>
               </td>
             </tr>
           </table>`
        : ''
    }

    <!-- Tarjeta de regalo -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#4C577C"
           style="background:#4C577C; background:linear-gradient(135deg,#4C577C 0%,#71B0B4 100%); border-radius:20px; margin:0 0 26px 0;">
      <tr>
        <td style="padding:28px 26px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="left" style="font-family:Georgia,'Times New Roman',serif; font-size:15px; color:#ffffff; letter-spacing:0.04em;">The Mom Coach</td>
              <td align="right" style="font-family:Arial,sans-serif; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:rgba(255,255,255,0.75);">Gift Card</td>
            </tr>
          </table>

          <p style="margin:22px 0 2px; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.7);">Saldo disponible</p>
          <p style="margin:0 0 18px; font-family:Georgia,'Times New Roman',serif; font-size:40px; line-height:1.1; color:#ffffff;">USD&nbsp;$${params.amount}</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" class="force-bg-white" style="background:#ffffff; border-radius:12px;">
            <tr>
              <td align="center" style="padding:12px 16px;">
                <p style="margin:0 0 3px; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#8A776C;">Código para canjear</p>
                <p class="force-text-blue" style="margin:0; font-family:'Courier New',Courier,monospace; font-size:23px; font-weight:bold; letter-spacing:0.16em; color:#4C577C;">${escapeHtml(params.code)}</p>
              </td>
            </tr>
          </table>

          <p style="margin:16px 0 0; font-size:12px; color:rgba(255,255,255,0.8);">Para el <strong style="color:#ffffff;">${program}</strong></p>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
      <tr>
        <td align="center">
          <a href="${storeUrl}/tienda"
             style="display:inline-block; background:#CD807B; color:#ffffff; text-decoration:none; font-family:Arial,sans-serif; font-size:15px; font-weight:bold; padding:14px 40px; border-radius:999px;">
            Canjear en la tienda
          </a>
        </td>
      </tr>
    </table>

    <p class="force-text-dark" style="margin:0 0 14px 0; font-family:Georgia,'Times New Roman',serif; font-size:18px; color:#2d2a26;">Cómo usarla</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${step('1', `Entra a la tienda y agrega al carrito lo que quieras del <strong>${program}</strong>.`)}
      ${step('2', 'En el carrito, toca <em>&ldquo;¿Tienes una Gift Card?&rdquo;</em> y escribe tu código.')}
      ${step('3', 'El monto se descuenta automáticamente. Si sobra saldo, queda guardado para tu próxima compra.')}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0;">
      <tr>
        <td bgcolor="#F8F2DA" class="force-bg-cream" style="background:#F8F2DA; border-radius:12px; padding:14px 18px;">
          <p class="force-text-blue" style="margin:0; font-size:12px; line-height:1.55; color:#4C577C;">
            Válida solo para productos del ${program}. No caduca y puede usarse en varias compras hasta agotar el saldo. ¿Dudas? Responde a este correo.
          </p>
        </td>
      </tr>
    </table>
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
