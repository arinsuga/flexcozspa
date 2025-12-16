import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractService } from '@/services/contractService';

export const useContracts = (params?: any) => {
  return useQuery({
    queryKey: ['contracts', params],
    queryFn: () => contractService.getAll(params),
  });
};

export const useContract = (id: string | number) => {
  return useQuery({
    queryKey: ['contract', id],
    queryFn: () => contractService.getById(id),
    enabled: !!id,
  });
};

export const useContractMutations = () => {
  const queryClient = useQueryClient();

  const createContract = useMutation({
    mutationFn: contractService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });

  const updateContract = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) => contractService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract', variables.id] });
    },
  });

  const deleteContract = useMutation({
    mutationFn: contractService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });

  return { createContract, updateContract, deleteContract };
};
