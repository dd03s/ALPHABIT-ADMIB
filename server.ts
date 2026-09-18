import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Enable CORS for all incoming connections (so external web system can query /api/projects)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Seed data storage file path
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'projects.json');
const SERVICES_FILE = path.join(DATA_DIR, 'services.json');
const INFO_FILE = path.join(DATA_DIR, 'info.json');

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
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    projectsCount: projects.length,
    publishedCount: projects.filter(p => p.status === 'published').length,
    servicesCount: services.length
  });
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
