export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  twoFactorVerified: boolean;
}

export interface ProjectBodyBlock {
  type: 'text' | 'image';
  content?: string;
  url?: string;
  caption?: string;
}

export interface Project {
  _id: string;
  id: string;
  title: string;
  subtitle?: string;
  category: string; // 'LOGOS' | 'PROYECTOS FOTOGRÁFICOS' | 'DISEÑOS'
  tags: string[];
  date: string; // e.g. "2026-09-11"
  coverImage: string;
  imageUrl: string;
  excerpt: string;
  description: string;
  body?: ProjectBodyBlock[];
  slug: string;
  client?: string;
  link?: string;
  status: 'published' | 'draft';
  featured?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ServiceItem {
  _id: string;
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  description: string;
  email: string;
  location: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
  };
  stats: Array<{ value: string; label: string }>;
}

export interface ApiHealthStatus {
  status: string;
  system: string;
  version: string;
  timestamp: string;
  projectsCount: number;
  publishedCount: number;
  servicesCount: number;
  latencyMs?: number;
}
