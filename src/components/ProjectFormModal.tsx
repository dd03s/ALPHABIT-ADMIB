import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Check, AlertCircle, Sparkles, Eye } from 'lucide-react';
import { Project } from '../types';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<Project>, id?: string) => Promise<void>;
  projectToEdit?: Project | null;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectToEdit
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('LOGOS');
  const [date, setDate] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [tags, setTags] = useState('');
  const [client, setClient] = useState('');
  const [link, setLink] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [featured, setFeatured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sample quick images
  const sampleImages = [
    { label: 'Logo / Identidad', url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Fotografía Arquitectura', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Diseño Editorial', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Empaque / Packaging', url: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=1200&q=80' }
  ];

  useEffect(() => {
    if (projectToEdit) {
      setTitle(projectToEdit.title || '');
      setSubtitle(projectToEdit.subtitle || '');
      setCategory(projectToEdit.category || 'LOGOS');
      setDate(projectToEdit.date || '');
      setCoverImage(projectToEdit.coverImage || projectToEdit.imageUrl || '');
      setExcerpt(projectToEdit.excerpt || projectToEdit.description || '');
      
      const firstTextBlock = projectToEdit.body?.find(b => b.type === 'text')?.content || '';
      setBodyText(firstTextBlock || projectToEdit.description || '');

      setTags((projectToEdit.tags || []).join(', '));
      setClient(projectToEdit.client || '');
      setLink(projectToEdit.link || '');
      setStatus(projectToEdit.status || 'published');
      setFeatured(Boolean(projectToEdit.featured));
    } else {
      setTitle('');
      setSubtitle('');
      setCategory('LOGOS');
      setDate(new Date().toISOString().split('T')[0]);
      setCoverImage('https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80');
      setExcerpt('');
      setBodyText('');
      setTags('Diseño Gráfico, Identidad, Logo');
      setClient('');
      setLink('');
      setStatus('published');
      setFeatured(false);
    }
    setErrorMsg('');
  }, [projectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('El título del proyecto es requerido.');
      return;
    }
    if (!coverImage.trim()) {
      setErrorMsg('Debes proporcionar una URL para la imagen de portada.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const parsedTags = tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const projectData: Partial<Project> = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        category: category.trim().toUpperCase(),
        date: date.trim(),
        coverImage: coverImage.trim(),
        imageUrl: coverImage.trim(),
        excerpt: excerpt.trim() || title.trim(),
        description: excerpt.trim() || title.trim(),
        body: [
          {
            type: 'text',
            content: bodyText.trim() || excerpt.trim()
          },
          {
            type: 'image',
            url: coverImage.trim(),
            caption: title.trim()
          }
        ],
        tags: parsedTags,
        client: client.trim(),
        link: link.trim(),
        status,
        featured
      };

      await onSave(projectData, projectToEdit?._id || projectToEdit?.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el proyecto.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-studio-modal w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base font-['Outfit',sans-serif]">
              {projectToEdit ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
            </h3>
            <p className="text-xs text-slate-500">
              {projectToEdit ? 'Modifica los campos del proyecto en la cartera' : 'Ingresa la información para publicarlo en la web'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Project Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Título del Proyecto *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Dermalaser – Rediseño de Logo – Ejercicio Creativo #002"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0055FF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          {/* Subtitle & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Subtítulo / Especialidad
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ej. Ejercicio Creativo #002"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0055FF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Categoría Oficial *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0055FF] focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
              >
                <option value="LOGOS">LOGOS</option>
                <option value="PROYECTOS FOTOGRÁFICOS">PROYECTOS FOTOGRÁFICOS</option>
                <option value="DISEÑOS">DISEÑOS</option>
              </select>
            </div>
          </div>

          {/* Date & Client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Fecha del Trabajo *
              </label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="2026-09-11 o Septiembre 2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0055FF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cliente / Marca
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Ej. Clínica Dermalaser"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0055FF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Cover Image URL & Live Preview */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700">
              Imagen de Portada (URL de Cloudinary, Unsplash o Servidor) *
            </label>
            <input
              type="url"
              required
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0055FF] focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono"
            />

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-slate-400 font-medium">Fotos sugeridas:</span>
              {sampleImages.map((samp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCoverImage(samp.url)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition-colors cursor-pointer"
                >
                  {samp.label}
                </button>
              ))}
            </div>

            {/* Live image preview */}
            {coverImage && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
                <img
                  src={coverImage}
                  alt="Vista previa"
                  className="w-16 h-12 object-cover rounded-lg bg-slate-200 shrink-0 border border-slate-200"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-emerald-600 font-semibold block">Vista previa cargada correctamente</span>
                  <span className="text-[11px] text-slate-400 font-mono truncate block">{coverImage}</span>
                </div>
              </div>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Extracto / Resumen Breve *
            </label>
            <textarea
              required
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Descripción breve que se muestra en la tarjeta del proyecto..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0055FF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          {/* Detailed Body Text */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Memoria Completa del Proyecto (Para vista detallada)
            </label>
            <textarea
              rows={3}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Desarrollo del concepto, soluciones visuales, técnicas y dirección de arte..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0055FF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Etiquetas (separadas por coma)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Diseño Gráfico, Identidad, Branding, Tipografía"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0055FF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          {/* Publication Status & Featured */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div>
              <label className="block font-semibold text-slate-800 text-xs mb-0.5">
                Estado de Publicación:
              </label>
              <p className="text-[11px] text-slate-400">
                Solo los proyectos con estado "Publicado" se mostrarán a los visitantes de tu web
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setStatus('published')}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                  status === 'published'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                Publicado
              </button>
              <button
                type="button"
                onClick={() => setStatus('draft')}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                  status === 'draft'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                Borrador
              </button>
            </div>
          </div>

          {/* Submit Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs font-semibold py-2 px-3.5 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-accent text-xs font-semibold py-2 px-4 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : (projectToEdit ? 'Actualizar Proyecto' : 'Guardar Proyecto')}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
