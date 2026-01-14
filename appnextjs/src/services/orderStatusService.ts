import { appApi } from './api';

export interface OrderStatus {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const orderStatusService = {
  getAll: async (params?: Record<string, unknown>) => {
    const response = await appApi.get('orderstatuses', { params });
    return response.data;
  },
  getById: async (id: number | string) => {
    const response = await appApi.get(`orderstatuses/${id}`);
    return response.data;
  }
};
