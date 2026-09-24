import React, { useState, useEffect } from 'react';
import { Project, ServiceItem, ApiHealthStatus, User } from './types';
import { apiService } from './services/apiService';
import { AuthScreen } from './components/AuthScreen';
import { StudioHeader } from './components/StudioHeader';
import { DashboardView } from './components/DashboardView';
import { ProjectsManager } from './components/ProjectsManager';
import { ServicesManager } from './components/ServicesManager';
import { ProjectFormModal } from './components/ProjectFormModal';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { LogoutConfirmModal } from './components/LogoutConfirmModal';
import { DeleteAccountModal } from './components/DeleteAccountModal';

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('alphabit_auth_user') || sessionStorage.getItem('alphabit_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'projects' | 'services'>('dashboard');
  const [targetCategory, setTargetCategory] = useState<string>('TODOS');

  // Projects & Services state
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [health, setHealth] = useState<{ ok: boolean; status?: ApiHealthStatus; latencyMs: number }>({
    ok: true,
    latencyMs: 8
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Logout & Delete Account Modals state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

  // Load data from backend
  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [fetchedProjects, fetchedServices, healthCheck] = await Promise.all([
        apiService.getProjects(),
        apiService.getServices(),
        apiService.getHealth()
      ]);
      setProjects(fetchedProjects);
      setServices(fetchedServices);
      setHealth(healthCheck);
    } catch (e) {
      console.error('Error fetching data from API:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Validate session if token exists
    const token = apiService.getAuthToken();
    if (token) {
      apiService.getCurrentUser().then(user => {
        if (user) {
          setCurrentUser(user);
        } else {
          // Token expired or invalid
          apiService.clearAuth();
          setCurrentUser(null);
        }
      });
    }

    loadData();
    const interval = setInterval(() => {
      apiService.getHealth().then(setHealth).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auth handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogoutConfirm = () => {
    apiService.clearAuth();
    setCurrentUser(null);
  };

  const handleAccountDeleted = () => {
    apiService.clearAuth();
    setCurrentUser(null);
    setIsDeleteAccountModalOpen(false);
  };

  // Project CRUD handlers
  const handleOpenNew = () => {
    setProjectToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setIsFormModalOpen(true);
  };

  const handleSaveProject = async (projectData: Partial<Project>, id?: string) => {
    if (id) {
      await apiService.updateProject(id, projectData);
    } else {
      await apiService.createProject(projectData);
    }
    await loadData();
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await apiService.deleteProject(projectToDelete._id || projectToDelete.id);
      setProjectToDelete(null);
      await loadData();
    } catch (e) {
      console.error('Error deleting project:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (project: Project) => {
    const nextStatus = project.status === 'published' ? 'draft' : 'published';
    await apiService.updateProject(project._id || project.id, { status: nextStatus });
    await loadData();
  };

  const handleResetDefaults = async () => {
    if (window.confirm('¿Deseas restaurar la base de datos a los 5 proyectos oficiales de ALPHABIT?')) {
      await apiService.resetToDefaults();
      await loadData();
    }
  };

  const handleNavigateToProjects = (category: string = 'TODOS') => {
    setTargetCategory(category);
    setCurrentTab('projects');
  };

  // If user is not authenticated, render login & 2FA view
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Studio Header & Navigation */}
      <StudioHeader
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onNewProject={handleOpenNew}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
        user={currentUser}
        onLogout={() => setIsLogoutModalOpen(true)}
        onDeleteAccount={() => setIsDeleteAccountModalOpen(true)}
        health={health}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            projects={projects}
            onNavigateToProjects={handleNavigateToProjects}
            onNewProject={handleOpenNew}
            onSelectProject={(project) => setSelectedProjectForDetail(project)}
          />
        )}

        {currentTab === 'projects' && (
          <ProjectsManager
            projects={projects}
            onNewProject={handleOpenNew}
            onEditProject={handleEditProject}
            onDeleteProject={(project) => setProjectToDelete(project)}
            onToggleStatus={handleToggleStatus}
            onSelectProject={(project) => setSelectedProjectForDetail(project)}
            onResetDefaults={handleResetDefaults}
            initialCategory={targetCategory}
          />
        )}

        {currentTab === 'services' && (
          <ServicesManager services={services} />
        )}
      </main>

      {/* Modals */}
      <ProjectFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveProject}
        projectToEdit={projectToEdit}
      />

      <ProjectDetailModal
        project={selectedProjectForDetail}
        onClose={() => setSelectedProjectForDetail(null)}
        onEdit={(project) => {
          setSelectedProjectForDetail(null);
          handleEditProject(project);
        }}
      />

      <DeleteConfirmModal
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={projectToDelete?.title || ''}
        isDeleting={isDeleting}
      />

      {/* Modal de confirmación para Cerrar Sesión */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        userName={currentUser?.name}
      />

      {/* Modal de confirmación para Eliminar Cuenta (con Doble Factor A2F) */}
      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        currentUser={currentUser}
        onAccountDeleted={handleAccountDeleted}
      />

      {/* Clean Studio Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 font-['Outfit',sans-serif] tracking-wider">ALPHABIT</span>
            <span>&bull;</span>
            <span>Sistema Administrativo</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Todos los derechos reservados
          </div>
        </div>
      </footer>

    </div>
  );
}
