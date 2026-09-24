import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  LayoutDashboard, 
  Briefcase, 
  Layers, 
  LogOut, 
  RefreshCw,
  ChevronDown,
  User as UserIcon,
  Trash2,
  Settings,
  Shield
} from 'lucide-react';
import { User, ApiHealthStatus } from '../types';

interface StudioHeaderProps {
  currentTab: 'dashboard' | 'projects' | 'services';
  onTabChange: (tab: 'dashboard' | 'projects' | 'services') => void;
  onNewProject: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  user: User | null;
  onLogout: () => void;
  onDeleteAccount: () => void;
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
  onDeleteAccount
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
    { id: 'services', label: 'Servicios', icon: Layers },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main top bar */}
        <div className="h-16 flex items-center justify-between gap-4">
          
          {/* Studio Brand: strictly clean typography ALPHABIT */}
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-[0.15em] text-[#0F172A] font-['Outfit',sans-serif] leading-tight select-none">
                ALPHABIT
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase leading-none mt-0.5">
                Sistema Administrativo
              </span>
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-100 text-[#0F172A]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0F172A]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-slate-900' : ''}`} />
            </button>

            {/* New Project Primary CTA */}
            <button
              onClick={onNewProject}
              className="px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nuevo Proyecto</span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                title="Opciones de cuenta"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                  <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-none truncate max-w-[110px]">
                    {user?.name || 'Administrador'}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-none mt-1">Opciones</span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.12)] p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {/* User Info Header */}
                  <div className="p-3 border-b border-slate-100 bg-slate-50/50 rounded-xl mb-1">
                    <p className="font-bold text-slate-900 text-xs truncate">
                      {user?.name || 'Administrador'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                      {user?.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Shield className="w-3 h-3 text-emerald-600" />
                      <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                        {user?.role || 'Super Admin'} • A2F Activo
                      </span>
                    </div>
                  </div>

                  {/* Options header */}
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Opciones de Cuenta
                  </div>

                  <div className="space-y-0.5">
                    {/* Delete Account (with 2FA) */}
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onDeleteAccount();
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer group"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500 group-hover:text-rose-700" />
                      <div className="flex flex-col">
                        <span>Eliminar cuenta</span>
                        <span className="text-[10px] font-normal text-rose-400">Requiere A2F de confirmación</span>
                      </div>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    {/* Logout Option (Triggers Confirm Modal) */}
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-slate-500" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Mobile navigation tab strip */}
      <div className="md:hidden border-t border-slate-100 px-4 py-2 flex items-center justify-around bg-slate-50/50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isActive ? 'text-[#0F172A] bg-slate-200/60' : 'text-slate-500'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
