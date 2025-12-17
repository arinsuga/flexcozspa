import { appApi } from './api';

export interface Contract {
  id: number;
  project_id: number;
  contract_name: string;
  contract_description: string;
  contract_number: string;
  contract_pic: string;
  contract_status: string;
  contract_progress: string;
  contract_dt: string;
  contract_startdt: string;
  contract_enddt: string;
  contract_payment_dt: string;
  contract_amount: string;
  contract_payment: string;
  contract_payment_status: string;
  created_at: string;
  updated_at: string;
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
