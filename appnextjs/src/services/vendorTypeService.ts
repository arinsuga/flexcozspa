import { appApi } from './api';

export interface VendorType {
  id: number;
  vendortype_code: string;
  vendortype_name: string;
  vendortype_description?: string;
  is_active: number;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export const vendorTypeService = {
  getAll: async (params?: any) => {
    const response = await appApi.get('vendortypes', { params });
    return response.data; 
  },
  create: async (data: Partial<VendorType>) => {
    const response = await appApi.post('vendortypes', data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<VendorType>) => {
    const response = await appApi.put(`vendortypes/${id}`, data);
    return response.data;
  },
  delete: async (id: number | string) => {
    const response = await appApi.delete(`vendortypes/${id}`);
    return response.data;
  }
};
