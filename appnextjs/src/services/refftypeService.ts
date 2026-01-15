import { appApi } from './api';

export interface ReffType {
  id: number;
  refftype_name: string;
  refftype_description?: string;
  refftype_code?: string;
  is_active: number | boolean;
}

export const refftypeService = {
  getAll: async (params?: Record<string, unknown>) => {
    const response = await appApi.get('refftypes', { params });
    return response.data;
  },
  getById: async (id: number | string) => {
    const response = await appApi.get(`refftypes/${id}`);
    return response.data;
  },
  create: async (data: Partial<ReffType>) => {
    const response = await appApi.post('refftypes', data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<ReffType>) => {
    const response = await appApi.put(`refftypes/${id}`, data);
    return response.data;
  },
  delete: async (id: number | string) => {
    const response = await appApi.delete(`refftypes/${id}`);
    return response.data;
  }
};
