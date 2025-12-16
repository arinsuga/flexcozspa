import { appApi } from './api';

export interface Vendor {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  vendor_type_id?: number;
  status: string;
}

export const vendorService = {
  getAll: async (params?: any) => {
    const response = await appApi.get('vendors', { params });
    return response.data;
  },
  getById: async (id: number | string) => {
    const response = await appApi.get(`vendors/${id}`);
    return response.data;
  },
  create: async (data: Partial<Vendor>) => {
    const response = await appApi.post('vendors', data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Vendor>) => {
    const response = await appApi.put(`vendors/${id}`, data);
    return response.data;
  },
  delete: async (id: number | string) => {
    const response = await appApi.delete(`vendors/${id}`);
    return response.data;
  }
};
