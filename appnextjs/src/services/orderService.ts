import { appApi } from './api';
import { OrderSheet } from './orderSheetService';

export interface OrderStatus {
  id: number;
  name: string;
}

export interface Order {
  id: number;
  project_id: number;
  contract_id: number;
  order_dt: string;
  order_number: string;
  order_description: string;
  order_pic: string;
  orderstatus_id: number;
  created_at?: string;
  updated_at?: string;
  status?: OrderStatus;
  project?: { project_name: string; project_number: string; id: number };
  contract?: { contract_name: string; contract_number: string; id: number };
  ordersheets?: OrderSheet[];
}

export const orderService = {
  getAll: async (params?: Record<string, unknown>) => {
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
