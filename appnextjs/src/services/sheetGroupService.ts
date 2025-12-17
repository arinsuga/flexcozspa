import { appApi } from './api';

export interface SheetGroup {
  id: number;
  sheetgroup_name: string;
  sheetgroup_description?: string;
  sheetgroup_type: number; // 0 for work, 1 for cost
  sheetgroup_code?: string;
}

export const sheetGroupService = {
  getAll: async (params?: any) => {
    const response = await appApi.get('sheetgroups', { params });
    return response.data;
  },
  getById: async (id: number | string) => {
    const response = await appApi.get(`sheetgroups/${id}`);
    return response.data;
  },
  getByType: async (type: number) => {
    const response = await appApi.get(`sheetgroups/type/${type}`);
    return response.data;
  },
  create: async (data: Partial<SheetGroup>) => {
    const response = await appApi.post('sheetgroups', data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<SheetGroup>) => {
    const response = await appApi.put(`sheetgroups/${id}`, data);
    return response.data;
  },
  delete: async (id: number | string) => {
    const response = await appApi.delete(`sheetgroups/${id}`);
    return response.data;
  }
};
