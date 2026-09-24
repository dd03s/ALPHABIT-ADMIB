var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(import_express.default.json({ limit: "25mb" }));
app.use(import_express.default.urlencoded({ limit: "25mb", extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var DATA_FILE = import_path.default.join(DATA_DIR, "projects.json");
var SERVICES_FILE = import_path.default.join(DATA_DIR, "services.json");
var INFO_FILE = import_path.default.join(DATA_DIR, "info.json");
var USERS_FILE = import_path.default.join(DATA_DIR, "users.json");
if (!import_fs.default.existsSync(DATA_DIR)) {
  import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
}
var INITIAL_PROJECTS = [
  {
    _id: "65f02a01c4e9123456789101",
    id: "65f02a01c4e9123456789101",
    title: "Dermalaser \u2013 Redise\xF1o de Logo \u2013 Ejercicio Creativo #002",
    subtitle: "Ejercicio Creativo #002",
    category: "LOGOS",
    tags: ["Dise\xF1o Gr\xE1fico", "L\xEDnea Gr\xE1fica", "Logo", "Redise\xF1o"],
    date: "2026-09-11",
    coverImage: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80",
    imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80",
    excerpt: "Redise\xF1o de identidad visual para Cl\xEDnica Dermalaser, llevando el logo anterior a un nuevo nivel de limpieza, orden y compatibilidad con medios digitales.",
    description: "Redise\xF1o de identidad visual para Cl\xEDnica Dermalaser, llevando el logo anterior a un nuevo nivel de limpieza, orden y compatibilidad con medios digitales.",
    body: [
      {
        type: "text",
        content: "Como parte de nuestros ejercicios creativos de septiembre, abordamos el redise\xF1o de marca para Cl\xEDnica Dermalaser. El objetivo principal fue depurar los trazos del isotipo original, logrando una s\xEDntesis geom\xE9trica que proyecta precisi\xF3n m\xE9dica y calidez est\xE9tica."
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1400&q=80",
        caption: "Construcci\xF3n geom\xE9trica y ret\xEDcula del nuevo isotipo Dermalaser"
      }
    ],
    slug: "dermalaser-rediseno-logo-002",
    status: "published",
    featured: true,
    client: "Cl\xEDnica Dermalaser",
    link: "https://alphabit.sv/casos/dermalaser",
    createdAt: 1726056e6,
    updatedAt: 1726056e6
  },
  {
    _id: "65f02a01c4e9123456789102",
    id: "65f02a01c4e9123456789102",
    title: "Historiales Liceo Cristiano \xABRev. Juan Bueno\xBB \u2013 Dise\xF1o Gr\xE1fico y Fotograf\xEDa",
    subtitle: "Dise\xF1o Gr\xE1fico y Fotograf\xEDa Institucional",
    category: "DISE\xD1OS",
    tags: ["Dise\xF1o Gr\xE1fico", "Fotograf\xEDa", "Identidad", "Editorial"],
    date: "2026-09-02",
    coverImage: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80",
    imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80",
    excerpt: "Desarrollo gr\xE1fico y cobertura fotogr\xE1fica institucional para el sistema educativo Liceo Cristiano.",
    description: "Desarrollo gr\xE1fico y cobertura fotogr\xE1fica institucional para el sistema educativo Liceo Cristiano.",
    body: [
      {
        type: "text",
        content: "Producci\xF3n de piezas gr\xE1ficas y cobertura fotogr\xE1fica de alta resoluci\xF3n documentando la trayectoria educativa del Liceo Cristiano Reverendo Juan Bueno."
      }
    ],
    slug: "historiales-liceo-cristiano-juan-bueno",
    status: "published",
    featured: false,
    client: "Liceo Cristiano Rev. Juan Bueno",
    link: "",
    createdAt: 17252784e5,
    updatedAt: 17252784e5
  },
  {
    _id: "65f02a01c4e9123456789103",
    id: "65f02a01c4e9123456789103",
    title: "Memoria de Labores ACONAC 2021 \u2013 Dise\xF1o Editorial \u2013 El Salvador",
    subtitle: "Dise\xF1o Editorial Corporativo",
    category: "DISE\xD1OS",
    tags: ["Dise\xF1o Editorial", "Publicaci\xF3n", "Diagramaci\xF3n", "Infograf\xEDas"],
    date: "2026-07-29",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80",
    excerpt: "Dise\xF1o y maquetaci\xF3n de memoria anual corporativa con infograf\xEDas y balance financiero.",
    description: "Dise\xF1o y maquetaci\xF3n de memoria anual corporativa con infograf\xEDas y balance financiero.",
    body: [
      {
        type: "text",
        content: "Diagramaci\xF3n editorial de m\xE1s de 80 p\xE1ginas que integran gr\xE1ficos financieros, informes de impacto social y fotograf\xEDas institucionales en un formato elegante impreso y digital."
      }
    ],
    slug: "memoria-de-labores-aconac-2021",
    status: "published",
    featured: true,
    client: "ACONAC de R.L.",
    link: "",
    createdAt: 17222544e5,
    updatedAt: 17222544e5
  },
  {
    _id: "65f02a01c4e9123456789104",
    id: "65f02a01c4e9123456789104",
    title: "Casa V\xEDa del Mar \u2013 Fotograf\xEDa Inmobiliaria \u2013 El Salvador",
    subtitle: "Fotograf\xEDa de Arquitectura Contempor\xE1nea",
    category: "PROYECTOS FOTOGR\xC1FICOS",
    tags: ["Fotograf\xEDa", "Inmobiliaria", "Arquitectura", "Luz Natural"],
    date: "2026-07-03",
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    excerpt: "Sesi\xF3n fotogr\xE1fica de arquitectura contempor\xE1nea y espacios residenciales de lujo en V\xEDa del Mar.",
    description: "Sesi\xF3n fotogr\xE1fica de arquitectura contempor\xE1nea y espacios residenciales de lujo en V\xEDa del Mar.",
    body: [
      {
        type: "text",
        content: "Direcci\xF3n de fotograf\xEDa capturando la interacci\xF3n de la luz natural con el concreto arquitect\xF3nico, ventanales panor\xE1micos y vegetaci\xF3n tropical en una residencia privada."
      }
    ],
    slug: "casa-via-del-mar-fotografia-inmobiliaria",
    status: "published",
    featured: true,
    client: "Desarrollos Residenciales SV",
    link: "",
    createdAt: 1720008e6,
    updatedAt: 1720008e6
  },
  {
    _id: "65f02a01c4e9123456789105",
    id: "65f02a01c4e9123456789105",
    title: "Fresquito \u2013 Dise\xF1o de Empaque \u2013 Ejercicio Creativo",
    subtitle: "Packaging y Branding Artesanal",
    category: "DISE\xD1OS",
    tags: ["Empaque", "Packaging", "Identidad", "Tipograf\xEDa"],
    date: "2026-06-30",
    coverImage: "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=1200&q=80",
    imageUrl: "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=1200&q=80",
    excerpt: "Propuesta de branding y empaque para bebida artesanal con tipograf\xEDa personalizada y colores frescos.",
    description: "Propuesta de branding y empaque para bebida artesanal con tipograf\xEDa personalizada y colores frescos.",
    body: [
      {
        type: "text",
        content: "Concepto integral de empaque en vidrio reciclable con etiquetas minimalistas para una l\xEDnea de jugos y t\xF3nicos artesanales salvadore\xF1os."
      }
    ],
    slug: "fresquito-diseno-empaque-ejercicio-creativo",
    status: "published",
    featured: false,
    client: "Fresquito Artesanal",
    link: "",
    createdAt: 17197488e5,
    updatedAt: 17197488e5
  }
];
var INITIAL_SERVICES = [
  {
    _id: "65f01a01c4e9123456789001",
    id: "65f01a01c4e9123456789001",
    name: "Dise\xF1o Gr\xE1fico",
    description: "Identidad visual, l\xEDnea gr\xE1fica coherente, piezas publicitarias y sistemas visuales de alto impacto.",
    icon: "graphic-design"
  },
  {
    _id: "65f01a01c4e9123456789002",
    id: "65f01a01c4e9123456789002",
    name: "Fotograf\xEDa & Direcci\xF3n de Arte",
    description: "Producci\xF3n fotogr\xE1fica para productos, arquitectura corporativa, moda y sesiones editoriales.",
    icon: "camera"
  },
  {
    _id: "65f01a01c4e9123456789003",
    id: "65f01a01c4e9123456789003",
    name: "Dise\xF1o Editorial & Empaque",
    description: "Maquetaci\xF3n de libros, revistas, memorias de labores y packaging comercial con acabados premium.",
    icon: "book"
  }
];
var INITIAL_INFO = {
  name: "ALPHABIT",
  tagline: "Servicios Digitales",
  description: "Somos ALPHABIT, una agencia de servicios digitales en El Salvador. Transformamos ideas en experiencias visuales que comunican, conectan y perduran.",
  email: "contacto@alphabit.sv",
  location: "San Salvador, El Salvador",
  socialLinks: {
    instagram: "https://instagram.com/alphabit.sv",
    facebook: "https://facebook.com/alphabit.sv"
  },
  stats: [
    { value: "4+", label: "A\xF1os de experiencia" },
    { value: "+50", label: "Proyectos completados" },
    { value: "SV", label: "El Salvador" }
  ]
};
function loadData(file, defaults) {
  try {
    if (import_fs.default.existsSync(file)) {
      const raw = import_fs.default.readFileSync(file, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(`Error reading ${file}:`, e);
  }
  saveData(file, defaults);
  return defaults;
}
function saveData(file, data) {
  try {
    import_fs.default.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error(`Error writing ${file}:`, e);
  }
}
var projects = loadData(DATA_FILE, INITIAL_PROJECTS);
var services = loadData(SERVICES_FILE, INITIAL_SERVICES);
var companyInfo = loadData(INFO_FILE, INITIAL_INFO);
var users = loadData(USERS_FILE, []);
var activeSessions = /* @__PURE__ */ new Map();
var SMTP_CONFIG_FILE = import_path.default.join(DATA_DIR, "smtp-config.json");
var smtpSettings = loadData(SMTP_CONFIG_FILE, {
  user: process.env.GMAIL_USER || process.env.SMTP_USER || "20240035@ricaldone.edu.sv",
  pass: process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || "kyyf omoe ycmf hgrx",
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465", 10),
  secure: process.env.SMTP_SECURE !== "false"
});
var cachedTransporter = null;
function getSmtpConfig() {
  const envUser = (process.env.GMAIL_USER || process.env.SMTP_USER || "").trim();
  const envPass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || "").replace(/\s+/g, "");
  const user = envUser || (smtpSettings.user || "20240035@ricaldone.edu.sv").trim();
  const pass = envPass || (smtpSettings.pass || "kyyf omoe ycmf hgrx").replace(/\s+/g, "");
  const host = process.env.SMTP_HOST || smtpSettings.host || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || String(smtpSettings.port || 465), 10);
  const secure = smtpSettings.secure !== false;
  return { user, pass, host, port, secure };
}
function getTransporter() {
  const { user, pass, host, port, secure } = getSmtpConfig();
  if (!user || !pass) return null;
  if (cachedTransporter) return cachedTransporter;
  if (host.includes("gmail.com")) {
    cachedTransporter = import_nodemailer.default.createTransport({
      service: "gmail",
      auth: { user, pass },
      connectionTimeout: 5e3,
      greetingTimeout: 4e3,
      socketTimeout: 6e3
    });
  } else {
    cachedTransporter = import_nodemailer.default.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      connectionTimeout: 5e3,
      greetingTimeout: 4e3,
      socketTimeout: 6e3
    });
  }
  return cachedTransporter;
}
var pendingOtps = /* @__PURE__ */ new Map();
function generateSecureCode() {
  return import_crypto.default.randomInt(1e5, 1e6).toString();
}
async function sendVerificationEmail(toEmail, userName, code, isRecovery = false) {
  const { user } = getSmtpConfig();
  const transporter = getTransporter();
  console.log(`
======================================================`);
  console.log(`[ALPHABIT A2F / 2FA] C\xF3digo generado para ${toEmail}: [ ${code} ]`);
  console.log(`======================================================
`);
  if (!transporter || !user) {
    console.warn(`[ALPHABIT SMTP] Variables SMTP no configuradas. C\xF3digo temporal generado para desarrollo local: [ ${code} ]`);
    return {
      sent: false,
      configured: false,
      reason: "Variables SMTP no configuradas en el archivo .env (se requiere GMAIL_USER y GMAIL_APP_PASSWORD)."
    };
  }
  const subject = isRecovery ? `${code} - C\xF3digo de recuperaci\xF3n de ALPHABIT` : `${code} - Tu c\xF3digo de acceso de ALPHABIT`;
  const purposeText = isRecovery ? "Usa este c\xF3digo para restablecer la contrase\xF1a de tu cuenta." : "Usa este c\xF3digo para iniciar sesi\xF3n en tu cuenta.";
  const textBody = `Hola ${userName},

Tu c\xF3digo de verificaci\xF3n de ALPHABIT es:

${code}

Este c\xF3digo es confidencial y caduca en 10 minutos.

El equipo de ALPHABIT`;
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
          ${isRecovery ? "Restablecimiento de contrase\xF1a" : "\xBFEst\xE1s iniciando sesi\xF3n?"}
        </h2>
        <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #94a3b8;">
          Hola <strong style="color: #ffffff;">${userName}</strong>,<br>
          ${purposeText}
        </p>
        <div style="background-color: #0b1320; border-radius: 6px; padding: 20px; text-align: center; margin: 24px 0; border: 1px solid #1e293b;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 8px;">C\xD3DIGO DE SEGURIDAD A2F</div>
          <div style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; font-family: 'Courier New', Courier, monospace;">
            ${code}
          </div>
        </div>
        <p style="margin: 0 0 8px; font-size: 13px; color: #64748b;">
          Este c\xF3digo es v\xE1lido por 10 minutos y no debe compartirse con nadie.
        </p>
        <p style="margin: 0; font-size: 12px; color: #475569;">
          Si t\xFA no solicitaste este c\xF3digo, puedes ignorar este correo de forma segura.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 32px; background-color: #111827; border-top: 1px solid #1f2937; text-align: center; font-size: 11px; color: #6b7280;">
        \xA9 ALPHABIT \u2022 Todos los derechos reservados
      </td>
    </tr>
  </table>
</body>
</html>`;
  try {
    const info = await transporter.sendMail({
      from: `"ALPHABIT" <${user}>`,
      to: toEmail,
      replyTo: user,
      subject,
      text: textBody,
      html: htmlBody,
      headers: {
        "X-Entity-Ref-ID": `${Date.now()}-${code}`,
        "Auto-Submitted": "auto-generated",
        "X-Auto-Response-Suppress": "OOF, AutoReply"
      }
    });
    console.log(`[SMTP] Correo despachado exitosamente a ${toEmail} (MessageId: ${info.messageId})`);
    return { sent: true, configured: true, messageId: info.messageId };
  } catch (err) {
    console.warn(`[SMTP Warning] Error al enviar correo a ${toEmail}: ${err.message}`);
    cachedTransporter = null;
    return {
      sent: false,
      configured: true,
      reason: err.message
    };
  }
}
function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    system: "ALPHABIT CMS REST API",
    version: "2.1.0",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    projectsCount: projects.length,
    publishedCount: projects.filter((p) => p.status === "published").length,
    servicesCount: services.length,
    usersCount: users.length
  });
});
app.get("/api/auth/admin-status", (req, res) => {
  res.json({
    hasAdmin: users.length > 0,
    totalAdmins: users.length
  });
});
app.get("/api/auth/status", (req, res) => {
  res.json({
    hasAdmin: users.length > 0,
    hasUsers: users.length > 0,
    usersCount: users.length
  });
});
app.post("/api/auth/admin/register", async (req, res) => {
  try {
    if (users.length > 0) {
      return res.status(403).json({
        error: "Ya existe un administrador registrado en el sistema. El registro p\xFAblico est\xE1 deshabilitado."
      });
    }
    const { name, email, password, confirmPassword } = req.body;
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ error: "El nombre completo es obligatorio (m\xEDnimo 2 caracteres)." });
    }
    const cleanEmail = (email || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: "Ingresa un correo electr\xF3nico v\xE1lido." });
    }
    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "La contrase\xF1a es obligatoria." });
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: "La contrase\xF1a debe tener al menos 8 caracteres, incluyendo al menos una letra y un n\xFAmero."
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Las contrase\xF1as no coinciden." });
    }
    const code = generateSecureCode();
    const expirationMinutes = parseInt(process.env.TWO_FACTOR_CODE_EXPIRATION_MINUTES || "10", 10);
    const expiresAt = Date.now() + expirationMinutes * 60 * 1e3;
    const passwordHash = import_crypto.default.createHash("sha256").update(password).digest("hex");
    const tempUser = {
      id: `usr_${Date.now()}_${import_crypto.default.randomBytes(4).toString("hex")}`,
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: "Super Administrador",
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
      message: emailResult.sent ? `C\xF3digo de verificaci\xF3n enviado a ${cleanEmail}.` : emailResult.configured ? `No fue posible enviar el correo v\xEDa SMTP (${emailResult.reason || "error de conexi\xF3n"}). Puedes usar el c\xF3digo de verificaci\xF3n generado abajo.` : "Variables SMTP no configuradas en el servidor. Puedes usar el c\xF3digo de verificaci\xF3n generado abajo.",
      email: cleanEmail,
      smtpSent: emailResult.sent,
      smtpConfigured: emailResult.configured,
      smtpReason: emailResult.reason,
      devCode: !emailResult.sent || process.env.NODE_ENV !== "production" ? code : void 0
    });
  } catch (err) {
    console.error("Error en /api/auth/admin/register:", err);
    res.status(500).json({ error: "Error interno al procesar el registro." });
  }
});
app.post("/api/auth/register", (req, res) => {
  return app._router.handle({ ...req, url: "/api/auth/admin/register" }, res);
});
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail) {
      return res.status(400).json({ error: "Ingresa tu correo electr\xF3nico." });
    }
    if (!password) {
      return res.status(400).json({ error: "Ingresa tu contrase\xF1a." });
    }
    if (users.length === 0) {
      return res.status(400).json({
        error: "No hay administradores registrados en el sistema.",
        noAdmin: true
      });
    }
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(401).json({ error: "Credenciales inv\xE1lidas. Verifica tu correo y contrase\xF1a." });
    }
    const hash = import_crypto.default.createHash("sha256").update(password).digest("hex");
    if (user.passwordHash !== hash) {
      return res.status(401).json({ error: "Credenciales inv\xE1lidas. Verifica tu correo y contrase\xF1a." });
    }
    const code = generateSecureCode();
    const expirationMinutes = parseInt(process.env.TWO_FACTOR_CODE_EXPIRATION_MINUTES || "10", 10);
    const expiresAt = Date.now() + expirationMinutes * 60 * 1e3;
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
      message: emailResult.sent ? `C\xF3digo de verificaci\xF3n 2FA enviado a ${cleanEmail}.` : emailResult.configured ? `No fue posible enviar el correo v\xEDa SMTP (${emailResult.reason || "error de conexi\xF3n"}). Puedes usar el c\xF3digo de verificaci\xF3n generado abajo.` : "Variables SMTP no configuradas en el servidor. Puedes usar el c\xF3digo de verificaci\xF3n generado abajo.",
      email: cleanEmail,
      smtpSent: emailResult.sent,
      smtpConfigured: emailResult.configured,
      smtpReason: emailResult.reason,
      devCode: !emailResult.sent || process.env.NODE_ENV !== "production" ? code : void 0
    });
  } catch (err) {
    console.error("Error en /api/auth/login:", err);
    res.status(500).json({ error: "Error interno al procesar el inicio de sesi\xF3n." });
  }
});
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail) {
      return res.status(400).json({ error: "Ingresa tu correo electr\xF3nico registrado." });
    }
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(404).json({ error: "No se encontr\xF3 ninguna cuenta administrativa con ese correo." });
    }
    const code = generateSecureCode();
    const expirationMinutes = parseInt(process.env.TWO_FACTOR_CODE_EXPIRATION_MINUTES || "10", 10);
    const expiresAt = Date.now() + expirationMinutes * 60 * 1e3;
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
      message: emailResult.sent ? `C\xF3digo de recuperaci\xF3n enviado a ${cleanEmail}.` : emailResult.configured ? `No fue posible enviar el correo de recuperaci\xF3n (${emailResult.reason || "error de conexi\xF3n"}). Puedes usar el c\xF3digo generado abajo.` : "Variables SMTP no configuradas en el servidor. Puedes usar el c\xF3digo generado abajo.",
      email: cleanEmail,
      smtpSent: emailResult.sent,
      smtpConfigured: emailResult.configured,
      smtpReason: emailResult.reason,
      devCode: !emailResult.sent || process.env.NODE_ENV !== "production" ? code : void 0
    });
  } catch (err) {
    console.error("Error en /api/auth/forgot-password:", err);
    res.status(500).json({ error: "Error interno al procesar la solicitud de recuperaci\xF3n." });
  }
});
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    const inputCode = (code || "").toString().trim().replace(/[\s\-]/g, "").toUpperCase();
    if (!cleanEmail || !inputCode) {
      return res.status(400).json({ error: "El correo y el c\xF3digo 2FA son requeridos." });
    }
    const pending = pendingOtps.get(cleanEmail);
    if (!pending || pending.used || !pending.isRecovery) {
      return res.status(400).json({ error: "No hay una solicitud de recuperaci\xF3n activa o el c\xF3digo ya fue utilizado." });
    }
    if (Date.now() > pending.expiresAt) {
      pendingOtps.delete(cleanEmail);
      return res.status(400).json({ error: "El c\xF3digo ha expirado. Solicita una nueva recuperaci\xF3n." });
    }
    if (pending.attempts >= 5) {
      pendingOtps.delete(cleanEmail);
      return res.status(429).json({ error: "Demasiados intentos fallidos. Solicita un nuevo c\xF3digo." });
    }
    const targetCode = pending.code.replace(/[\s\-]/g, "").toUpperCase();
    if (targetCode !== inputCode) {
      pending.attempts += 1;
      return res.status(400).json({
        error: "El c\xF3digo de verificaci\xF3n es incorrecto.",
        attemptsRemaining: Math.max(0, 5 - pending.attempts)
      });
    }
    if (!newPassword || typeof newPassword !== "string") {
      return res.status(400).json({ error: "La nueva contrase\xF1a es requerida." });
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error: "La nueva contrase\xF1a debe tener al menos 8 caracteres, incluyendo al menos una letra y un n\xFAmero."
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Las contrase\xF1as no coinciden." });
    }
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    if (userIndex === -1) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    const newHash = import_crypto.default.createHash("sha256").update(newPassword).digest("hex");
    users[userIndex].passwordHash = newHash;
    saveData(USERS_FILE, users);
    pendingOtps.delete(cleanEmail);
    const sessionToken = import_crypto.default.randomBytes(32).toString("hex");
    activeSessions.set(sessionToken, {
      userId: users[userIndex].id,
      email: users[userIndex].email,
      createdAt: Date.now()
    });
    console.log(`[Auth] Contrase\xF1a restablecida con 2FA exitosamente para: ${cleanEmail}`);
    res.json({
      success: true,
      message: "Tu contrase\xF1a ha sido restablecida exitosamente.",
      user: {
        id: users[userIndex].id,
        name: users[userIndex].name,
        email: users[userIndex].email,
        role: users[userIndex].role
      },
      token: sessionToken
    });
  } catch (err) {
    console.error("Error en /api/auth/reset-password:", err);
    res.status(500).json({ error: "Error interno al restablecer la contrase\xF1a." });
  }
});
var verify2faHandler = (req, res) => {
  const { email, code, otp } = req.body;
  const cleanEmail = (email || "").trim().toLowerCase();
  const rawInput = (code || otp || "").toString().trim();
  const inputCode = rawInput.replace(/[\s\-]/g, "").toUpperCase();
  if (!cleanEmail || !inputCode) {
    return res.status(400).json({ error: "El correo y el c\xF3digo de verificaci\xF3n son requeridos." });
  }
  const pending = pendingOtps.get(cleanEmail);
  if (!pending || pending.used) {
    return res.status(400).json({ error: "No hay un c\xF3digo de verificaci\xF3n activo para este correo o ya fue utilizado." });
  }
  if (Date.now() > pending.expiresAt) {
    pendingOtps.delete(cleanEmail);
    return res.status(400).json({ error: "El c\xF3digo ha expirado. Solicita uno nuevo." });
  }
  if (pending.attempts >= 5) {
    pendingOtps.delete(cleanEmail);
    return res.status(429).json({ error: "Demasiados intentos fallidos. Solicita un nuevo c\xF3digo de verificaci\xF3n." });
  }
  const targetCode = pending.code.replace(/[\s\-]/g, "").toUpperCase();
  if (targetCode !== inputCode) {
    pending.attempts += 1;
    return res.status(400).json({
      error: "El c\xF3digo de verificaci\xF3n es incorrecto.",
      attemptsRemaining: Math.max(0, 5 - pending.attempts)
    });
  }
  pending.used = true;
  let authenticatedUser;
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
  const sessionToken = import_crypto.default.randomBytes(32).toString("hex");
  activeSessions.set(sessionToken, {
    userId: authenticatedUser.id,
    email: authenticatedUser.email,
    createdAt: Date.now()
  });
  res.json({
    success: true,
    message: "Verificaci\xF3n exitosa.",
    user: authenticatedUser,
    token: sessionToken
  });
};
app.post("/api/auth/admin/verify-2fa", verify2faHandler);
app.post("/api/auth/verify-2fa", verify2faHandler);
var resend2faHandler = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    const pending = pendingOtps.get(cleanEmail);
    if (!pending) {
      return res.status(400).json({ error: "No hay ninguna solicitud activa para este correo. Inicia el proceso nuevamente." });
    }
    const now = Date.now();
    const elapsed = now - pending.lastResendAt;
    if (elapsed < 6e4) {
      const waitSeconds = Math.ceil((6e4 - elapsed) / 1e3);
      return res.status(429).json({
        error: `Debes esperar ${waitSeconds} segundos antes de solicitar otro c\xF3digo.`,
        retryAfter: waitSeconds
      });
    }
    const newCode = generateSecureCode();
    const expirationMinutes = parseInt(process.env.TWO_FACTOR_CODE_EXPIRATION_MINUTES || "10", 10);
    pending.code = newCode;
    pending.expiresAt = now + expirationMinutes * 60 * 1e3;
    pending.lastResendAt = now;
    pending.attempts = 0;
    pending.used = false;
    const userName = pending.tempUser?.name || pending.user?.name || "Administrador";
    const emailResult = await sendVerificationEmail(cleanEmail, userName, newCode, pending.isRecovery);
    res.json({
      success: true,
      message: emailResult.sent ? `Nuevo c\xF3digo de verificaci\xF3n enviado a ${cleanEmail}.` : emailResult.configured ? `No fue posible enviar el correo v\xEDa SMTP (${emailResult.reason || "error de conexi\xF3n"}). Puedes usar el c\xF3digo generado abajo.` : "Variables SMTP no configuradas en el servidor. Puedes usar el c\xF3digo generado abajo.",
      email: cleanEmail,
      smtpSent: emailResult.sent,
      smtpConfigured: emailResult.configured,
      smtpReason: emailResult.reason,
      devCode: !emailResult.sent || process.env.NODE_ENV !== "production" ? newCode : void 0
    });
  } catch (err) {
    console.error("Error al reenviar c\xF3digo 2FA:", err);
    res.status(500).json({ error: "Error al reenviar el c\xF3digo de verificaci\xF3n." });
  }
};
app.post("/api/auth/admin/resend-2fa", resend2faHandler);
app.post("/api/auth/resend-2fa", resend2faHandler);
app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return res.status(401).json({ error: "No autorizado. Token no proporcionado." });
  }
  const session = activeSessions.get(token);
  if (!session) {
    return res.status(401).json({ error: "Sesi\xF3n expirada o inv\xE1lida." });
  }
  const user = users.find((u) => u.id === session.userId || u.email === session.email);
  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
});
app.post("/api/auth/reset-users", (req, res) => {
  users = [];
  saveData(USERS_FILE, users);
  pendingOtps.clear();
  activeSessions.clear();
  console.log("[Auth] Base de datos de usuarios reiniciada a 0");
  res.json({ success: true, message: "Usuarios eliminados. Sistema sin administradores registrados.", count: 0 });
});
app.post("/api/auth/request-delete-account", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return res.status(401).json({ error: "No autorizado. Se requiere iniciar sesi\xF3n." });
    }
    const session = activeSessions.get(token);
    if (!session) {
      return res.status(401).json({ error: "Sesi\xF3n expirada o inv\xE1lida." });
    }
    const user = users.find((u) => u.id === session.userId || u.email === session.email);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    const code = generateSecureCode();
    const expirationMinutes = parseInt(process.env.TWO_FACTOR_CODE_EXPIRATION_MINUTES || "10", 10);
    const expiresAt = Date.now() + expirationMinutes * 60 * 1e3;
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
    console.log(`[A2F Borrado Cuenta] C\xF3digo para ${user.email}: ${code}`);
    const emailRes = await sendVerificationEmail(user.email, user.name, code);
    res.json({
      success: true,
      message: emailRes.sent ? `C\xF3digo de seguridad A2F enviado a ${user.email} para confirmar la eliminaci\xF3n de la cuenta.` : emailRes.configured ? `No fue posible enviar el correo v\xEDa SMTP (${emailRes.reason || "error de conexi\xF3n"}). Puedes usar el c\xF3digo generado abajo.` : "Variables SMTP no configuradas en el servidor. Puedes usar el c\xF3digo generado abajo.",
      email: user.email,
      smtpSent: emailRes.sent,
      smtpConfigured: emailRes.configured,
      smtpReason: emailRes.reason,
      devCode: !emailRes.sent || process.env.NODE_ENV !== "production" ? code : void 0
    });
  } catch (err) {
    console.error("Error en request-delete-account:", err);
    res.status(500).json({ error: "Error al procesar solicitud de eliminaci\xF3n de cuenta." });
  }
});
app.post("/api/auth/confirm-delete-account", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return res.status(401).json({ error: "No autorizado. Se requiere iniciar sesi\xF3n." });
    }
    const session = activeSessions.get(token);
    if (!session) {
      return res.status(401).json({ error: "Sesi\xF3n expirada o inv\xE1lida." });
    }
    const user = users.find((u) => u.id === session.userId || u.email === session.email);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    const { code } = req.body;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Debes ingresar el c\xF3digo de seguridad." });
    }
    const trimmedCode = code.trim().replace(/[\s\-]/g, "").toUpperCase();
    const cleanEmail = user.email.toLowerCase();
    const pending = pendingOtps.get(cleanEmail);
    if (!pending || !pending.isDeleteAccount) {
      return res.status(400).json({ error: "No hay solicitud de eliminaci\xF3n pendiente o el c\xF3digo ya expir\xF3." });
    }
    if (Date.now() > pending.expiresAt) {
      pendingOtps.delete(cleanEmail);
      return res.status(400).json({ error: "El c\xF3digo de seguridad ha expirado. Solicita uno nuevo." });
    }
    const targetCode = pending.code.replace(/[\s\-]/g, "").toUpperCase();
    if (targetCode !== trimmedCode) {
      pending.attempts += 1;
      return res.status(400).json({ error: "C\xF3digo de verificaci\xF3n incorrecto. Revisa tu correo o el c\xF3digo de respaldo." });
    }
    pendingOtps.delete(cleanEmail);
    for (const [sToken, s] of activeSessions.entries()) {
      if (s.userId === user.id || s.email.toLowerCase() === cleanEmail) {
        activeSessions.delete(sToken);
      }
    }
    users = users.filter((u) => u.id !== user.id && u.email.toLowerCase() !== cleanEmail);
    saveData(USERS_FILE, users);
    console.log(`[Auth] Cuenta eliminada con \xE9xito: ${user.email} (${user.id})`);
    res.json({
      success: true,
      message: "Tu cuenta administrativa ha sido eliminada permanentemente del sistema."
    });
  } catch (err) {
    console.error("Error al confirmar eliminaci\xF3n de cuenta:", err);
    res.status(500).json({ error: "Error al procesar la eliminaci\xF3n de la cuenta." });
  }
});
app.get("/api/auth/smtp-config", (req, res) => {
  const cfg = getSmtpConfig();
  const rawEmail = cfg.user || "";
  const maskedEmail = rawEmail.includes("@") ? rawEmail.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => `${a}${"*".repeat(Math.min(b.length, 6))}${c}`) : rawEmail;
  res.json({
    configured: Boolean(cfg.user && cfg.pass),
    user: maskedEmail,
    rawUser: cfg.user,
    host: cfg.host,
    port: cfg.port,
    hasPassword: Boolean(cfg.pass)
  });
});
app.post("/api/auth/test-smtp", async (req, res) => {
  try {
    const { user, pass } = req.body;
    const currentCfg = getSmtpConfig();
    const testUser = (user || currentCfg.user).trim();
    const testPass = (pass || currentCfg.pass).replace(/\s+/g, "");
    if (!testUser || !testPass) {
      return res.status(400).json({
        success: false,
        error: "Se requiere correo electr\xF3nico y contrase\xF1a de aplicaci\xF3n para realizar la prueba."
      });
    }
    const testTransporter = import_nodemailer.default.createTransport({
      service: "gmail",
      auth: { user: testUser, pass: testPass }
    });
    await testTransporter.verify();
    res.json({
      success: true,
      message: `\xA1Conexi\xF3n verificada con \xE9xito! Gmail SMTP est\xE1 listo para enviar correos de 2FA desde ${testUser}.`
    });
  } catch (err) {
    console.warn(`[SMTP Test Error]: ${err.message}`);
    res.status(400).json({
      success: false,
      error: `Error de conexi\xF3n SMTP con Gmail: ${err.message || "Credenciales no autorizadas"}`
    });
  }
});
app.post("/api/auth/update-smtp", (req, res) => {
  try {
    const { user, pass } = req.body;
    if (!user || !pass) {
      return res.status(400).json({ error: "El correo y la contrase\xF1a de aplicaci\xF3n son obligatorios." });
    }
    smtpSettings = {
      user: user.trim(),
      pass: pass.replace(/\s+/g, ""),
      host: "smtp.gmail.com",
      port: 465,
      secure: true
    };
    saveData(SMTP_CONFIG_FILE, smtpSettings);
    cachedTransporter = null;
    res.json({
      success: true,
      message: "Configuraci\xF3n SMTP de Gmail actualizada exitosamente."
    });
  } catch (err) {
    res.status(500).json({ error: "Error al persistir la configuraci\xF3n SMTP." });
  }
});
app.post("/api/auth/clean-users", (req, res) => {
  try {
    const count = users.length;
    users = [];
    saveData(USERS_FILE, users);
    activeSessions.clear();
    pendingOtps.clear();
    console.log(`[Admin] Se limpiaron ${count} usuarios registrados a trav\xE9s del endpoint de mantenimiento.`);
    res.json({
      success: true,
      message: `Se restablecieron los administradores exitosamente (${count} eliminados). El sistema ahora permite registrar el primer administrador.`,
      usersCount: 0
    });
  } catch (err) {
    res.status(500).json({ error: "Error al limpiar los usuarios." });
  }
});
app.get("/api/projects", (req, res) => {
  const { category, page, limit, status } = req.query;
  let filtered = [...projects];
  if (status && status !== "all") {
    filtered = filtered.filter((p) => p.status === status);
  }
  if (category && category !== "all" && category !== "TODOS") {
    const catSearch = String(category).toLowerCase();
    filtered = filtered.filter((p) => {
      const pCat = (p.category || "").toLowerCase();
      if (catSearch === "logos" || catSearch === "logo") {
        return pCat.includes("logo");
      }
      if (catSearch.includes("foto")) {
        return pCat.includes("foto");
      }
      if (catSearch.includes("dise\xF1") || catSearch.includes("disen")) {
        return pCat.includes("dise\xF1") || pCat.includes("disen") || pCat.includes("editorial") || pCat.includes("empaque");
      }
      return pCat === catSearch;
    });
  }
  filtered.sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : a.createdAt || 0;
    const dateB = b.date ? new Date(b.date).getTime() : b.createdAt || 0;
    return dateB - dateA;
  });
  if (page && limit) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, parseInt(String(limit), 10) || 10);
    const start = (p - 1) * l;
    const paginated = filtered.slice(start, start + l);
    return res.json(paginated);
  }
  res.json(filtered);
});
app.get("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const project = projects.find((p) => p._id === id || p.id === id || p.slug === id);
  if (!project) {
    return res.status(404).json({ error: "Proyecto no encontrado", requestedId: id });
  }
  res.json(project);
});
app.post("/api/projects", (req, res) => {
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
    return res.status(400).json({ error: "El t\xEDtulo del proyecto es obligatorio." });
  }
  const newId = `alphabit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const finalImage = imageUrl || coverImage || "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80";
  const finalDesc = description || excerpt || "";
  const newProject = {
    _id: newId,
    id: newId,
    title: title.trim(),
    subtitle: (subtitle || "").trim(),
    category: (category || "DISE\xD1OS").trim().toUpperCase(),
    date: (date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]).trim(),
    imageUrl: finalImage,
    coverImage: finalImage,
    excerpt: finalDesc,
    description: finalDesc,
    body: Array.isArray(body) && body.length > 0 ? body : [
      {
        type: "text",
        content: finalDesc
      }
    ],
    tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    client: (client || "").trim(),
    link: (link || "").trim(),
    slug: slugify(title),
    status: status === "draft" ? "draft" : "published",
    featured: Boolean(featured),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  projects.unshift(newProject);
  saveData(DATA_FILE, projects);
  console.log(`[API] Proyecto creado: "${newProject.title}" (ID: ${newId})`);
  res.status(201).json(newProject);
});
app.put("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const index = projects.findIndex((p) => p._id === id || p.id === id || p.slug === id);
  if (index === -1) {
    return res.status(404).json({ error: "Proyecto a actualizar no encontrado." });
  }
  const existing = projects[index];
  const updates = req.body;
  const finalImage = updates.imageUrl || updates.coverImage || existing.imageUrl;
  const finalDesc = updates.description !== void 0 ? updates.description : updates.excerpt !== void 0 ? updates.excerpt : existing.description;
  const updatedProject = {
    ...existing,
    ...updates,
    imageUrl: finalImage,
    coverImage: finalImage,
    description: finalDesc,
    excerpt: finalDesc,
    tags: Array.isArray(updates.tags) ? updates.tags : typeof updates.tags === "string" ? updates.tags.split(",").map((t) => t.trim()).filter(Boolean) : existing.tags,
    slug: updates.title ? slugify(updates.title) : existing.slug,
    updatedAt: Date.now()
  };
  projects[index] = updatedProject;
  saveData(DATA_FILE, projects);
  console.log(`[API] Proyecto actualizado: "${updatedProject.title}"`);
  res.json(updatedProject);
});
app.delete("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const initialLength = projects.length;
  projects = projects.filter((p) => p._id !== id && p.id !== id && p.slug !== id);
  if (projects.length === initialLength) {
    return res.status(404).json({ error: "Proyecto a eliminar no encontrado." });
  }
  saveData(DATA_FILE, projects);
  console.log(`[API] Proyecto eliminado ID: ${id}`);
  res.json({ success: true, deletedId: id, remaining: projects.length });
});
app.get("/api/services", (req, res) => {
  res.json(services);
});
app.post("/api/services", (req, res) => {
  const { name, description, icon } = req.body;
  if (!name) return res.status(400).json({ error: "El nombre del servicio es requerido" });
  const newService = {
    _id: `serv_${Date.now()}`,
    id: `serv_${Date.now()}`,
    name: name.trim(),
    description: (description || "").trim(),
    icon: icon || "sparkles"
  };
  services.push(newService);
  saveData(SERVICES_FILE, services);
  res.status(201).json(newService);
});
app.get("/api/info", (req, res) => {
  res.json(companyInfo);
});
app.put("/api/info", (req, res) => {
  companyInfo = { ...companyInfo, ...req.body };
  saveData(INFO_FILE, companyInfo);
  res.json(companyInfo);
});
app.post("/api/reset", (req, res) => {
  projects = [...INITIAL_PROJECTS];
  services = [...INITIAL_SERVICES];
  companyInfo = { ...INITIAL_INFO };
  saveData(DATA_FILE, projects);
  saveData(SERVICES_FILE, services);
  saveData(INFO_FILE, companyInfo);
  res.json({
    success: true,
    message: "Base de datos de la API restaurada a los proyectos oficiales de ALPHABIT.",
    count: projects.length
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ALPHABIT API & CMS] Servidor activo en http://0.0.0.0:${PORT}`);
    console.log(`[ALPHABIT API] Endpoint p\xFAblico de proyectos: http://0.0.0.0:${PORT}/api/projects`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
