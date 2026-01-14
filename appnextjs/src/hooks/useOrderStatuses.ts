import { useQuery } from '@tanstack/react-query';
import { orderStatusService } from '@/services/orderStatusService';

export const useOrderStatuses = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['order-statuses', params],
    queryFn: () => orderStatusService.getAll(params),
    staleTime: 0,
  });
};

export const useOrderStatus = (id: string | number) => {
  return useQuery({
    queryKey: ['order-status', id],
    queryFn: () => orderStatusService.getById(id),
    enabled: !!id,
  });
};
