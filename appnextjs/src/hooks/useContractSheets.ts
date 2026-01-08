import { useQuery } from '@tanstack/react-query';
import { contractSheetService } from '@/services/contractSheetService';

export const useContractSheets = (contractId: string | number) => {
  return useQuery({
    queryKey: ['contract-sheets', contractId],
    queryFn: () => contractSheetService.getByContractId(contractId),
    enabled: !!contractId,
  });
};
