import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  FolderPlus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  RotateCcw,
  LayoutGrid, 
  List, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Building2,
  Tag,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Project } from '../types';

interface ProjectsManagerProps {
  projects: Project[];
  onNewProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onToggleStatus: (project: Project) => Promise<void>;
  onSelectProject: (project: Project) => void;
  onResetDefaults: () => void;
  initialCategory?: string;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  onNewProject,
  onEditProject,
  onDeleteProject,
  onToggleStatus,
  onSelectProject,
  onResetDefaults,
  initialCategory = 'TODOS'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);

  // Categories
  const categories = [
    { key: 'TODOS', label: 'Todos' },
    { key: 'LOGOS', label: 'Logos' },
    { key: 'PROYECTOS FOTOGRÁFICOS', label: 'Fotografía' },
    { key: 'DISEÑOS', label: 'Diseños' }
  ];

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      TODOS: projects.length,
      LOGOS: 0,
      'PROYECTOS FOTOGRÁFICOS': 0,
      DISEÑOS: 0
    };

    projects.forEach(p => {
      const cat = (p.category || '').toUpperCase();
      if (cat.includes('LOGO')) counts['LOGOS']++;
      else if (cat.includes('FOTO')) counts['PROYECTOS FOTOGRÁFICOS']++;
      else counts['DISEÑOS']++;
    });

    return counts;
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // Category filter
      if (selectedCategory !== 'TODOS') {
        const pCat = (p.category || '').toUpperCase();
        if (selectedCategory === 'LOGOS' && !pCat.includes('LOGO')) return false;
        if (selectedCategory === 'PROYECTOS FOTOGRÁFICOS' && !pCat.includes('FOTO')) return false;
        if (selectedCategory === 'DISEÑOS' && (pCat.includes('LOGO') || pCat.includes('FOTO'))) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && p.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inTitle = (p.title || '').toLowerCase().includes(query);
        const inSub = (p.subtitle || '').toLowerCase().includes(query);
        const inDesc = (p.description || '').toLowerCase().includes(query);
        const inClient = (p.client || '').toLowerCase().includes(query);
        const inTags = (p.tags || []).some(t => t.toLowerCase().includes(query));
        if (!inTitle && !inSub && !inDesc && !inClient && !inTags) return false;
      }

      return true;
    });
  }, [projects, selectedCategory, statusFilter, searchQuery]);

  // Reset to page 1 whenever filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, statusFilter, searchQuery, itemsPerPage]);

  // Calculate pagination
  const totalItems = filteredProjects.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
            Catálogo de Proyectos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {filteredProjects.length} trabajos encontrados &bull; Pág {validCurrentPage} de {totalPages}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onResetDefaults}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Restaurar proyectos de muestra oficiales"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* View toggle (Grid / Table) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista de cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista de tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* New Project CTA */}
          <button
            onClick={onNewProject}
            className="px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Proyecto</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-studio-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Category tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            const count = categoryCounts[cat.key] ?? 0;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Status Filters */}
        <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar proyecto o cliente..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#0F172A] outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                &times;
              </button>
            )}
          </div>

          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:bg-white focus:border-[#0F172A] outline-none shrink-0"
          >
            <option value="all">Todos</option>
            <option value="published">Publicados</option>
            <option value="draft">Borradores</option>
          </select>
        </div>

      </div>

      {/* Projects Display: Grid or Table */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3 shadow-sm max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FolderPlus className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm font-['Outfit',sans-serif]">
            No se encontraron proyectos
          </h3>
          <p className="text-xs text-slate-500">
            Intenta cambiar los términos de búsqueda o los filtros de categoría.
          </p>
          <div className="pt-2">
            <button
              onClick={() => { setSelectedCategory('TODOS'); setSearchQuery(''); setStatusFilter('all'); }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedProjects.map((project) => {
            const isPublished = project.status === 'published';

            return (
              <div
                key={project._id || project.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail Banner */}
                  <div 
                    onClick={() => onSelectProject(project)}
                    className="relative aspect-video w-full bg-slate-100 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={project.coverImage || project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Category badge */}
                    <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white/95 text-slate-800 text-[10px] font-bold uppercase tracking-wider shadow-xs backdrop-blur-xs">
                      {project.category}
                    </span>

                    {/* Status Pill with Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(project);
                      }}
                      className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer backdrop-blur-xs ${
                        isPublished
                          ? 'bg-[#0F172A] text-white'
                          : 'bg-white/90 text-slate-700 border border-slate-200'
                      }`}
                      title="Clic para alternar estado"
                    >
                      {isPublished ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3 text-slate-400" />}
                      <span>{isPublished ? 'Publicado' : 'Borrador'}</span>
                    </button>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {project.date || '2026'}
                      </span>
                      {project.client && (
                        <span className="truncate max-w-[140px] text-slate-500 font-medium">
                          {project.client}
                        </span>
                      )}
                    </div>

                    <h4 
                      onClick={() => onSelectProject(project)}
                      className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-slate-700 transition-colors cursor-pointer font-['Outfit',sans-serif]"
                    >
                      {project.title}
                    </h4>

                    {project.subtitle && (
                      <p className="text-xs font-medium text-slate-500 line-clamp-1">
                        {project.subtitle}
                      </p>
                    )}

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {project.excerpt || project.description}
                    </p>

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {project.tags.slice(0, 3).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/60 text-slate-600 text-[10px]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectProject(project)}
                    className="text-slate-500 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Detalle</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditProject(project)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
                      title="Editar Proyecto"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProject(project)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Eliminar Proyecto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-studio-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Proyecto</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedProjects.map((project) => {
                  const isPublished = project.status === 'published';
                  return (
                    <tr key={project._id || project.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={project.coverImage || project.imageUrl}
                            alt=""
                            className="w-10 h-8 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0 max-w-xs">
                            <span 
                              onClick={() => onSelectProject(project)}
                              className="font-semibold text-slate-900 truncate block hover:text-[#0055FF] cursor-pointer"
                            >
                              {project.title}
                            </span>
                            {project.subtitle && (
                              <span className="text-[11px] text-slate-400 truncate block">
                                {project.subtitle}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px]">
                          {project.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {project.client || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                        {project.date || '2026'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onToggleStatus(project)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 cursor-pointer ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          {isPublished ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{isPublished ? 'Publicado' : 'Borrador'}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onSelectProject(project)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                            title="Ver detalle"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditProject(project)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteProject(project)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAGINACIÓN COMPLETA */}
      {filteredProjects.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-studio-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          
          {/* Info count */}
          <div className="flex items-center gap-3 text-slate-500">
            <span>
              Mostrando <strong className="text-slate-800">{totalItems === 0 ? 0 : startIndex + 1}</strong> a <strong className="text-slate-800">{endIndex}</strong> de <strong className="text-slate-800">{totalItems}</strong> proyectos
            </span>

            {/* Items per page selector */}
            <div className="flex items-center gap-1 text-[11px]">
              <span>Mostrar:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none cursor-pointer"
              >
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
            </div>
          </div>

          {/* Page buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={validCurrentPage <= 1}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Numeric page pills */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === validCurrentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage >= totalPages}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
