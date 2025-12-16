import { appApi } from './api';

export interface OrderSheet {
  id: number;
  order_id: number;
  item_name: string;
  description?: string;
  qty: number;
  unit_price: number;
  total_price: number;
}

export const orderSheetService = {
  getByOrderId: async (orderId: number | string) => {
    // Correct endpoint based on prompts usually is by orderId
    // Prompt says: GET http://appapi.localhost/ordersheets/order/{orderId}
    const response = await appApi.get(`ordersheets/order/${orderId}`);
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
