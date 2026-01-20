import { appApi } from './api';

export interface OrderRecapHeader {
  project_name: string;
  project_address: string;
  project_number: string;
  schedule: string | null;
  period: string;
}

export interface OrderRecapRow {
  sheetgroup_id: number;
  code: string;
  name: string;
  rap_amount: number;
  expense_weight: number;
  expense_amount: number;
  balance_weight: number;
  balance_amount: number;
}

export interface OrderRecapTotals {
  rap: number;
  expense: number;
  balance: number;
}

export interface OrderRecapResponse {
  header: OrderRecapHeader;
  rows: OrderRecapRow[];
  totals: OrderRecapTotals;
}

export const reportService = {
  getOrderRecap: async (projectId: number, contractId: number): Promise<OrderRecapResponse> => {
    const response = await appApi.get('/reports/order-recap', {
      params: { project_id: projectId, contract_id: contractId },
    });
    return response.data;
  },
};
