import { appApi } from './api';
import { OrderSheet } from './orderSheetService';

export interface ExpenseStatus {
  id: number;
  name: string;
  description?: string;
}

export interface Expense {
  id: number;
  project_id: number;
  contract_id: number;
  order_id: number;
  expense_dt: string;
  expense_number: string;
  expense_description: string;
  expense_pic: string;
  expensestatus_id: number;
  created_at?: string;
  updated_at?: string;
  status?: ExpenseStatus;
  project?: { project_name: string; project_number: string; id: number };
  contract?: { contract_name: string; contract_number: string; id: number };
  order?: { order_number: string; id: number };
  ordersheets?: OrderSheet[];
}

export const expenseService = {
  getAll: async (params?: Record<string, unknown>) => {
    const response = await appApi.get('expenses', { params });
    return response.data;
  },
  getById: async (id: number | string) => {
    const response = await appApi.get(`expenses/${id}`);
    return response.data;
  },
  create: async (data: Partial<Expense>) => {
    const response = await appApi.post('expenses', data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Expense>) => {
    const response = await appApi.put(`expenses/${id}`, data);
    return response.data;
  },
  delete: async (id: number | string) => {
    const response = await appApi.delete(`expenses/${id}`);
    return response.data;
  },
  getByContractId: async (contractId: number | string) => {
      const response = await appApi.get(`expenses/contract/${contractId}`);
      return response.data;
  },
  getByProjectId: async (projectId: number | string) => {
      const response = await appApi.get(`expenses/project/${projectId}`);
      return response.data;
  }
};
