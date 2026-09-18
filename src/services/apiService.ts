import { Project, ServiceItem, CompanyInfo, ApiHealthStatus } from '../types';

const API_BASE = '/api';

export const apiService = {
  // Check API Health
  async getHealth(): Promise<{ ok: boolean; status?: ApiHealthStatus; error?: string; latencyMs: number }> {
    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE}/health`, {
        headers: { 'Accept': 'application/json' }
      });
      const latencyMs = Math.round(performance.now() - start);
      if (!res.ok) {
        return { ok: false, error: `HTTP ${res.status}: ${res.statusText}`, latencyMs };
      }
      const data = await res.json();
      return { ok: true, status: { ...data, latencyMs }, latencyMs };
    } catch (e: any) {
      const latencyMs = Math.round(performance.now() - start);
      return { ok: false, error: e.message || 'Error de conexión', latencyMs };
    }
  },

  // Get Projects (all or filtered)
  async getProjects(category?: string, status: string = 'all'): Promise<Project[]> {
    try {
      const url = new URL(`${window.location.origin}${API_BASE}/projects`);
      if (category && category !== 'TODOS' && category !== 'all') {
        url.searchParams.append('category', category);
      }
      if (status) {
        url.searchParams.append('status', status);
      }

      const res = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error('[apiService] Error fetching projects:', e);
      return [];
    }
  },

  // Get single project
  async getProject(id: string): Promise<Project | null> {
    try {
      const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(id)}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error(`[apiService] Error fetching project ${id}:`, e);
      return null;
    }
  },

  // Create Project
  async createProject(projectData: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(projectData)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    return await res.json();
  },

  // Update Project
  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    return await res.json();
  },

  // Delete Project
  async deleteProject(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return true;
  },

  // Services
  async getServices(): Promise<ServiceItem[]> {
    try {
      const res = await fetch(`${API_BASE}/services`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  // Company info
  async getInfo(): Promise<CompanyInfo | null> {
    try {
      const res = await fetch(`${API_BASE}/info`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Reset to default ALPHABIT portfolio
  async resetToDefaults(): Promise<void> {
    await fetch(`${API_BASE}/reset`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });
  }
};
