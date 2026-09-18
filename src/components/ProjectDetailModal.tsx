import React from 'react';
import { X, Calendar, Building2, Tag, Edit3, ExternalLink, CheckCircle2, Clock } from 'lucide-react';
import { Project } from '../types';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onEdit: (project: Project) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onEdit
}) => {
  if (!project) return null;

  const isPublished = project.status === 'published';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-studio-modal w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header with image */}
        <div className="relative aspect-video sm:aspect-21/9 w-full bg-slate-100 overflow-hidden shrink-0">
          <img
            src={project.coverImage || project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                {project.category}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 backdrop-blur-md ${
                isPublished ? 'bg-emerald-500/80 text-white' : 'bg-amber-500/80 text-white'
              }`}>
                {isPublished ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {isPublished ? 'Publicado en Web' : 'Borrador'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight font-['Outfit',sans-serif] leading-tight drop-shadow-sm">
              {project.title}
            </h2>
            {project.subtitle && (
              <p className="text-xs text-blue-200 font-medium mt-0.5">
                {project.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                Fecha
              </span>
              <span className="text-slate-800 font-medium flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                {project.date || '2026'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                Cliente
              </span>
              <span className="text-slate-800 font-medium flex items-center gap-1 mt-0.5 truncate">
                <Building2 className="w-3 h-3 text-slate-400" />
                {project.client || 'Estudio Interno'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                Identificador Slug
              </span>
              <span className="text-slate-800 font-mono text-[11px] truncate block mt-0.5">
                {project.slug || project.id}
              </span>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs mb-1 font-['Outfit',sans-serif]">
              Resumen del Proyecto
            </h4>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {project.excerpt || project.description}
            </p>
          </div>

          {/* Full description */}
          {project.body && project.body.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 text-xs mb-1 font-['Outfit',sans-serif]">
                Memoria & Detalles del Trabajo
              </h4>
              <div className="space-y-2 text-slate-600 leading-relaxed">
                {project.body.map((block, idx) => {
                  if (block.type === 'text') {
                    return <p key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100">{block.content}</p>;
                  }
                  return null;
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 text-xs mb-1.5 font-['Outfit',sans-serif]">
                Etiquetas / Especialidades
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3 text-slate-400" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Sincronizado vía API
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="btn-secondary text-xs font-semibold py-1.5 px-3 cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(project);
              }}
              className="btn-accent text-xs font-semibold py-1.5 px-3.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Proyecto</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
