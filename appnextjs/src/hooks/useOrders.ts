import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/orderService';

export const useOrders = (params?: any) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderService.getAll(params),
  });
};

export const useOrder = (id: string | number) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getById(id),
    enabled: !!id,
  });
};

export const useOrderMutations = () => {
  const queryClient = useQueryClient();

  const createOrder = useMutation({
    mutationFn: orderService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      if (error.response?.status !== 422) {
        console.error('Create Order Error:', JSON.stringify(error.response?.data || error.message, null, 2));
      }
    }
  });

  const updateOrder = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) => orderService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
    },
    onError: (error: any) => {
      if (error.response?.status !== 422) {
        console.error('Update Order Error:', JSON.stringify(error.response?.data || error.message, null, 2));
      }
    }
  });

  const deleteOrder = useMutation({
    mutationFn: orderService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return { createOrder, updateOrder, deleteOrder };
};
