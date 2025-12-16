import { appApi } from './api';

export interface Reference {
  id: number;
  code: string;
  name: string;
  type: string;
  description?: string;
  is_active: boolean; // or status
}

export const referenceService = {
  getAll: async (params?: any) => {
    const response = await appApi.get('references', { params });
    return response.data;
  },
  getById: async (id: number | string) => {
    const response = await appApi.get(`references/${id}`);
    return response.data;
  },
  create: async (data: Partial<Reference>) => {
    const response = await appApi.post('references', data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Reference>) => {
    const response = await appApi.put(`references/${id}`, data);
    return response.data;
  },
  delete: async (id: number | string) => {
    const response = await appApi.delete(`references/${id}`);
    return response.data;
  }
};
