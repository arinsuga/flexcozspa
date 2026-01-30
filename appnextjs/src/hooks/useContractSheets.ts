import { useQuery } from '@tanstack/react-query';
import { contractSheetService } from '@/services/contractSheetService';

export const useContractSheets = (contractId: string | number) => {
  return useQuery({
    queryKey: ['contract-sheets', contractId],
    queryFn: () => contractSheetService.getByContractId(contractId),
    enabled: !!contractId,
  });
};

export const useContractOrderSummaryByProjectAndContract = (projectId: string | number, contractId: string | number) => {
  return useQuery({
    queryKey: ['contract-order-summary', projectId, contractId],
    queryFn: () => contractSheetService.getSummaryByProjectAndContract(projectId, contractId),
    enabled: !!projectId && !!contractId,
  });
};
