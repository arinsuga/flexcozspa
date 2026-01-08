import { useQuery } from '@tanstack/react-query';
import { contractStatusService } from '@/services/contractStatusService';

export const useContractStatuses = (params?: any) => {
  return useQuery({
    queryKey: ['contract-statuses', params],
    queryFn: () => contractStatusService.getAll(params),
    staleTime: 0,
  });
};

export const useContractStatus = (id: string | number) => {
  return useQuery({
    queryKey: ['contract-status', id],
    queryFn: () => contractStatusService.getById(id),
    enabled: !!id,
  });
};
