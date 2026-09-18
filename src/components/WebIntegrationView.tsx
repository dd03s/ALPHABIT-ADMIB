import React, { useState } from 'react';
import { Globe2, Copy, Check, ExternalLink, Code2, ArrowUpRight } from 'lucide-react';

export const WebIntegrationView: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const jsFetchCode = `// En tu archivo script.js o en tu HTML:
async function cargarProyectosAlphabit() {
  try {
    const res = await fetch('/api/projects');
    const proyectos = await res.json();
    console.log('Proyectos cargados desde el backend:', proyectos);
    
    // Renderizar en tu contenedor HTML:
    const contenedor = document.getElementById('galeria-proyectos');
    contenedor.innerHTML = proyectos.map(p => \`
      <div class="tarjeta-proyecto">
        <img src="\${p.coverImage}" alt="\${p.title}">
        <span class="categoria">\${p.category}</span>
        <h3>\${p.title}</h3>
        <p>\${p.excerpt}</p>
        <span class="fecha">\${p.date}</span>
      </div>
    \`).join('');
  } catch (err) {
    console.error('Error al obtener proyectos:', err);
  }
}

document.addEventListener('DOMContentLoaded', cargarProyectosAlphabit);`;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      
      {/* Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-studio-sm space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0055FF] text-xs font-semibold">
          <Globe2 className="w-3.5 h-3.5" />
          <span>Integración con el Frontend</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
          Cómo Conectar tu Sitio Web (HTML, CSS y JS)
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Este sistema administrativo actúa como el backend oficial de ALPHABIT. Todos los cambios que realices en el panel se guardan y se transmiten automáticamente a través de la API REST.
        </p>
      </div>

      {/* Endpoints Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-studio-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">
          Endpoints Disponibles
        </h3>

        <div className="space-y-2.5 text-xs">
          {/* Projects */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[#0055FF] font-mono font-bold text-[10px]">
                GET
              </span>
              <code className="font-mono text-slate-800 font-semibold text-xs">/api/projects</code>
              <span className="text-slate-400 text-[11px] hidden sm:inline">&bull; Lista completa de proyectos</span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => copyText(`${window.location.origin}/api/projects`, 'p_all')}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'p_all' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'p_all' ? 'Copiado' : 'Copiar URL'}</span>
              </button>
              <a
                href="/api/projects"
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Single project */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[#0055FF] font-mono font-bold text-[10px]">
                GET
              </span>
              <code className="font-mono text-slate-800 font-semibold text-xs">/api/projects/:id</code>
              <span className="text-slate-400 text-[11px] hidden sm:inline">&bull; Proyecto individual por ID o Slug</span>
            </div>
          </div>

          {/* Services */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[#0055FF] font-mono font-bold text-[10px]">
                GET
              </span>
              <code className="font-mono text-slate-800 font-semibold text-xs">/api/services</code>
              <span className="text-slate-400 text-[11px] hidden sm:inline">&bull; Catálogo de servicios del estudio</span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => copyText(`${window.location.origin}/api/services`, 's_all')}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 's_all' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 's_all' ? 'Copiado' : 'Copiar URL'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippet */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-studio-md text-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-slate-200 font-['Outfit',sans-serif]">
              Ejemplo de Código JavaScript para tu Frontend
            </span>
          </div>
          <button
            onClick={() => copyText(jsFetchCode, 'js_code')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedKey === 'js_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'js_code' ? 'Código Copiado' : 'Copiar Código'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-blue-100/90 overflow-x-auto leading-relaxed border border-slate-800/80">
          {jsFetchCode}
        </pre>
      </div>

    </div>
  );
};
