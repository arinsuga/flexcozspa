import { appApi } from './api';

export interface ContractSheet {
  id: number;
  project_id: number;
  contract_id: number;
  sheet_dt: string;
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
  sheet_discountrate: number;
  sheet_discountvalue: number;
  sheet_taxrate: number;
  sheet_taxvalue: number;
  sheet_netamt: number;
  uom_id: number;
  uom_name: string;
  sheetgroup_seqno: number;
  sheet_seqno: number;
  created_at: string;
  updated_at: string;
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
  }
};
