import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { uomService } from '@/services/uomService';

export const useUOMs = (params?: any) => {
  return useQuery({
    queryKey: ['uoms', params],
    queryFn: () => uomService.getAll(params),
  });
};

export const useUOMMutations = () => {
  const queryClient = useQueryClient();

  const createUOM = useMutation({
    mutationFn: uomService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uoms'] });
    },
    onError: (error: any) => {
      if (error.response?.status !== 422) {
        console.error('Create UOM Error:', JSON.stringify(error.response?.data || error.message, null, 2));
      }
    }
  });

  const updateUOM = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) => uomService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uoms'] });
    },
    onError: (error: any) => {
      if (error.response?.status !== 422) {
        console.error('Update UOM Error:', JSON.stringify(error.response?.data || error.message, null, 2));
      }
    }
  });

  const deleteUOM = useMutation({
    mutationFn: uomService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uoms'] });
    },
  });

  return { createUOM, updateUOM, deleteUOM };
};
