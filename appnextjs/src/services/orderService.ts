import { appApi } from './api';

export interface Order {
  id: number;
  order_number: string;
  name: string;
  contract_id?: number;
  project_id?: number;
  vendor_id?: number;
  description?: string;
  order_date?: string;
  amount?: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export const orderService = {
  getAll: async (params?: any) => {
    const response = await appApi.get('orders', { params });
    return response.data;
  },
  getById: async (id: number | string) => {
    const response = await appApi.get(`orders/${id}`);
    return response.data;
  },
  create: async (data: Partial<Order>) => {
    const response = await appApi.post('orders', data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Order>) => {
    const response = await appApi.put(`orders/${id}`, data);
    return response.data;
  },
  delete: async (id: number | string) => {
    const response = await appApi.delete(`orders/${id}`);
    return response.data;
  },
  getByContractId: async (contractId: number | string) => {
      const response = await appApi.get(`orders/contract/${contractId}`);
      return response.data;
  },
  getByProjectId: async (projectId: number | string) => {
      const response = await appApi.get(`orders/project/${projectId}`);
      return response.data;
  }
};
