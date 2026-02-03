import { useQuery } from '@tanstack/react-query';
import { contractOrderSummaryService } from '@/services/contractOrderSummaryService';

export const useContractOrderSummary = (contractId: string | number, excludeOrderId?: string | number) => {
  return useQuery({
    queryKey: ['contract-order-summary', contractId, excludeOrderId],
    queryFn: () => {
      if (excludeOrderId && excludeOrderId !== 'new') {
        return contractOrderSummaryService.getByContractExcludingOrder(contractId, excludeOrderId);
      }
      return contractOrderSummaryService.getByContract(contractId);
    },
    enabled: !!contractId,
  });
};

export const useContractOrderSummaryDetail = (contractId: string | number, sheetId: string | number) => {
  return useQuery({
    queryKey: ['contract-order-summary', contractId, sheetId],
    queryFn: () => contractOrderSummaryService.getByContractAndSheet(contractId, sheetId),
    enabled: !!contractId && !!sheetId,
  });
};

export const useContractOrderSummaryByProject = (projectId: string | number, contractId: string | number) => {
  return useQuery({
    queryKey: ['contract-order-summary', projectId, contractId],
    queryFn: () => contractOrderSummaryService.getByProjectAndContract(projectId, contractId),
    enabled: !!projectId && !!contractId,
  });
};
