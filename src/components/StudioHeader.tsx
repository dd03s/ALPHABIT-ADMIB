import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  LayoutDashboard, 
  Briefcase, 
  Sparkles, 
  Globe2, 
  LogOut, 
  ShieldCheck, 
  RefreshCw,
  ChevronDown,
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';
import { User, ApiHealthStatus } from '../types';

interface StudioHeaderProps {
  currentTab: 'dashboard' | 'projects' | 'services' | 'integration';
  onTabChange: (tab: 'dashboard' | 'projects' | 'services' | 'integration') => void;
  onNewProject: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  user: User | null;
  onLogout: () => void;
  health: { ok: boolean; status?: ApiHealthStatus; latencyMs: number };
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  currentTab,
  onTabChange,
  onNewProject,
  onRefresh,
  isRefreshing,
  user,
  onLogout,
  health
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Proyectos', icon: Briefcase },
    { id: 'services', label: 'Servicios', icon: Sparkles },
    { id: 'integration', label: 'Conexión Web', icon: Globe2 },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-studio-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main top bar */}
        <div className="h-16 flex items-center justify-between gap-4">
          
          {/* Studio Brand */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm tracking-tight font-['Outfit',sans-serif]">
                A
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-slate-900 font-['Outfit',sans-serif] leading-tight">
                  ALPHABIT
                </span>
                <span className="text-[11px] text-slate-400 font-medium leading-none">
                  Studio Workspace
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 border-l border-slate-200 pl-6 h-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0055FF]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Sync status indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 font-medium">
              <span className={`w-2 h-2 rounded-full ${health.ok ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{health.ok ? 'Sincronizado' : 'Conectando'}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              title="Actualizar datos del servidor"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#0055FF]' : ''}`} />
            </button>

            {/* New Project Primary CTA */}
            <button
              onClick={onNewProject}
              className="btn-accent text-xs font-semibold py-2 px-3.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Proyecto</span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-200 overflow-hidden flex items-center justify-center text-slate-700 font-bold text-xs">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-studio-modal p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-xs truncate font-['Outfit',sans-serif]">
                        {user?.name || 'Administrador ALPHABIT'}
                      </p>
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#0055FF] text-[10px] font-bold flex items-center gap-0.5 shrink-0">
                        <ShieldCheck className="w-3 h-3" />
                        2FA
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {user?.email || 'admin@alphabit.sv'}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Sesión activa y verificada</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onTabChange('integration');
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Configurar Conexión API</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Navigation sub-bar */}
        <div className="flex md:hidden items-center justify-around border-t border-slate-100 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0055FF]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
