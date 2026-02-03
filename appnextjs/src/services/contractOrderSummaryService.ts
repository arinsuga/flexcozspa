import { appApi } from './api';

export interface ContractOrderSummary {
  project_id: number;
  project_number: string;
  project_name: string;
  contract_id: number;
  contract_number: string;
  contractsheet_id: number;
  sheetgroup_type: number;
  sheetgroup_id: number;
  sheetgroup_code: string;
  sheet_code: string;
  sheet_name: string;
  uom_id: number | null;
  uom_code: string | null;
  contract_amount: number;
  order_amount: number;
  available_amount: number;
  balance?: number;
}

export const contractOrderSummaryService = {
  getByContract: async (contractId: number | string) => {
    const response = await appApi.get(`contractsheets/summary/${contractId}`);
    return response.data;
  },

  getByContractExcludingOrder: async (contractId: number | string, orderId: number | string) => {
    const response = await appApi.get(`contractsheets/summary/${contractId}/exclude-order/${orderId}`);
    return response.data;
  },

  getByContractAndSheet: async (contractId: number | string, sheetId: number | string) => {
    const response = await appApi.get(`contractsheets/summary/${contractId}/${sheetId}`);
    return response.data;
  },

  getByProjectAndContract: async (projectId: number | string, contractId: number | string) => {
    const response = await appApi.get(`contractsheets/summary/project/${projectId}/contract/${contractId}`);
    return response.data;
  }
};
