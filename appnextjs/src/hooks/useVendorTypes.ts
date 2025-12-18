import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorTypeService } from '@/services/vendorTypeService';

export const useVendorTypes = (params?: any) => {
  return useQuery({
    queryKey: ['vendortypes', params],
    queryFn: () => vendorTypeService.getAll(params),
  });
};

export const useVendorTypeMutations = () => {
  const queryClient = useQueryClient();

  const createVendorType = useMutation({
    mutationFn: vendorTypeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendortypes'] });
    },
    onError: (error: any) => {
      if (error.response?.status !== 422) {
        console.error('Create Vendor Type Error:', JSON.stringify(error.response?.data || error.message, null, 2));
      }
    }
  });

  const updateVendorType = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) => vendorTypeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendortypes'] });
    },
    onError: (error: any) => {
      if (error.response?.status !== 422) {
        console.error('Update Vendor Type Error:', JSON.stringify(error.response?.data || error.message, null, 2));
      }
    }
  });

  const deleteVendorType = useMutation({
    mutationFn: vendorTypeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendortypes'] });
    },
  });

  return { createVendorType, updateVendorType, deleteVendorType };
};
