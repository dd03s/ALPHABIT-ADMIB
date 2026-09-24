import { Project, ServiceItem, CompanyInfo, ApiHealthStatus } from '../types';

const getApiBase = (): string => {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, '') + '/api';
  }
  return '/api';
};

const API_BASE = getApiBase();

const buildUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE.startsWith('http://') || API_BASE.startsWith('https://')) {
    return `${API_BASE}${cleanPath}`;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${API_BASE}${cleanPath}`;
  }
  return `${API_BASE}${cleanPath}`;
};

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
      const url = new URL(buildUrl('/projects'));
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
  },

  // Auth & 2FA
  getAuthToken(): string | null {
    return localStorage.getItem('alphabit_auth_token') || sessionStorage.getItem('alphabit_auth_token');
  },

  setAuthToken(token: string, remember: boolean = true) {
    if (remember) {
      localStorage.setItem('alphabit_auth_token', token);
    } else {
      sessionStorage.setItem('alphabit_auth_token', token);
    }
  },

  clearAuth() {
    localStorage.removeItem('alphabit_auth_token');
    localStorage.removeItem('alphabit_auth_user');
    sessionStorage.removeItem('alphabit_auth_token');
    sessionStorage.removeItem('alphabit_auth_user');
  },

  async getAdminStatus(): Promise<{ hasAdmin: boolean; totalAdmins?: number }> {
    try {
      const res = await fetch(`${API_BASE}/auth/admin-status`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) return { hasAdmin: false };
      return await res.json();
    } catch {
      return { hasAdmin: false };
    }
  },

  async registerAdmin(name: string, email: string, password: string, confirmPassword?: string): Promise<{ success: boolean; message: string; email: string; smtpSent?: boolean; smtpConfigured?: boolean; devCode?: string; smtpReason?: string }> {
    const res = await fetch(`${API_BASE}/auth/admin/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Error ${res.status}`);
    }
    return data;
  },

  async loginAdmin(email: string, password: string): Promise<{ success: boolean; message: string; email: string; smtpSent?: boolean; smtpConfigured?: boolean; devCode?: string; smtpReason?: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(data.error || `Error ${res.status}`);
      err.noAdmin = data.noAdmin;
      throw err;
    }
    return data;
  },

  async resend2fa(email: string): Promise<{ success: boolean; message: string; email: string; smtpSent?: boolean; smtpConfigured?: boolean; devCode?: string; smtpReason?: string }> {
    const res = await fetch(`${API_BASE}/auth/admin/resend-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Error ${res.status}`);
    }
    return data;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; email: string; smtpSent?: boolean; smtpConfigured?: boolean; devCode?: string; smtpReason?: string }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Error ${res.status}`);
    }
    return data;
  },

  async resetPassword(email: string, code: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; user: any; token: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, code, newPassword, confirmPassword })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Error ${res.status}`);
    }
    return data;
  },

  async verify2fa(email: string, code: string): Promise<{ success: boolean; user: any; token: string }> {
    const res = await fetch(`${API_BASE}/auth/admin/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Error ${res.status}`);
    }
    return data;
  },

  async getCurrentUser(): Promise<any | null> {
    const token = this.getAuthToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        this.clearAuth();
        return null;
      }
      return await res.json();
    } catch {
      return null;
    }
  },

  async resetUsers(): Promise<void> {
    await fetch(`${API_BASE}/auth/reset-users`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });
  },

  async requestDeleteAccount(): Promise<{ success: boolean; message: string; email: string; smtpSent?: boolean; smtpConfigured?: boolean; devCode?: string; smtpReason?: string }> {
    const token = this.getAuthToken();
    if (!token) throw new Error('No hay sesión activa.');
    const res = await fetch(`${API_BASE}/auth/request-delete-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Error ${res.status}`);
    }
    return data;
  },

  async confirmDeleteAccount(code: string): Promise<{ success: boolean; message: string }> {
    const token = this.getAuthToken();
    if (!token) throw new Error('No hay sesión activa.');
    const res = await fetch(`${API_BASE}/auth/confirm-delete-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ code })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Error ${res.status}`);
    }
    this.clearAuth();
    return data;
  },

  // SMTP Diagnostics & Admin Reset
  async getSmtpConfig(): Promise<{ configured: boolean; user: string; rawUser?: string; host?: string; port?: number; hasPassword?: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/auth/smtp-config`);
      if (!res.ok) return { configured: false, user: '' };
      return await res.json();
    } catch {
      return { configured: false, user: '' };
    }
  },

  async testSmtp(user?: string, pass?: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await fetch(`${API_BASE}/auth/test-smtp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ user, pass })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.error || 'Error al conectar con SMTP' };
    }
    return data;
  },

  async updateSmtp(user: string, pass: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await fetch(`${API_BASE}/auth/update-smtp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ user, pass })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.error || 'Error al guardar la configuración SMTP' };
    }
    return data;
  },

  async cleanUsers(): Promise<{ success: boolean; message: string; usersCount?: number }> {
    const res = await fetch(`${API_BASE}/auth/clean-users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Error al limpiar usuarios');
    }
    this.clearAuth();
    return data;
  }
};
