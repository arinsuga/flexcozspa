import { appApi } from './api';

export interface ContractStatus {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const contractStatusService = {
  getAll: async (params?: Record<string, unknown>) => {
    const response = await appApi.get('contractstatuses', { params });
    return response.data;
  },
  getById: async (id: number | string) => {
    const response = await appApi.get(`contractstatuses/${id}`);
    return response.data;
  }
};
