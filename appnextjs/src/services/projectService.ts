import { appApi } from './api';

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  start_date?: string;
  end_date?: string;
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
