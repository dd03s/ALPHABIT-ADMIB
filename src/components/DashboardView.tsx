import React from 'react';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  Building2, 
  ArrowUpRight, 
  Plus, 
  Eye, 
  Layers, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { Project } from '../types';

interface DashboardViewProps {
  projects: Project[];
  onNavigateToProjects: (category?: string) => void;
  onNewProject: () => void;
  onSelectProject: (project: Project) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  onNavigateToProjects,
  onNewProject,
  onSelectProject
}) => {
  const publishedCount = projects.filter(p => p.status === 'published').length;
  const draftCount = projects.filter(p => p.status === 'draft').length;

  // Category counts
  const categoryStats = [
    {
      name: 'LOGOS',
      label: 'Logos & Identidad de Marca',
      count: projects.filter(p => (p.category || '').toUpperCase().includes('LOGO')).length,
      color: 'bg-blue-500'
    },
    {
      name: 'PROYECTOS FOTOGRÁFICOS',
      label: 'Proyectos Fotográficos',
      count: projects.filter(p => (p.category || '').toUpperCase().includes('FOTO')).length,
      color: 'bg-sky-500'
    },
    {
      name: 'DISEÑOS',
      label: 'Diseño Editorial & Empaque',
      count: projects.filter(p => {
        const cat = (p.category || '').toUpperCase();
        return !cat.includes('LOGO') && !cat.includes('FOTO');
      }).length,
      color: 'bg-indigo-500'
    }
  ];

  // Unique clients
  const uniqueClients = Array.from(new Set(projects.map(p => p.client).filter(Boolean))).length;

  // Recent 4 projects
  const recentProjects = [...projects].slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner / Studio Welcome */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-studio flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0055FF] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ALPHABIT — Estudio de Diseño & Fotografía</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
            Panel de Control del Portafolio
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Gestiona la cartera de proyectos oficiales que se publican y sincronizan en tiempo real con tu sitio web.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateToProjects('TODOS')}
            className="btn-secondary text-xs font-semibold cursor-pointer"
          >
            Explorar Catálogo
          </button>
          <button
            onClick={onNewProject}
            className="btn-accent text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Proyecto</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Projects */}
        <div 
          onClick={() => onNavigateToProjects('TODOS')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-studio-sm hover:shadow-studio transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
            <span>Total en Portafolio</span>
            <FolderKanban className="w-4 h-4 text-slate-400 group-hover:text-[#0055FF] transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-['Outfit',sans-serif]">
              {projects.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">trabajos</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Base de proyectos del estudio
          </p>
        </div>

        {/* Published Projects */}
        <div 
          onClick={() => onNavigateToProjects('TODOS')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-studio-sm hover:shadow-studio transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
            <span>Publicados en Web</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-600 font-['Outfit',sans-serif]">
              {publishedCount}
            </span>
            <span className="text-xs text-emerald-700 font-medium">visibles</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Accesibles para visitantes públicos
          </p>
        </div>

        {/* Drafts */}
        <div 
          onClick={() => onNavigateToProjects('TODOS')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-studio-sm hover:shadow-studio transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
            <span>Borradores Internos</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600 font-['Outfit',sans-serif]">
              {draftCount}
            </span>
            <span className="text-xs text-amber-700 font-medium">en edición</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Solo visibles dentro de este panel
          </p>
        </div>

        {/* Registered Clients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-studio-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
            <span>Clientes & Marcas</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-['Outfit',sans-serif]">
              {uniqueClients || '4+'}
            </span>
            <span className="text-xs text-slate-500 font-medium">marcas</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Empresas con trabajos registrados
          </p>
        </div>

      </div>

      {/* Main Grid: Category Distribution & Recent Works */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Breakdown (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-studio-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm font-['Outfit',sans-serif]">
                Distribución por Especialidad
              </h3>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-4">
              {categoryStats.map((cat) => {
                const percentage = projects.length > 0 ? Math.round((cat.count / projects.length) * 100) : 0;
                return (
                  <div 
                    key={cat.name} 
                    onClick={() => onNavigateToProjects(cat.name)}
                    className="p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-800">{cat.label}</span>
                      <span className="text-slate-500 font-mono">{cat.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-4">
            <button
              onClick={() => onNavigateToProjects('TODOS')}
              className="w-full py-2 px-3 text-xs font-semibold text-[#0055FF] hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Ver todos los proyectos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Projects Table / List (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-studio-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-['Outfit',sans-serif]">
                  Últimos Trabajos Actualizados
                </h3>
                <p className="text-xs text-slate-500">
                  Proyectos más recientes en la base de datos
                </p>
              </div>
              <button
                onClick={() => onNavigateToProjects('TODOS')}
                className="text-xs font-semibold text-[#0055FF] hover:underline cursor-pointer"
              >
                Ver todos ({projects.length})
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentProjects.map((project) => {
                const isPublished = project.status === 'published';
                return (
                  <div
                    key={project._id || project.id}
                    onClick={() => onSelectProject(project)}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={project.coverImage || project.imageUrl}
                        alt={project.title}
                        className="w-12 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200/80"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-xs text-slate-900 truncate group-hover:text-[#0055FF] transition-colors font-['Outfit',sans-serif]">
                            {project.title}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium shrink-0">
                            {project.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {project.client ? `Cliente: ${project.client}` : project.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isPublished
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {isPublished ? 'Publicado' : 'Borrador'}
                      </span>
                      <div className="text-slate-400 group-hover:text-slate-700 transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Sincronización continua con el frontend
            </span>
            <span className="text-[11px] text-slate-400">
              Actualizado hoy
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
