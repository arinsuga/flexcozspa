import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService } from '@/services/expenseService';

export const useExpenses = (params?: any) => {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => expenseService.getAll(params),
    staleTime: 0,
  });
};

export const useExpense = (id: string | number) => {
  return useQuery({
    queryKey: ['expense', id],
    queryFn: () => expenseService.getById(id),
    enabled: !!id,
    staleTime: 0,
  });
};

export const useExpenseMutations = () => {
  const queryClient = useQueryClient();

  const createExpense = useMutation({
    mutationFn: expenseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: (error: any) => {
      if (error.response?.status !== 422) {
        console.error('Create Expense Error:', JSON.stringify(error.response?.data || error.message, null, 2));
      }
    }
  });

  const updateExpense = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) => expenseService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense', variables.id] });
    },
    onError: (error: any) => {
      if (error.response?.status !== 422) {
        console.error('Update Expense Error:', JSON.stringify(error.response?.data || error.message, null, 2));
      }
    }
  });

  const deleteExpense = useMutation({
    mutationFn: expenseService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  return { createExpense, updateExpense, deleteExpense };
};
