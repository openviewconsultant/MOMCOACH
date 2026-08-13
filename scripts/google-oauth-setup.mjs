// Autorización de Google Calendar de una sola vez.
//
// Uso:
//   1. Agrega GOOGLE_OAUTH_CLIENT_ID y GOOGLE_OAUTH_CLIENT_SECRET a .env.local
//      (credenciales tipo "OAuth client ID" > "Web application", con
//      http://localhost:3939/oauth2callback como Authorized redirect URI).
//   2. Corre: node scripts/google-oauth-setup.mjs
//   3. Abre la URL que imprime, inicia sesión con la cuenta de Gmail dueña
//      del calendario, acepta los permisos.
//   4. El script imprime GOOGLE_OAUTH_REFRESH_TOKEN — pégalo en .env.local
//      (y en las variables de entorno de producción).

import { google } from 'googleapis';
import http from 'http';
import fs from 'fs';
import { URL } from 'url';

const envPath = new URL('../.env.local', import.meta.url);
const env = fs.readFileSync(envPath, 'utf8');
function get(name) {
  const m = env.match(new RegExp(`^${name}=(.*)$`, 'm'));
  if (!m) return undefined;
  let v = m[1].trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  return v;
}

const clientId = get('GOOGLE_OAUTH_CLIENT_ID');
const clientSecret = get('GOOGLE_OAUTH_CLIENT_SECRET');
const PORT = 3939;
const redirectUri = `http://localhost:${PORT}/oauth2callback`;

if (!clientId || !clientSecret) {
  console.error('Faltan GOOGLE_OAUTH_CLIENT_ID y/o GOOGLE_OAUTH_CLIENT_SECRET en .env.local');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/calendar'],
});

console.log('\nAbre esta URL en tu navegador e inicia sesión con la cuenta de Gmail dueña del calendario:\n');
console.log(authUrl + '\n');

const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith('/oauth2callback')) {
    res.writeHead(404);
    res.end();
    return;
  }
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const code = url.searchParams.get('code');
  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Falta el código de autorización</h1>');
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Listo, ya puedes cerrar esta pestaña.</h1>');
    console.log('\n✅ Autorización exitosa. Agrega esto a .env.local (y a producción):\n');
    console.log(`GOOGLE_OAUTH_CLIENT_ID=${clientId}`);
    console.log(`GOOGLE_OAUTH_CLIENT_SECRET=${clientSecret}`);
    console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}\n`);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Error intercambiando el código</h1>');
    console.error('Error obteniendo el token:', error.message);
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(PORT, () => {
  console.log(`Esperando la autorización en http://localhost:${PORT} ...`);
});
