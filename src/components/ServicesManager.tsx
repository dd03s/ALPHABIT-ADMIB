import React, { useState } from 'react';
import { Sparkles, Palette, Camera, BookOpen, Plus, Check } from 'lucide-react';
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
    if (lower.includes('diseñ') || lower.includes('grafic')) return <Palette className="w-5 h-5 text-blue-500" />;
    if (lower.includes('foto') || lower.includes('arte')) return <Camera className="w-5 h-5 text-sky-500" />;
    return <BookOpen className="w-5 h-5 text-indigo-500" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-studio-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0055FF] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portafolio de Servicios</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
            Servicios Especializados de ALPHABIT
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-lg">
            Las tres áreas principales de trabajo del estudio, servidas automáticamente a la web pública.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {services.map((serv) => (
          <div
            key={serv._id || serv.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-studio-sm flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center">
                {getIcon(serv.name)}
              </div>
              <h3 className="font-bold text-slate-900 text-base font-['Outfit',sans-serif]">
                {serv.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {serv.description}
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-400">
              <span>Sincronizado vía API</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" />
                Activo
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
