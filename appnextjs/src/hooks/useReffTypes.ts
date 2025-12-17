import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { refftypeService } from '@/services/refftypeService';

export const useReffTypes = (params?: any) => {
  return useQuery({
    queryKey: ['refftypes', params],
    queryFn: () => refftypeService.getAll(params),
  });
};

export const useReffTypeMutations = () => {
  const queryClient = useQueryClient();

  const createReffType = useMutation({
    mutationFn: refftypeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refftypes'] });
    },
    onError: (error: any) => {
      if (error.response?.status !== 422) {
        console.error('Create ReffType Error:', JSON.stringify(error.response?.data || error.message, null, 2));
      }
    }
  });

  const updateReffType = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) => refftypeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refftypes'] });
    },
    onError: (error: any) => {
      if (error.response?.status !== 422) {
        console.error('Update ReffType Error:', JSON.stringify(error.response?.data || error.message, null, 2));
      }
    }
  });

  const deleteReffType = useMutation({
    mutationFn: refftypeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refftypes'] });
    },
  });

  return { createReffType, updateReffType, deleteReffType };
};
