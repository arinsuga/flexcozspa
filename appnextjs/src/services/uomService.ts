import { appApi } from './api';

export interface UOM {
  id: number;
  name: string;
  description?: string;
  symbol?: string; // e.g., kg, m, pcs
}

export const uomService = {
  getAll: async (params?: any) => {
    const response = await appApi.get('uoms', { params });
    return response.data;
  },
  getById: async (id: number | string) => {
    const response = await appApi.get(`uoms/${id}`);
    return response.data;
  },
  create: async (data: Partial<UOM>) => {
    const response = await appApi.post('uoms', data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<UOM>) => {
    const response = await appApi.put(`uoms/${id}`, data);
    return response.data;
  },
  delete: async (id: number | string) => {
    const response = await appApi.delete(`uoms/${id}`);
    return response.data;
  }
};
