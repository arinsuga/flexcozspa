import { appApi } from './api';

export interface ContractStatus {
  id: number;
  status_name: string;
  status_description?: string;
  status_color?: string;
  created_at?: string;
  updated_at?: string;
}

export const contractStatusService = {
  getAll: async (params?: any) => {
    const response = await appApi.get('contractstatuses', { params });
    return response.data;
  },
  getById: async (id: number | string) => {
    const response = await appApi.get(`contractstatuses/${id}`);
    return response.data;
  }
};
