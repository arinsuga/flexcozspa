import { useQuery } from '@tanstack/react-query';
import { expenseStatusService } from '@/services/expenseStatusService';

export const useExpenseStatuses = (params?: any) => {
  return useQuery({
    queryKey: ['expense-statuses', params],
    queryFn: () => expenseStatusService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
