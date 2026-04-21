import { appApi } from './api';

export interface ExpenseStatus {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const expenseStatusService = {
  getAll: async (params?: Record<string, unknown>) => {
    const response = await appApi.get('expensestatuses', { params });
    return response.data;
  },
  getById: async (id: number | string) => {
    const response = await appApi.get(`expensestatuses/${id}`);
    return response.data;
  }
};
