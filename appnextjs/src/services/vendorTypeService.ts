import { appApi } from './api';

export interface VendorType {
  id: number;
  vendortype_code: string;
  vendortype_name: string;
  vendortype_description?: string;
  is_active: number;
  display_order?: number;
}

export const vendorTypeService = {
  getAll: async (params?: any) => {
    const response = await appApi.get('vendortypes', { params });
    // Handle both direct array and paginated/wrapped response
    return response.data; 
  }
};
