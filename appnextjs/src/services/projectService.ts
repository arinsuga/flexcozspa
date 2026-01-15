import { appApi } from './api';

export interface Project {
  id: number;
  project_name: string;
  project_description?: string | null;
  project_owner?: string | null;
  project_pic?: string | null;
  project_number?: string | null;
  project_startdt?: string | null;
  project_enddt?: string | null;
  project_address?: string | null;
  project_latitude?: string | null;
  project_longitude?: string | null;
  projectstatus_id: number;
  project_status?: {
    id: number;
    name: string;
  };
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

export const projectService = {
  getAll: async (params?: any) => {
    const response = await appApi.get('projects', { params });
    return response.data;
  },
  getById: async (id: number | string) => {
    const response = await appApi.get(`projects/${id}`);
    return response.data;
  },
  create: async (data: Partial<Project>) => {
    const response = await appApi.post('projects', data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Project>) => {
    const response = await appApi.put(`projects/${id}`, data);
    return response.data;
  },
  delete: async (id: number | string) => {
    const response = await appApi.delete(`projects/${id}`);
    return response.data;
  }
};
