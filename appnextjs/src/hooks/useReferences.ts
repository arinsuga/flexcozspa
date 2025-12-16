import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { referenceService } from '@/services/referenceService';

export const useReferences = (params?: any) => {
  return useQuery({
    queryKey: ['references', params],
    queryFn: () => referenceService.getAll(params),
  });
};

export const useReferenceMutations = () => {
  const queryClient = useQueryClient();

  const createReference = useMutation({
    mutationFn: referenceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['references'] });
    },
  });

  const updateReference = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) => referenceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['references'] });
    },
  });

  const deleteReference = useMutation({
    mutationFn: referenceService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['references'] });
    },
  });

  return { createReference, updateReference, deleteReference };
};
