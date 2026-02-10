import { appApi } from './api';

export interface OrderSheet {
  id: number;
  order_id: number;
  sheet_code: string;
  sheet_refftypeid?: number;
  sheet_reffno?: string;
  sheet_reffnodate?: string;
  vendor_id?: number;
  vendor_name?: string;
  sheet_description?: string;
  sheet_qty: number;
  uom_code?: string;
  sheet_price: number;
  sheet_grossamt: number;
  sheet_netamt: number;
  sheet_type?: number;
  sheetgroup_id?: number;
  sheetgroup_type?: number;
  sheet_seqno?: number;
  available_amount?: number;
  project?: any;
  contract?: any;
  contractsheet?: any;
  order?: any;
  sheetgroup?: any;
  vendortype?: any;
  vendor?: any;
  uom?: any;
  validation_errors?: string[];
}

export const orderSheetService = {
  getByOrderId: async (orderId: number | string) => {
    // Use optimized endpoint that only loads vendor and uom relationships
    const response = await appApi.get(`ordersheets/order/${orderId}/optimized`);
    return response.data;
  },
  
  saveSheet: async (orderId: number | string, data: any[]) => {

      // Similar implementation to contract sheets, handling bulk or iterative save
      // Prompt says: POST http://appapi.localhost/ordersheets (Create?)
      // PUT http://appapi.localhost/ordersheets/{ordersheet} (Update)
      
      return Promise.all(data.map(row => {
          if (row.id) {
              return appApi.put(`ordersheets/${row.id}`, row);
          } else {
              return appApi.post(`ordersheets`, { ...row, order_id: orderId });
          }
      }));
  },
  
  delete: async (id: number | string) => {
      return appApi.delete(`ordersheets/${id}`);
  }
};
