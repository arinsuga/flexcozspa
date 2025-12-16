import { appApi } from './api';

export interface Contract {
  id: number;
  contract_number: string;
  name: string; // Assuming 'name' or 'contract_name' based on API. Using common naming.
  description?: string;
  start_date?: string;
  end_date?: string;
  amount?: number;
  vendor_id?: number;
  project_id?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export const contractService = {
  getAll: async (params?: any) => {
    const response = await appApi.get('contracts', { params });
    return response.data;
  },
  getById: async (id: number | string) => {
    const response = await appApi.get(`contracts/${id}`);
    return response.data;
  },
  create: async (data: Partial<Contract>) => {
    const response = await appApi.post('contracts', data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Contract>) => {
    const response = await appApi.put(`contracts/${id}`, data);
    return response.data;
  },
  delete: async (id: number | string) => {
    const response = await appApi.delete(`contracts/${id}`);
    return response.data;
  },
  getSheets: async (id: number | string) => {
    const response = await appApi.get(`contracts/${id}/sheets`);
    return response.data;
  }
};
