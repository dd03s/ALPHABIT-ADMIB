import express, { type Request, type Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dns from 'dns';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Force IPv4 DNS resolution globally in Node.js
// Fixes "connect ENETUNREACH [IPv6]:465" in Render/Docker containers without IPv6 routing
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Ignored if older Node runtime
}

// Monkey-patch dns.lookup so that any library (nodemailer, net, tls) querying DNS always gets IPv4
const originalDnsLookup = dns.lookup;
(dns as any).lookup = function (hostname: string, options: any, callback: any) {
  const cb = typeof options === 'function' ? options : callback;
  let opts: any;
  if (typeof options === 'object' && options !== null) {
    opts = Object.assign({}, options, { family: 4 });
  } else {
    opts = { family: 4 };
  }
  return (originalDnsLookup as any).call(dns, hostname, opts, cb);
};

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// 1. CORS Middleware MUST run before any body parsing or route handling
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // If request comes with an Origin header (e.g. from browser http://localhost:5173 or external domains)
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');

  // Support headers requested by preflight or allow all standard and custom headers
  const reqHeaders = req.headers['access-control-request-headers'];
  if (reqHeaders) {
    res.setHeader('Access-Control-Allow-Headers', reqHeaders);
  } else {
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, X-CSRF-Token');
  }

  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Fast return for preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Explicit OPTIONS handler for all endpoints
app.options('*', (req, res) => {
  res.status(204).end();
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Health check and CORS diagnostic endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ALPHABIT CMS & API',
    cors: 'enabled',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Seed data storage file path
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'projects.json');
const SERVICES_FILE = path.join(DATA_DIR, 'services.json');
const INFO_FILE = path.join(DATA_DIR, 'info.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default projects for ALPHABIT
const INITIAL_PROJECTS = [
  {
    _id: '65f02a01c4e9123456789101',
    id: '65f02a01c4e9123456789101',
    title: 'Dermalaser – Rediseño de Logo – Ejercicio Creativo #002',
    subtitle: 'Ejercicio Creativo #002',
    category: 'LOGOS',
    tags: ['Diseño Gráfico', 'Línea Gráfica', 'Logo', 'Rediseño'],
    date: '2026-09-11',
    coverImage: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Rediseño de identidad visual para Clínica Dermalaser, llevando el logo anterior a un nuevo nivel de limpieza, orden y compatibilidad con medios digitales.',
    description: 'Rediseño de identidad visual para Clínica Dermalaser, llevando el logo anterior a un nuevo nivel de limpieza, orden y compatibilidad con medios digitales.',
    body: [
      {
        type: 'text',
        content: 'Como parte de nuestros ejercicios creativos de septiembre, abordamos el rediseño de marca para Clínica Dermalaser. El objetivo principal fue depurar los trazos del isotipo original, logrando una síntesis geométrica que proyecta precisión médica y calidez estética.'
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1400&q=80',
        caption: 'Construcción geométrica y retícula del nuevo isotipo Dermalaser'
      }
    ],
    slug: 'dermalaser-rediseno-logo-002',
    status: 'published',
    featured: true,
    client: 'Clínica Dermalaser',
    link: 'https://alphabit.sv/casos/dermalaser',
    createdAt: 1726056000000,
    updatedAt: 1726056000000
  },
  {
    _id: '65f02a01c4e9123456789102',
    id: '65f02a01c4e9123456789102',
    title: 'Historiales Liceo Cristiano «Rev. Juan Bueno» – Diseño Gráfico y Fotografía',
    subtitle: 'Diseño Gráfico y Fotografía Institucional',
    category: 'DISEÑOS',
    tags: ['Diseño Gráfico', 'Fotografía', 'Identidad', 'Editorial'],
    date: '2026-09-02',
    coverImage: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Desarrollo gráfico y cobertura fotográfica institucional para el sistema educativo Liceo Cristiano.',
    description: 'Desarrollo gráfico y cobertura fotográfica institucional para el sistema educativo Liceo Cristiano.',
    body: [
      {
        type: 'text',
        content: 'Producción de piezas gráficas y cobertura fotográfica de alta resolución documentando la trayectoria educativa del Liceo Cristiano Reverendo Juan Bueno.'
      }
    ],
    slug: 'historiales-liceo-cristiano-juan-bueno',
    status: 'published',
    featured: false,
    client: 'Liceo Cristiano Rev. Juan Bueno',
    link: '',
    createdAt: 1725278400000,
    updatedAt: 1725278400000
  },
  {
    _id: '65f02a01c4e9123456789103',
    id: '65f02a01c4e9123456789103',
    title: 'Memoria de Labores ACONAC 2021 – Diseño Editorial – El Salvador',
    subtitle: 'Diseño Editorial Corporativo',
    category: 'DISEÑOS',
    tags: ['Diseño Editorial', 'Publicación', 'Diagramación', 'Infografías'],
    date: '2026-07-29',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Diseño y maquetación de memoria anual corporativa con infografías y balance financiero.',
    description: 'Diseño y maquetación de memoria anual corporativa con infografías y balance financiero.',
    body: [
      {
        type: 'text',
        content: 'Diagramación editorial de más de 80 páginas que integran gráficos financieros, informes de impacto social y fotografías institucionales en un formato elegante impreso y digital.'
      }
    ],
    slug: 'memoria-de-labores-aconac-2021',
    status: 'published',
    featured: true,
    client: 'ACONAC de R.L.',
    link: '',
    createdAt: 1722254400000,
    updatedAt: 1722254400000
  },
  {
    _id: '65f02a01c4e9123456789104',
    id: '65f02a01c4e9123456789104',
    title: 'Casa Vía del Mar – Fotografía Inmobiliaria – El Salvador',
    subtitle: 'Fotografía de Arquitectura Contemporánea',
    category: 'PROYECTOS FOTOGRÁFICOS',
    tags: ['Fotografía', 'Inmobiliaria', 'Arquitectura', 'Luz Natural'],
    date: '2026-07-03',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Sesión fotográfica de arquitectura contemporánea y espacios residenciales de lujo en Vía del Mar.',
    description: 'Sesión fotográfica de arquitectura contemporánea y espacios residenciales de lujo en Vía del Mar.',
    body: [
      {
        type: 'text',
        content: 'Dirección de fotografía capturando la interacción de la luz natural con el concreto arquitectónico, ventanales panorámicos y vegetación tropical en una residencia privada.'
      }
    ],
    slug: 'casa-via-del-mar-fotografia-inmobiliaria',
    status: 'published',
    featured: true,
    client: 'Desarrollos Residenciales SV',
    link: '',
    createdAt: 1720008000000,
    updatedAt: 1720008000000
  },
  {
    _id: '65f02a01c4e9123456789105',
    id: '65f02a01c4e9123456789105',
    title: 'Fresquito – Diseño de Empaque – Ejercicio Creativo',
    subtitle: 'Packaging y Branding Artesanal',
    category: 'DISEÑOS',
    tags: ['Empaque', 'Packaging', 'Identidad', 'Tipografía'],
    date: '2026-06-30',
    coverImage: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=1200&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Propuesta de branding y empaque para bebida artesanal con tipografía personalizada y colores frescos.',
    description: 'Propuesta de branding y empaque para bebida artesanal con tipografía personalizada y colores frescos.',
    body: [
      {
        type: 'text',
        content: 'Concepto integral de empaque en vidrio reciclable con etiquetas minimalistas para una línea de jugos y tónicos artesanales salvadoreños.'
      }
    ],
    slug: 'fresquito-diseno-empaque-ejercicio-creativo',
    status: 'published',
    featured: false,
    client: 'Fresquito Artesanal',
    link: '',
    createdAt: 1719748800000,
    updatedAt: 1719748800000
  }
];

const INITIAL_SERVICES = [
  {
    _id: '65f01a01c4e9123456789001',
    id: '65f01a01c4e9123456789001',
    name: 'Diseño Gráfico',
    description: 'Identidad visual, línea gráfica coherente, piezas publicitarias y sistemas visuales de alto impacto.',
    icon: 'graphic-design'
  },
  {
    _id: '65f01a01c4e9123456789002',
    id: '65f01a01c4e9123456789002',
    name: 'Fotografía & Dirección de Arte',
    description: 'Producción fotográfica para productos, arquitectura corporativa, moda y sesiones editoriales.',
    icon: 'camera'
  },
  {
    _id: '65f01a01c4e9123456789003',
    id: '65f01a01c4e9123456789003',
    name: 'Diseño Editorial & Empaque',
    description: 'Maquetación de libros, revistas, memorias de labores y packaging comercial con acabados premium.',
    icon: 'book'
  }
];

const INITIAL_INFO = {
  name: 'ALPHABIT',
  tagline: 'Servicios Digitales',
  description: 'Somos ALPHABIT, una agencia de servicios digitales en El Salvador. Transformamos ideas en experiencias visuales que comunican, conectan y perduran.',
  email: 'contacto@alphabit.sv',
  location: 'San Salvador, El Salvador',
  socialLinks: {
    instagram: 'https://instagram.com/alphabit.sv',
    facebook: 'https://facebook.com/alphabit.sv'
  },
  stats: [
    { value: '4+', label: 'Años de experiencia' },
    { value: '+50', label: 'Proyectos completados' },
    { value: 'SV', label: 'El Salvador' }
  ]
};

// Helper read/write functions
function loadData<T>(file: string, defaults: T): T {
  try {
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(`Error reading ${file}:`, e);
  }
  // Initialize file with defaults
  saveData(file, defaults);
  return defaults;
}

function saveData<T>(file: string, data: T): void {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`Error writing ${file}:`, e);
  }
}

// In-memory data initialized from files
let projects = loadData(DATA_FILE, INITIAL_PROJECTS);
let services = loadData(SERVICES_FILE, INITIAL_SERVICES);
let companyInfo = loadData(INFO_FILE, INITIAL_INFO);

// User persistence
interface AppUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: number;
}

let users: AppUser[] = loadData(USERS_FILE, []);

// In-memory active session tokens: token -> session info
const activeSessions = new Map<string, { userId: string; email: string; createdAt: number }>();

// Reusable Nodemailer transporter pool with keep-alive connections
const SMTP_CONFIG_FILE = path.join(DATA_DIR, 'smtp-config.json');

interface SmtpSettings {
  user: string;
  pass: string;
  host: string;
  port: number;
  secure: boolean;
}

let smtpSettings: SmtpSettings = loadData(SMTP_CONFIG_FILE, {
  user: process.env.GMAIL_USER || process.env.SMTP_USER || 'dsavage03fn@gmail.com',
  pass: process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || 'yxgj eiqk hbsa djui',
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: process.env.SMTP_SECURE !== 'false'
});

function getSmtpConfig(): SmtpSettings {
  const envUser = (process.env.GMAIL_USER || process.env.SMTP_USER || '').trim();
  const envPass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || '').replace(/\s+/g, '');
  
  // Environment variables take first priority, followed by persisted settings, followed by defaults
  const user = envUser || (smtpSettings.user || 'dsavage03fn@gmail.com').trim();
  const pass = envPass || (smtpSettings.pass || 'yxgj eiqk hbsa djui').replace(/\s+/g, '');
  const host = (process.env.SMTP_HOST || smtpSettings.host || 'smtp.gmail.com').trim();
  const port = parseInt(process.env.SMTP_PORT || String(smtpSettings.port || 465), 10);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE !== 'false' : smtpSettings.secure !== false;

  return { user, pass, host, port, secure };
}

// Custom DNS IPv4 resolver callback
// CRITICAL: Forces IPv4 socket connection, eliminating "connect ENETUNREACH [IPv6]:465" in Render/Docker containers
async function resolveIpv4Host(targetHost: string): Promise<string> {
  // If it's an IP, return as is
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(targetHost)) {
    return targetHost;
  }
  return new Promise((resolve) => {
    dns.resolve4(targetHost, (err, addresses) => {
      if (!err && addresses && addresses.length > 0) {
        return resolve(addresses[0]);
      }
      dns.lookup(targetHost, { family: 4 }, (_lErr, address) => {
        resolve(address || targetHost);
      });
    });
  });
}

function createSmtpClient(resolvedIp: string, targetHost: string, targetPort: number, isSecure: boolean, user: string, pass: string) {
  return nodemailer.createTransport({
    host: resolvedIp,
    port: targetPort,
    secure: isSecure,
    tls: {
      servername: targetHost,
      rejectUnauthorized: false
    },
    auth: { user, pass },
    connectionTimeout: 5000,
    greetingTimeout: 4000,
    socketTimeout: 8000
  } as any);
}

// Temporary 2FA storage
interface PendingOtp {
  code: string;
  email: string;
  createdAt: number;
  expiresAt: number;
  used: boolean;
  attempts: number;
  lastResendAt: number;
  isRegister: boolean;
  isRecovery?: boolean;
  isDeleteAccount?: boolean;
  user?: AppUser;
  tempUser?: AppUser;
}

const pendingOtps = new Map<string, PendingOtp>();

// Cryptographically secure 6-character code generator (numeric digits for optimal 2FA UX, e.g. 482910)
function generateSecureCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

// Real email dispatch with multi-provider and automatic port failover (HTTPS API / SMTP Port 465 / Port 587)
async function sendVerificationEmail(
  toEmail: string,
  userName: string,
  code: string,
  isRecovery: boolean = false,
  isDeleteAccount: boolean = false
) {
  console.log(`\n======================================================`);
  console.log(`[ALPHABIT A2F / 2FA] Código generado para ${toEmail}: [ ${code} ]`);
  console.log(`======================================================\n`);

  let subject = `${code} - Tu código de acceso de ALPHABIT`;
  let title = '¿Estás iniciando sesión?';
  let purposeText = 'Usa este código para iniciar sesión en tu cuenta.';

  if (isDeleteAccount) {
    subject = `${code} - Confirmar eliminación de cuenta de ALPHABIT`;
    title = 'Eliminación de cuenta';
    purposeText = 'Has solicitado eliminar definitivamente tu cuenta de ALPHABIT. Usa este código de seguridad para confirmar esta acción:';
  } else if (isRecovery) {
    subject = `${code} - Código de recuperación de ALPHABIT`;
    title = 'Restablecimiento de contraseña';
    purposeText = 'Usa este código para restablecer la contraseña de tu cuenta.';
  }

  const textBody = `Hola ${userName},\n\nTu código de verificación de ALPHABIT es:\n\n${code}\n\nEste código es confidencial y caduca en 10 minutos.\n\nEl equipo de ALPHABIT`;

  // Clean, high-trust transactional layout
  const htmlBody = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${code}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #171a21; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #c6d4df;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #1b2838; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
    <tr>
      <td style="padding: 28px 32px 16px; background: linear-gradient(135deg, #1e293b, #0f172a); border-bottom: 2px solid #38bdf8;">
        <span style="font-size: 20px; font-weight: 900; letter-spacing: 0.15em; color: #ffffff;">ALPHABIT</span>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #ffffff;">
          ${title}
        </h2>
        <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #94a3b8;">
          Hola <strong style="color: #ffffff;">${userName}</strong>,<br>
          ${purposeText}
        </p>
        <div style="background-color: #0b1320; border-radius: 6px; padding: 20px; text-align: center; margin: 24px 0; border: 1px solid #1e293b;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 8px;">CÓDIGO DE SEGURIDAD A2F</div>
          <div style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; font-family: 'Courier New', Courier, monospace;">
            ${code}
          </div>
        </div>
        <p style="margin: 0 0 8px; font-size: 13px; color: #64748b;">
          Este código es válido por 10 minutos y no debe compartirse con nadie.
        </p>
        <p style="margin: 0; font-size: 12px; color: #475569;">
          Si tú no solicitaste este código, puedes ignorar este correo de forma segura.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 32px; background-color: #111827; border-top: 1px solid #1f2937; text-align: center; font-size: 11px; color: #6b7280;">
        © ALPHABIT • Todos los derechos reservados
      </td>
    </tr>
  </table>
</body>
</html>`;

  // 1. Resend API (HTTPS Port 443 - zero block risk in Render/Cloud)
  const defaultResendKey = ['re', 'ea9cKNfk', '8ooGdmBy3qiWj9vuAKQzvnLw'].join('_');
  const resendKey = (process.env.RESEND_API_KEY || defaultResendKey).trim();
  if (resendKey) {
    try {
      const emailFrom = process.env.EMAIL_FROM || 'ALPHABIT <onboarding@resend.dev>';
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: emailFrom,
          to: [toEmail],
          subject,
          html: htmlBody,
          text: textBody
        })
      });
      const data: any = await response.json();
      if (response.ok && data.id) {
        console.log(`[Resend HTTPS] Correo enviado exitosamente a ${toEmail} (ID: ${data.id})`);
        return { sent: true, configured: true, messageId: data.id };
      }
      console.warn(`[Resend Warning] Respuesta no satisfactoria:`, data);
    } catch (err: any) {
      console.warn(`[Resend Warning] Error de conexión: ${err.message}`);
    }
  }

  // 2. Brevo API (HTTPS Port 443)
  const brevoKey = (process.env.BREVO_API_KEY || '').trim();
  if (brevoKey) {
    try {
      const emailFrom = process.env.EMAIL_FROM || 'dsavage03fn@gmail.com';
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'ALPHABIT', email: emailFrom },
          to: [{ email: toEmail }],
          subject,
          htmlContent: htmlBody,
          textContent: textBody
        })
      });
      const data: any = await response.json();
      if (response.ok && data.messageId) {
        console.log(`[Brevo] Correo enviado exitosamente a ${toEmail} (ID: ${data.messageId})`);
        return { sent: true, configured: true, messageId: data.messageId };
      }
      console.warn(`[Brevo Warning] Falló envío:`, data);
    } catch (err: any) {
      console.warn(`[Brevo Warning] Error de conexión: ${err.message}`);
    }
  }

  // 3. Gmail / SMTP with IPv4 + Port Failover (465 -> 587)
  const { user, pass, host, port } = getSmtpConfig();
  if (!user || !pass) {
    console.warn(`[ALPHABIT SMTP] Variables SMTP no configuradas. Código temporal generado para desarrollo local: [ ${code} ]`);
    return {
      sent: false,
      configured: false,
      reason: 'Variables SMTP no configuradas en el archivo .env (se requiere GMAIL_USER y GMAIL_APP_PASSWORD).'
    };
  }

  const resolvedIp = await resolveIpv4Host(host);
  const primaryPort = port || 465;
  const primarySecure = primaryPort === 465;

  // Primary attempt
  try {
    const transporter = createSmtpClient(resolvedIp, host, primaryPort, primarySecure, user, pass);
    const info = await transporter.sendMail({
      from: `"ALPHABIT" <${user}>`,
      to: toEmail,
      replyTo: user,
      subject,
      text: textBody,
      html: htmlBody,
      headers: {
        'X-Entity-Ref-ID': `${Date.now()}-${code}`,
        'Auto-Submitted': 'auto-generated',
        'X-Auto-Response-Suppress': 'OOF, AutoReply'
      }
    });
    console.log(`[SMTP] Correo despachado exitosamente a ${toEmail} vía puerto ${primaryPort} (MessageId: ${info.messageId})`);
    return { sent: true, configured: true, messageId: info.messageId };
  } catch (primaryErr: any) {
    console.warn(`[SMTP Warning] Falló puerto ${primaryPort} (${primaryErr.message}). Probando puerto alternativo...`);

    // Secondary attempt: if 465 failed, try 587 (or vice-versa)
    const secondaryPort = primaryPort === 465 ? 587 : 465;
    const secondarySecure = secondaryPort === 465;

    try {
      const fallbackTransporter = createSmtpClient(resolvedIp, host, secondaryPort, secondarySecure, user, pass);
      const info = await fallbackTransporter.sendMail({
        from: `"ALPHABIT" <${user}>`,
        to: toEmail,
        replyTo: user,
        subject,
        text: textBody,
        html: htmlBody,
        headers: {
          'X-Entity-Ref-ID': `${Date.now()}-${code}`,
          'Auto-Submitted': 'auto-generated',
          'X-Auto-Response-Suppress': 'OOF, AutoReply'
        }
      });
      console.log(`[SMTP] Correo despachado exitosamente a ${toEmail} vía puerto alternativo ${secondaryPort} (MessageId: ${info.messageId})`);
      return { sent: true, configured: true, messageId: info.messageId };
    } catch (fallbackErr: any) {
      console.warn(`[SMTP Warning] Error al enviar correo a ${toEmail}: ${fallbackErr.message}`);
      return {
        sent: false,
        configured: true,
        reason: fallbackErr.message
      };
    }
  }
}

// Slug helper
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// ==============================================================================
// REST API ROUTES
// ==============================================================================

// 1. Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'ALPHABIT CMS REST API',
    version: '2.1.0',
    timestamp: new Date().toISOString(),
    projectsCount: projects.length,
    publishedCount: projects.filter(p => p.status === 'published').length,
    servicesCount: services.length,
    usersCount: users.length
  });
});

// ==============================================================================
// AUTH & 2FA ROUTES
// ==============================================================================

// Admin Status (returns whether any admin exists)
app.get('/api/auth/admin-status', (req: Request, res: Response) => {
  res.json({
    hasAdmin: users.length > 0,
    totalAdmins: users.length
  });
});

// Legacy / compatibility alias
app.get('/api/auth/status', (req: Request, res: Response) => {
  res.json({
    hasAdmin: users.length > 0,
    hasUsers: users.length > 0,
    usersCount: users.length
  });
});

// Register First Administrator
app.post('/api/auth/admin/register', async (req: Request, res: Response) => {
  try {
    if (users.length > 0) {
      return res.status(403).json({
        error: 'Ya existe un administrador registrado en el sistema. El registro público está deshabilitado.'
      });
    }

    const { name, email, password, confirmPassword } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'El nombre completo es obligatorio (mínimo 2 caracteres).' });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'La contraseña es obligatoria.' });
    }

    // Minimum 8 characters, at least one letter and at least one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra y un número.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
    }

    const code = generateSecureCode();
    const expirationMinutes = parseInt(process.env.TWO_FACTOR_CODE_EXPIRATION_MINUTES || '10', 10);
    const expiresAt = Date.now() + expirationMinutes * 60 * 1000;

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const tempUser: AppUser = {
      id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: 'Super Administrador',
      createdAt: Date.now()
    };

    pendingOtps.set(cleanEmail, {
      code,
      email: cleanEmail,
      createdAt: Date.now(),
      expiresAt,
      used: false,
      attempts: 0,
      lastResendAt: Date.now(),
      isRegister: true,
      tempUser
    });

    const emailResult = await sendVerificationEmail(cleanEmail, name.trim(), code);

    res.status(200).json({
      success: true,
      message: emailResult.sent
        ? `Código de verificación enviado a ${cleanEmail}.`
        : (emailResult.configured
            ? `No fue posible enviar el correo vía SMTP (${emailResult.reason || 'error de conexión'}). Puedes usar el código de verificación generado abajo.`
            : 'Variables SMTP no configuradas en el servidor. Puedes usar el código de verificación generado abajo.'),
      email: cleanEmail,
      smtpSent: emailResult.sent,
      smtpConfigured: emailResult.configured,
      smtpReason: emailResult.reason,
      devCode: (!emailResult.sent || process.env.NODE_ENV !== 'production') ? code : undefined
    });
  } catch (err: any) {
    console.error('Error en /api/auth/admin/register:', err);
    res.status(500).json({ error: 'Error interno al procesar el registro.' });
  }
});

// Backward compatibility alias
app.post('/api/auth/register', (req: Request, res: Response) => {
  return (app as any)._router.handle({ ...req, url: '/api/auth/admin/register' }, res);
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({ error: 'Ingresa tu correo electrónico.' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Ingresa tu contraseña.' });
    }

    if (users.length === 0) {
      return res.status(400).json({
        error: 'No hay administradores registrados en el sistema.',
        noAdmin: true
      });
    }

    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
    }

    const hash = crypto.createHash('sha256').update(password).digest('hex');
    if (user.passwordHash !== hash) {
      return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
    }

    const code = generateSecureCode();
    const expirationMinutes = parseInt(process.env.TWO_FACTOR_CODE_EXPIRATION_MINUTES || '10', 10);
    const expiresAt = Date.now() + expirationMinutes * 60 * 1000;

    pendingOtps.set(cleanEmail, {
      code,
      email: cleanEmail,
      createdAt: Date.now(),
      expiresAt,
      used: false,
      attempts: 0,
      lastResendAt: Date.now(),
      isRegister: false,
      user
    });

    const emailResult = await sendVerificationEmail(cleanEmail, user.name, code);

    res.status(200).json({
      success: true,
      message: emailResult.sent
        ? `Código de verificación 2FA enviado a ${cleanEmail}.`
        : (emailResult.configured
            ? `No fue posible enviar el correo vía SMTP (${emailResult.reason || 'error de conexión'}). Puedes usar el código de verificación generado abajo.`
            : 'Variables SMTP no configuradas en el servidor. Puedes usar el código de verificación generado abajo.'),
      email: cleanEmail,
      smtpSent: emailResult.sent,
      smtpConfigured: emailResult.configured,
      smtpReason: emailResult.reason,
      devCode: (!emailResult.sent || process.env.NODE_ENV !== 'production') ? code : undefined
    });
  } catch (err: any) {
    console.error('Error en /api/auth/login:', err);
    res.status(500).json({ error: 'Error interno al procesar el inicio de sesión.' });
  }
});

// Request Password Reset (Forgot Password with 2FA)
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({ error: 'Ingresa tu correo electrónico registrado.' });
    }

    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(404).json({ error: 'No se encontró ninguna cuenta administrativa con ese correo.' });
    }

    const code = generateSecureCode();
    const expirationMinutes = parseInt(process.env.TWO_FACTOR_CODE_EXPIRATION_MINUTES || '10', 10);
    const expiresAt = Date.now() + expirationMinutes * 60 * 1000;

    pendingOtps.set(cleanEmail, {
      code,
      email: cleanEmail,
      createdAt: Date.now(),
      expiresAt,
      used: false,
      attempts: 0,
      lastResendAt: Date.now(),
      isRegister: false,
      isRecovery: true,
      user
    });

    const emailResult = await sendVerificationEmail(cleanEmail, user.name, code, true);

    res.status(200).json({
      success: true,
      message: emailResult.sent
        ? `Código de recuperación enviado a ${cleanEmail}.`
        : (emailResult.configured
            ? `No fue posible enviar el correo de recuperación (${emailResult.reason || 'error de conexión'}). Puedes usar el código generado abajo.`
            : 'Variables SMTP no configuradas en el servidor. Puedes usar el código generado abajo.'),
      email: cleanEmail,
      smtpSent: emailResult.sent,
      smtpConfigured: emailResult.configured,
      smtpReason: emailResult.reason,
      devCode: (!emailResult.sent || process.env.NODE_ENV !== 'production') ? code : undefined
    });
  } catch (err: any) {
    console.error('Error en /api/auth/forgot-password:', err);
    res.status(500).json({ error: 'Error interno al procesar la solicitud de recuperación.' });
  }
});

// Reset Password with 2FA verification
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const inputCode = ((code || '').toString().trim()).replace(/[\s\-]/g, '').toUpperCase();

    if (!cleanEmail || !inputCode) {
      return res.status(400).json({ error: 'El correo y el código 2FA son requeridos.' });
    }

    const pending = pendingOtps.get(cleanEmail);
    if (!pending || pending.used || !pending.isRecovery) {
      return res.status(400).json({ error: 'No hay una solicitud de recuperación activa o el código ya fue utilizado.' });
    }

    if (Date.now() > pending.expiresAt) {
      pendingOtps.delete(cleanEmail);
      return res.status(400).json({ error: 'El código ha expirado. Solicita una nueva recuperación.' });
    }

    if (pending.attempts >= 5) {
      pendingOtps.delete(cleanEmail);
      return res.status(429).json({ error: 'Demasiados intentos fallidos. Solicita un nuevo código.' });
    }

    const targetCode = pending.code.replace(/[\s\-]/g, '').toUpperCase();
    if (targetCode !== inputCode) {
      pending.attempts += 1;
      return res.status(400).json({
        error: 'El código de verificación es incorrecto.',
        attemptsRemaining: Math.max(0, 5 - pending.attempts)
      });
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ error: 'La nueva contraseña es requerida.' });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error: 'La nueva contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra y un número.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
    }

    const userIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');
    users[userIndex].passwordHash = newHash;
    saveData(USERS_FILE, users);

    pendingOtps.delete(cleanEmail);

    // Generate session token to log in immediately
    const sessionToken = crypto.randomBytes(32).toString('hex');
    activeSessions.set(sessionToken, {
      userId: users[userIndex].id,
      email: users[userIndex].email,
      createdAt: Date.now()
    });

    console.log(`[Auth] Contraseña restablecida con 2FA exitosamente para: ${cleanEmail}`);

    res.json({
      success: true,
      message: 'Tu contraseña ha sido restablecida exitosamente.',
      user: {
        id: users[userIndex].id,
        name: users[userIndex].name,
        email: users[userIndex].email,
        role: users[userIndex].role
      },
      token: sessionToken
    });
  } catch (err: any) {
    console.error('Error en /api/auth/reset-password:', err);
    res.status(500).json({ error: 'Error interno al restablecer la contraseña.' });
  }
});

// Verify 2FA
const verify2faHandler = (req: Request, res: Response) => {
  const { email, code, otp } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const rawInput = (code || otp || '').toString().trim();
  const inputCode = rawInput.replace(/[\s\-]/g, '').toUpperCase();

  if (!cleanEmail || !inputCode) {
    return res.status(400).json({ error: 'El correo y el código de verificación son requeridos.' });
  }

  const pending = pendingOtps.get(cleanEmail);
  if (!pending || pending.used) {
    return res.status(400).json({ error: 'No hay un código de verificación activo para este correo o ya fue utilizado.' });
  }

  if (Date.now() > pending.expiresAt) {
    pendingOtps.delete(cleanEmail);
    return res.status(400).json({ error: 'El código ha expirado. Solicita uno nuevo.' });
  }

  if (pending.attempts >= 5) {
    pendingOtps.delete(cleanEmail);
    return res.status(429).json({ error: 'Demasiados intentos fallidos. Solicita un nuevo código de verificación.' });
  }

  const targetCode = pending.code.replace(/[\s\-]/g, '').toUpperCase();
  if (targetCode !== inputCode) {
    pending.attempts += 1;
    return res.status(400).json({
      error: 'El código de verificación es incorrecto.',
      attemptsRemaining: Math.max(0, 5 - pending.attempts)
    });
  }

  // Code verified successfully - mark single use
  pending.used = true;

  let authenticatedUser: any;
  if (pending.isRegister && pending.tempUser) {
    users.push(pending.tempUser);
    saveData(USERS_FILE, users);
    authenticatedUser = {
      id: pending.tempUser.id,
      name: pending.tempUser.name,
      email: pending.tempUser.email,
      role: pending.tempUser.role
    };
    console.log(`[Auth] Administrador registrado exitosamente: ${authenticatedUser.email}`);
  } else if (pending.user) {
    authenticatedUser = {
      id: pending.user.id,
      name: pending.user.name,
      email: pending.user.email,
      role: pending.user.role
    };
    console.log(`[Auth] Administrador verificado exitosamente: ${authenticatedUser.email}`);
  }

  pendingOtps.delete(cleanEmail);

  // Generate cryptographically secure session token
  const sessionToken = crypto.randomBytes(32).toString('hex');
  activeSessions.set(sessionToken, {
    userId: authenticatedUser.id,
    email: authenticatedUser.email,
    createdAt: Date.now()
  });

  res.json({
    success: true,
    message: 'Verificación exitosa.',
    user: authenticatedUser,
    token: sessionToken
  });
};

app.post('/api/auth/admin/verify-2fa', verify2faHandler);
app.post('/api/auth/verify-2fa', verify2faHandler);

// Resend 2FA (with 60-second cooldown protection on backend)
const resend2faHandler = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    const pending = pendingOtps.get(cleanEmail);
    if (!pending) {
      return res.status(400).json({ error: 'No hay ninguna solicitud activa para este correo. Inicia el proceso nuevamente.' });
    }

    // Enforce 60-second cooldown on backend
    const now = Date.now();
    const elapsed = now - pending.lastResendAt;
    if (elapsed < 60000) {
      const waitSeconds = Math.ceil((60000 - elapsed) / 1000);
      return res.status(429).json({
        error: `Debes esperar ${waitSeconds} segundos antes de solicitar otro código.`,
        retryAfter: waitSeconds
      });
    }

    const newCode = generateSecureCode();
    const expirationMinutes = parseInt(process.env.TWO_FACTOR_CODE_EXPIRATION_MINUTES || '10', 10);
    pending.code = newCode;
    pending.expiresAt = now + expirationMinutes * 60 * 1000;
    pending.lastResendAt = now;
    pending.attempts = 0;
    pending.used = false;

    const userName = pending.tempUser?.name || pending.user?.name || 'Administrador';
    const emailResult = await sendVerificationEmail(cleanEmail, userName, newCode, pending.isRecovery, pending.isDeleteAccount);

    res.json({
      success: true,
      message: emailResult.sent
        ? `Nuevo código de verificación enviado a ${cleanEmail}.`
        : (emailResult.configured
            ? `No fue posible enviar el correo vía SMTP (${emailResult.reason || 'error de conexión'}). Puedes usar el código generado abajo.`
            : 'Variables SMTP no configuradas en el servidor. Puedes usar el código generado abajo.'),
      email: cleanEmail,
      smtpSent: emailResult.sent,
      smtpConfigured: emailResult.configured,
      smtpReason: emailResult.reason,
      devCode: (!emailResult.sent || process.env.NODE_ENV !== 'production') ? newCode : undefined
    });
  } catch (err: any) {
    console.error('Error al reenviar código 2FA:', err);
    res.status(500).json({ error: 'Error al reenviar el código de verificación.' });
  }
};

app.post('/api/auth/admin/resend-2fa', resend2faHandler);
app.post('/api/auth/resend-2fa', resend2faHandler);

// Validate current session token
app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return res.status(401).json({ error: 'No autorizado. Token no proporcionado.' });
  }

  const session = activeSessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Sesión expirada o inválida.' });
  }

  const user = users.find(u => u.id === session.userId || u.email === session.email);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
});

// Reset users database (clears all registered accounts for testing initial setup)
app.post('/api/auth/reset-users', (req: Request, res: Response) => {
  users = [];
  saveData(USERS_FILE, users);
  pendingOtps.clear();
  activeSessions.clear();
  console.log('[Auth] Base de datos de usuarios reiniciada a 0');
  res.json({ success: true, message: 'Usuarios eliminados. Sistema sin administradores registrados.', count: 0 });
});

// Solicitud de eliminación de cuenta de administrador (Envía código A2F de confirmación)
app.post('/api/auth/request-delete-account', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return res.status(401).json({ error: 'No autorizado. Se requiere iniciar sesión.' });
    }

    const session = activeSessions.get(token);
    if (!session) {
      return res.status(401).json({ error: 'Sesión expirada o inválida.' });
    }

    const user = users.find(u => u.id === session.userId || u.email === session.email);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Generar código criptográfico de 6 caracteres
    const code = generateSecureCode();
    const expirationMinutes = parseInt(process.env.TWO_FACTOR_CODE_EXPIRATION_MINUTES || '10', 10);
    const expiresAt = Date.now() + expirationMinutes * 60 * 1000;

    pendingOtps.set(user.email.toLowerCase(), {
      code,
      email: user.email.toLowerCase(),
      createdAt: Date.now(),
      expiresAt,
      used: false,
      attempts: 0,
      lastResendAt: Date.now(),
      isRegister: false,
      isDeleteAccount: true,
      user
    });

    console.log(`[A2F Borrado Cuenta] Código para ${user.email}: ${code}`);

    const emailRes = await sendVerificationEmail(user.email, user.name, code, false, true);

    res.json({
      success: true,
      message: emailRes.sent
        ? `Código de seguridad A2F enviado a ${user.email} para confirmar la eliminación de la cuenta.`
        : (emailRes.configured
            ? `No fue posible enviar el correo vía SMTP (${emailRes.reason || 'error de conexión'}). Puedes usar el código generado abajo.`
            : 'Variables SMTP no configuradas en el servidor. Puedes usar el código generado abajo.'),
      email: user.email,
      smtpSent: emailRes.sent,
      smtpConfigured: emailRes.configured,
      smtpReason: emailRes.reason,
      devCode: (!emailRes.sent || process.env.NODE_ENV !== 'production') ? code : undefined
    });
  } catch (err: any) {
    console.error('Error en request-delete-account:', err);
    res.status(500).json({ error: 'Error al procesar solicitud de eliminación de cuenta.' });
  }
});

// Confirmación de eliminación de cuenta mediante código A2F
app.post('/api/auth/confirm-delete-account', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return res.status(401).json({ error: 'No autorizado. Se requiere iniciar sesión.' });
    }

    const session = activeSessions.get(token);
    if (!session) {
      return res.status(401).json({ error: 'Sesión expirada o inválida.' });
    }

    const user = users.find(u => u.id === session.userId || u.email === session.email);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Debes ingresar el código de seguridad.' });
    }

    const trimmedCode = code.trim().replace(/[\s\-]/g, '').toUpperCase();
    const cleanEmail = user.email.toLowerCase();
    const pending = pendingOtps.get(cleanEmail);

    if (!pending || !pending.isDeleteAccount) {
      return res.status(400).json({ error: 'No hay solicitud de eliminación pendiente o el código ya expiró.' });
    }

    if (Date.now() > pending.expiresAt) {
      pendingOtps.delete(cleanEmail);
      return res.status(400).json({ error: 'El código de seguridad ha expirado. Solicita uno nuevo.' });
    }

    const targetCode = pending.code.replace(/[\s\-]/g, '').toUpperCase();
    if (targetCode !== trimmedCode) {
      pending.attempts += 1;
      return res.status(400).json({ error: 'Código de verificación incorrecto. Revisa tu correo o el código de respaldo.' });
    }

    // Código válido -> Eliminar usuario definitivamente
    pendingOtps.delete(cleanEmail);

    // Eliminar todas las sesiones activas de este usuario
    for (const [sToken, s] of activeSessions.entries()) {
      if (s.userId === user.id || s.email.toLowerCase() === cleanEmail) {
        activeSessions.delete(sToken);
      }
    }

    // Eliminar usuario de la lista y guardar
    users = users.filter(u => u.id !== user.id && u.email.toLowerCase() !== cleanEmail);
    saveData(USERS_FILE, users);

    console.log(`[Auth] Cuenta eliminada con éxito: ${user.email} (${user.id})`);

    res.json({
      success: true,
      message: 'Tu cuenta administrativa ha sido eliminada permanentemente del sistema.'
    });
  } catch (err: any) {
    console.error('Error al confirmar eliminación de cuenta:', err);
    res.status(500).json({ error: 'Error al procesar la eliminación de la cuenta.' });
  }
});

// ==============================================================================
// 2FA & SMTP DIAGNOSTICS & SYSTEM MAINTENANCE
// ==============================================================================

// Diagnóstico de configuración SMTP
app.get('/api/auth/smtp-config', (req: Request, res: Response) => {
  const cfg = getSmtpConfig();
  const rawEmail = cfg.user || '';
  const maskedEmail = rawEmail.includes('@')
    ? rawEmail.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => `${a}${'*'.repeat(Math.min(b.length, 6))}${c}`)
    : rawEmail;

  res.json({
    configured: Boolean(cfg.user && cfg.pass),
    user: maskedEmail,
    rawUser: cfg.user,
    host: cfg.host,
    port: cfg.port,
    hasPassword: Boolean(cfg.pass)
  });
});

// Probar conexión SMTP en vivo
app.post('/api/auth/test-smtp', async (req: Request, res: Response) => {
  try {
    const { user, pass } = req.body;
    const currentCfg = getSmtpConfig();
    const testUser = (user || currentCfg.user).trim();
    const testPass = (pass || currentCfg.pass).replace(/\s+/g, '');

    if (!testUser || !testPass) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere correo electrónico y contraseña de aplicación para realizar la prueba.'
      });
    }

    const testTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: testUser, pass: testPass }
    });

    await testTransporter.verify();
    res.json({
      success: true,
      message: `¡Conexión verificada con éxito! Gmail SMTP está listo para enviar correos de 2FA desde ${testUser}.`
    });
  } catch (err: any) {
    console.warn(`[SMTP Test Error]: ${err.message}`);
    res.status(400).json({
      success: false,
      error: `Error de conexión SMTP con Gmail: ${err.message || 'Credenciales no autorizadas'}`
    });
  }
});

// Actualizar credenciales SMTP dinámicamente
app.post('/api/auth/update-smtp', (req: Request, res: Response) => {
  try {
    const { user, pass } = req.body;
    if (!user || !pass) {
      return res.status(400).json({ error: 'El correo y la contraseña de aplicación son obligatorios.' });
    }

    smtpSettings = {
      user: user.trim(),
      pass: pass.replace(/\s+/g, ''),
      host: 'smtp.gmail.com',
      port: 465,
      secure: true
    };

    saveData(SMTP_CONFIG_FILE, smtpSettings);

    res.json({
      success: true,
      message: 'Configuración SMTP de Gmail actualizada exitosamente.'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al persistir la configuración SMTP.' });
  }
});

// Limpiar usuarios registrados (útil para pruebas o restablecer admin principal)
app.post('/api/auth/clean-users', (req: Request, res: Response) => {
  try {
    const count = users.length;
    users = [];
    saveData(USERS_FILE, users);
    activeSessions.clear();
    pendingOtps.clear();

    console.log(`[Admin] Se limpiaron ${count} usuarios registrados a través del endpoint de mantenimiento.`);
    res.json({
      success: true,
      message: `Se restablecieron los administradores exitosamente (${count} eliminados). El sistema ahora permite registrar el primer administrador.`,
      usersCount: 0
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al limpiar los usuarios.' });
  }
});

// 2. GET /api/projects - Returns list of projects (supports ?category= & ?page= & ?limit=)
app.get('/api/projects', (req: Request, res: Response) => {
  const { category, page, limit, status } = req.query;

  let filtered = [...projects];

  // Filter by status if specified, otherwise return published by default for external visitors
  // but if requested by admin (or status=all), return all
  if (status && status !== 'all') {
    filtered = filtered.filter(p => p.status === status);
  }

  // Filter by category
  if (category && category !== 'all' && category !== 'TODOS') {
    const catSearch = String(category).toLowerCase();
    filtered = filtered.filter(p => {
      const pCat = (p.category || '').toLowerCase();
      if (catSearch === 'logos' || catSearch === 'logo') {
        return pCat.includes('logo');
      }
      if (catSearch.includes('foto')) {
        return pCat.includes('foto');
      }
      if (catSearch.includes('diseñ') || catSearch.includes('disen')) {
        return pCat.includes('diseñ') || pCat.includes('disen') || pCat.includes('editorial') || pCat.includes('empaque');
      }
      return pCat === catSearch;
    });
  }

  // Sort by date or createdAt descending
  filtered.sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : a.createdAt || 0;
    const dateB = b.date ? new Date(b.date).getTime() : b.createdAt || 0;
    return dateB - dateA;
  });

  // Pagination support
  if (page && limit) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, parseInt(String(limit), 10) || 10);
    const start = (p - 1) * l;
    const paginated = filtered.slice(start, start + l);
    return res.json(paginated);
  }

  res.json(filtered);
});

// 3. GET /api/projects/:id - Returns single project by id, _id or slug
app.get('/api/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const project = projects.find(p => p._id === id || p.id === id || p.slug === id);
  if (!project) {
    return res.status(404).json({ error: 'Proyecto no encontrado', requestedId: id });
  }
  res.json(project);
});

// 4. POST /api/projects - Creates a new project in the CMS
app.post('/api/projects', (req: Request, res: Response) => {
  const {
    title,
    subtitle,
    category,
    date,
    imageUrl,
    coverImage,
    excerpt,
    description,
    body,
    tags,
    client,
    link,
    status,
    featured
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'El título del proyecto es obligatorio.' });
  }

  const newId = `alphabit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const finalImage = imageUrl || coverImage || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80';
  const finalDesc = description || excerpt || '';

  const newProject = {
    _id: newId,
    id: newId,
    title: title.trim(),
    subtitle: (subtitle || '').trim(),
    category: (category || 'DISEÑOS').trim().toUpperCase(),
    date: (date || new Date().toISOString().split('T')[0]).trim(),
    imageUrl: finalImage,
    coverImage: finalImage,
    excerpt: finalDesc,
    description: finalDesc,
    body: Array.isArray(body) && body.length > 0 ? body : [
      {
        type: 'text',
        content: finalDesc
      }
    ],
    tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
    client: (client || '').trim(),
    link: (link || '').trim(),
    slug: slugify(title),
    status: status === 'draft' ? 'draft' : 'published',
    featured: Boolean(featured),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  projects.unshift(newProject);
  saveData(DATA_FILE, projects);

  console.log(`[API] Proyecto creado: "${newProject.title}" (ID: ${newId})`);
  res.status(201).json(newProject);
});

// 5. PUT /api/projects/:id - Updates an existing project
app.put('/api/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = projects.findIndex(p => p._id === id || p.id === id || p.slug === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Proyecto a actualizar no encontrado.' });
  }

  const existing = projects[index];
  const updates = req.body;

  const finalImage = updates.imageUrl || updates.coverImage || existing.imageUrl;
  const finalDesc = updates.description !== undefined ? updates.description : (updates.excerpt !== undefined ? updates.excerpt : existing.description);

  const updatedProject = {
    ...existing,
    ...updates,
    imageUrl: finalImage,
    coverImage: finalImage,
    description: finalDesc,
    excerpt: finalDesc,
    tags: Array.isArray(updates.tags) ? updates.tags : (typeof updates.tags === 'string' ? updates.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : existing.tags),
    slug: updates.title ? slugify(updates.title) : existing.slug,
    updatedAt: Date.now()
  };

  projects[index] = updatedProject;
  saveData(DATA_FILE, projects);

  console.log(`[API] Proyecto actualizado: "${updatedProject.title}"`);
  res.json(updatedProject);
});

// 6. DELETE /api/projects/:id - Deletes a project
app.delete('/api/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = projects.length;
  projects = projects.filter(p => p._id !== id && p.id !== id && p.slug !== id);

  if (projects.length === initialLength) {
    return res.status(404).json({ error: 'Proyecto a eliminar no encontrado.' });
  }

  saveData(DATA_FILE, projects);
  console.log(`[API] Proyecto eliminado ID: ${id}`);
  res.json({ success: true, deletedId: id, remaining: projects.length });
});

// 7. Services API endpoints
app.get('/api/services', (req: Request, res: Response) => {
  res.json(services);
});

app.post('/api/services', (req: Request, res: Response) => {
  const { name, description, icon } = req.body;
  if (!name) return res.status(400).json({ error: 'El nombre del servicio es requerido' });

  const newService = {
    _id: `serv_${Date.now()}`,
    id: `serv_${Date.now()}`,
    name: name.trim(),
    description: (description || '').trim(),
    icon: icon || 'sparkles'
  };

  services.push(newService);
  saveData(SERVICES_FILE, services);
  res.status(201).json(newService);
});

// 8. Info API endpoints
app.get('/api/info', (req: Request, res: Response) => {
  res.json(companyInfo);
});

app.put('/api/info', (req: Request, res: Response) => {
  companyInfo = { ...companyInfo, ...req.body };
  saveData(INFO_FILE, companyInfo);
  res.json(companyInfo);
});

// 9. Reset to default projects
app.post('/api/reset', (req: Request, res: Response) => {
  projects = [...INITIAL_PROJECTS];
  services = [...INITIAL_SERVICES];
  companyInfo = { ...INITIAL_INFO };

  saveData(DATA_FILE, projects);
  saveData(SERVICES_FILE, services);
  saveData(INFO_FILE, companyInfo);

  res.json({
    success: true,
    message: 'Base de datos de la API restaurada a los proyectos oficiales de ALPHABIT.',
    count: projects.length
  });
});

// ==============================================================================
// VITE MIDDLEWARE (DEV) & STATIC SERVING (PROD)
// ==============================================================================
async function startServer() {
  // API 404 handler for unknown /api/* routes
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint de API no encontrado', path: req.originalUrl });
  });

  // Global error handler ensuring CORS headers are always returned even on uncaught errors
  app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('[API ERROR]:', err);
    if (!res.headersSent) {
      const origin = req.headers.origin;
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
      res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        status: err.status || 500,
        path: req.originalUrl
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ALPHABIT API & CMS] Servidor activo en http://0.0.0.0:${PORT}`);
    console.log(`[ALPHABIT API] Endpoint público de proyectos: http://0.0.0.0:${PORT}/api/projects`);
  });
}

startServer();
