import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderSheetService } from '@/services/orderSheetService';

export const useOrderSheets = (orderId: string | number) => {
  return useQuery({
    queryKey: ['order-sheets', orderId],
    queryFn: () => orderSheetService.getByOrderId(orderId),
    enabled: !!orderId,
  });
};

export const useOrderSheetMutations = () => {
  const queryClient = useQueryClient();

  const saveSheet = useMutation({
    mutationFn: async ({ orderId, rows }: { orderId: string | number; rows: any[] }) => {
      return orderSheetService.saveSheet(orderId, rows);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order-sheets', variables.orderId] });
    },
  });

  return { saveSheet };
};
