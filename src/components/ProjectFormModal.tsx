import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Check, AlertCircle, Trash2, RefreshCw, Loader2 } from 'lucide-react';
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
  const [category, setCategory] = useState('LOGOS');
  const [client, setClient] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [imageFileSize, setImageFileSize] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (projectToEdit) {
      setTitle(projectToEdit.title || '');
      setCategory(projectToEdit.category || 'LOGOS');
      setClient(projectToEdit.client || '');
      setDate(projectToEdit.date || '');
      setDescription(projectToEdit.description || projectToEdit.excerpt || '');
      setCoverImage(projectToEdit.coverImage || projectToEdit.imageUrl || '');
      setImageFileName(projectToEdit.coverImage ? 'Fotografía actual' : '');
      setImageFileSize('');
      setStatus(projectToEdit.status || 'published');
    } else {
      setTitle('');
      setCategory('LOGOS');
      setClient('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setCoverImage('');
      setImageFileName('');
      setImageFileSize('');
      setStatus('published');
    }
    setErrorMsg('');
  }, [projectToEdit, isOpen]);

  if (!isOpen) return null;

  // Process and optimize image file from computer (JPG, PNG, WEBP)
  const processImageFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Formato no soportado. Selecciona un archivo de imagen válido (JPG, PNG o WEBP).');
      return;
    }

    setIsProcessingImage(true);
    setErrorMsg('');

    const sizeKB = Math.round(file.size / 1024);
    const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
    setImageFileName(file.name);
    setImageFileSize(sizeStr);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        setIsProcessingImage(false);
        setErrorMsg('No se pudo leer la imagen seleccionada.');
        return;
      }

      // Optimize image dimensions if too large
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1920;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            const optimizedDataUrl = canvas.toDataURL(mimeType, 0.9);
            setCoverImage(optimizedDataUrl);
          } else {
            setCoverImage(result);
          }
        } else {
          setCoverImage(result);
        }
        setIsProcessingImage(false);
      };

      img.onerror = () => {
        setIsProcessingImage(false);
        setErrorMsg('Error al procesar el archivo de imagen.');
      };

      img.src = result;
    };

    reader.onerror = () => {
      setIsProcessingImage(false);
      setErrorMsg('Error al leer el archivo desde el equipo.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setCoverImage('');
    setImageFileName('');
    setImageFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setErrorMsg('Ingresa el título del proyecto.');
      return;
    }

    if (!coverImage) {
      setErrorMsg('Debes subir una fotografía para el proyecto.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const projectData: Partial<Project> = {
        title: title.trim(),
        category: category.trim().toUpperCase(),
        client: client.trim(),
        date: date.trim(),
        coverImage,
        imageUrl: coverImage,
        description: description.trim() || title.trim(),
        excerpt: description.trim() || title.trim(),
        body: [
          {
            type: 'text',
            content: description.trim() || title.trim()
          },
          {
            type: 'image',
            url: coverImage,
            caption: title.trim()
          }
        ],
        status
      };

      await onSave(projectData, projectToEdit?._id || projectToEdit?.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el proyecto en el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm font-['Outfit',sans-serif]">
              {projectToEdit ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Ingresa los datos del trabajo para el portafolio
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
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
              Título del Proyecto
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Rediseño de Identidad Corporativa"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none transition-all"
            />
          </div>

          {/* Category & Client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none transition-all font-medium cursor-pointer"
              >
                <option value="LOGOS">LOGOS</option>
                <option value="PROYECTOS FOTOGRÁFICOS">PROYECTOS FOTOGRÁFICOS</option>
                <option value="DISEÑOS">DISEÑOS</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cliente / Marca
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Ej. Estudio ALPHABIT"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none transition-all"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Fecha del Trabajo
            </label>
            <input
              type="text"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="2026-09-18 o Septiembre 2026"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none transition-all"
            />
          </div>

          {/* Photo Upload Area (File Input from PC) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Fotografía del Proyecto
            </label>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp, image/jpg"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {coverImage ? (
              /* Selected Image Card */
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={coverImage}
                    alt="Previsualización"
                    className="w-16 h-12 object-cover rounded-lg bg-slate-200 border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {imageFileName || 'Fotografía seleccionada'}
                    </p>
                    {imageFileSize && (
                      <p className="text-[11px] text-slate-400">
                        {imageFileSize}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
                    title="Cambiar fotografía"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Quitar fotografía"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Drag & Drop / File Picker Box */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-slate-800 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="font-semibold text-slate-800 text-xs">
                  {isProcessingImage ? 'Procesando imagen...' : 'Haz clic o arrastra la foto aquí'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Formatos admitidos: JPG, PNG o WEBP
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Descripción del Trabajo
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalle del proyecto, concepto visual y desarrollo..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none transition-all"
            />
          </div>

          {/* Status Selection */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="font-semibold text-slate-800 text-xs block">
                Estado
              </span>
              <span className="text-[11px] text-slate-400">
                {status === 'published' ? 'Visible en la página web pública' : 'Guardado como borrador'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setStatus('published')}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                  status === 'published'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                Publicado
              </button>
              <button
                type="button"
                onClick={() => setStatus('draft')}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                  status === 'draft'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                Borrador
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || isProcessingImage}
              className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{projectToEdit ? 'Actualizar' : 'Guardar'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
