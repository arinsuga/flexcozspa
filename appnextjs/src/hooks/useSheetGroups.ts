import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sheetGroupService } from '@/services/sheetGroupService';

export const useSheetGroups = (params?: any) => {
  return useQuery({
    queryKey: ['sheetgroups', params],
    queryFn: () => sheetGroupService.getAll(params),
  });
};

export const useSheetGroupsByType = (type: number) => {
  return useQuery({
    queryKey: ['sheetgroups', 'type', type],
    queryFn: () => sheetGroupService.getByType(type),
  });
};

export const useSheetGroupMutations = () => {
  const queryClient = useQueryClient();

  const createSheetGroup = useMutation({
    mutationFn: sheetGroupService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sheetgroups'] });
    },
  });

  const updateSheetGroup = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) => sheetGroupService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sheetgroups'] });
    },
  });

  const deleteSheetGroup = useMutation({
    mutationFn: sheetGroupService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sheetgroups'] });
    },
  });

  return { createSheetGroup, updateSheetGroup, deleteSheetGroup };
};
