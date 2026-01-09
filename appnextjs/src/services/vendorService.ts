import { appApi } from './api';

export interface Vendor {
  id: number;
  vendortype_id: number;
  // This field is derived on the frontend for display purposes
  vendortype_name?: string; 
  vendor_code: string;
  vendor_name: string;
  vendor_description?: string;
  vendor_email?: string;
  vendor_phone?: string;
  vendor_mobile?: string;
  vendor_fax?: string;
  vendor_address?: string;
  vendor_city?: string;
  vendor_state?: string;
  vendor_postal_code?: string;
  vendor_country?: string;
  vendor_tax_id?: string;
  vendor_bank_account?: string;
  vendor_bank_name?: string;
  is_active: number;
  vendor_notes?: string;
  created_at?: string;
  updated_at?: string;
  vendortype?: {
    id: number;
    vendortype_name: string;
  };
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
