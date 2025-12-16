import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractSheetService, ContractSheet } from '@/services/contractSheetService';

export const useContractSheets = (contractId: string | number) => {
  return useQuery({
    queryKey: ['contract-sheets', contractId],
    queryFn: () => contractSheetService.getByContractId(contractId),
    enabled: !!contractId,
  });
};

export const useContractSheetMutations = () => {
  const queryClient = useQueryClient();

  // This handles saving multiple rows at once (bulk or parallel)
  const saveSheet = useMutation({
    mutationFn: async ({ contractId, rows }: { contractId: string | number; rows: Partial<ContractSheet>[] }) => {
      return contractSheetService.saveSheet(contractId, rows);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contract-sheets', variables.contractId] });
    },
  });

  const deleteSheetRow = useMutation({
      mutationFn: contractSheetService.delete,
      onSuccess: () => {
          // Ideally invalidate, but we might need context of which contract
          // queryClient.invalidateQueries({ queryKey: ['contract-sheets'] });
      }
  });

  return { saveSheet, deleteSheetRow };
};
