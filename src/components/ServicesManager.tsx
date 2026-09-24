import React from 'react';
import { Palette, Camera, BookOpen, Check } from 'lucide-react';
import { ServiceItem } from '../types';

interface ServicesManagerProps {
  services: ServiceItem[];
  onAddService?: (service: Partial<ServiceItem>) => Promise<void>;
}

export const ServicesManager: React.FC<ServicesManagerProps> = ({
  services
}) => {
  const getIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('diseñ') || lower.includes('grafic')) return <Palette className="w-5 h-5 text-slate-700" />;
    if (lower.includes('foto') || lower.includes('arte')) return <Camera className="w-5 h-5 text-slate-700" />;
    return <BookOpen className="w-5 h-5 text-slate-700" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1.5 block">
            Catálogo de Capacidades
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
            Servicios Especializados de ALPHABIT
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-lg">
            Las áreas principales de trabajo del estudio, sincronizadas automáticamente con la web pública.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {services.map((serv) => (
          <div
            key={serv._id || serv.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center">
                {getIcon(serv.name)}
              </div>
              <h3 className="font-bold text-slate-900 text-sm font-['Outfit',sans-serif]">
                {serv.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {serv.description}
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-400">
              <span>Sincronizado vía API</span>
              <span className="text-slate-700 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3 text-slate-900" />
                Activo
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
