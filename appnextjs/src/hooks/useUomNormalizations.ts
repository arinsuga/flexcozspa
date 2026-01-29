import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import uomNormalizationService, { UomNormalization } from '@/services/uomNormalizationService';

export function useUomNormalizations() {
  return useQuery({
    queryKey: ['uomNormalizations'],
    queryFn: () => uomNormalizationService.getAll(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useUomNormalization(id: number) {
  return useQuery({
    queryKey: ['uomNormalization', id],
    queryFn: () => uomNormalizationService.getById(id),
    enabled: !!id,
  });
}

export function useUomNormalizationMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: Partial<UomNormalization>) => uomNormalizationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uomNormalizations'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UomNormalization> }) =>
      uomNormalizationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uomNormalizations'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => uomNormalizationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uomNormalizations'] });
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  };
}
