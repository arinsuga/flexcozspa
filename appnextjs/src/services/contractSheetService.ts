import { appApi } from './api';

export interface ContractSheet {
  id: number | string;
  project_id: number;
  contract_id: number;
  sheet_dt: string | null;
  sheet_type: number;
  sheetgroup_type: number;
  sheetgroup_id: number;
  sheetheader_id: number | null;
  sheet_code: string;
  sheet_name: string;
  sheet_description: string;
  sheet_notes: string;
  sheet_qty: number;
  sheet_price: number;
  sheet_grossamt: number;
  sheet_grossamt2?: number;
  sheet_discountrate: number;
  sheet_discountvalue: number;
  sheet_taxrate: number;
  sheet_taxvalue: number;
  sheet_netamt: number;
  sheet_netamt2?: number;
  sheet_realamt?: number;
  uom_id: number;
  uom_code: string;
  sheetgroup_seqno: number;
  sheet_seqno: number;
  is_active: number;
  ordersheets_count?: number;
  order_summary?: {
    order_amount: number;
  };
  ordersheets_sum_sheet_netamt?: number;
  created_at: string;
  updated_at: string;
}

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
  contract_amout: number; // Mapping backend 'contract_amout' typo
  contract_amount: number; // For consistency
  order_amount: number;
  balance: number;
}

export const contractSheetService = {
  getByContractId: async (contractId: number | string) => {
    const response = await appApi.get(`contracts/${contractId}/sheets`);
    return response.data;
  },
  
  saveSheet: async (contractId: number | string, data: any[]) => {
      // Depending on API, we might send all rows or diffs. 
      // Assuming a bulk update/replace endpoint or individual row CRUD.
      // For spreadsheet UX, usually bulk save or transactional save is preferred.
      // If API expects individual calls, we'd loop here.
      // Let's assume a bulk endpoint for simplicity based on typical spreadsheet apps.
      
      // If no bulk endpoint exists, we might need to map rows to create/update calls.
      // START_ASSUMPTION: We have a way to save sheets. If not, we will likely post to `contractsheets`
      
      // Attempting to post the whole array to a bulk sync or looping.
      // Given the prompt API list:
      // POST http://appapi.localhost/contractsheets (Create single?)
      // PUT http://appapi.localhost/contractsheets/{id} (Update single)
      
      // Implementing basic row-by-row save logic for now, or a bulk wrapper if feasible.
      // ideally the backend supports bulk. If not, we iterate.
      
      return Promise.all(data.map(row => {
          if (row.id) {
              return appApi.put(`contractsheets/${row.id}`, row);
          } else {
              return appApi.post(`contractsheets`, { ...row, contract_id: contractId });
          }
      }));
  },
  
  delete: async (sheetId: number | string) => {
      return appApi.delete(`contractsheets/${sheetId}`);
  },

  getSummaryByContract: async (contractId: number | string) => {
    const response = await appApi.get(`contractsheets/summary/${contractId}`);
    return response.data;
  },

  getSummaryByContractAndSheet: async (contractId: number | string, sheetId: number | string) => {
    const response = await appApi.get(`contractsheets/summary/${contractId}/${sheetId}`);
    return response.data;
  },

  getSummaryByProjectAndContract: async (projectId: number | string, contractId: number | string) => {
    const response = await appApi.get(`contractsheets/summary/project/${projectId}/contract/${contractId}`);
    return response.data;
  }
};
