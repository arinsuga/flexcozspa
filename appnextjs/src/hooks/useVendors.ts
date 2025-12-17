import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorService } from '@/services/vendorService';

export const useVendors = (params?: any) => {
  return useQuery({
    queryKey: ['vendors', params],
    queryFn: () => vendorService.getAll(params),
  });
};

export const useVendorMutations = () => {
  const queryClient = useQueryClient();

  const createVendor = useMutation({
    mutationFn: vendorService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: (error: any) => {
      if (error.response?.status !== 422) {
        console.error('Create Vendor Error:', JSON.stringify(error.response?.data || error.message, null, 2));
      }
    }
  });

  const updateVendor = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) => vendorService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: (error: any) => {
      if (error.response?.status !== 422) {
        console.error('Update Vendor Error:', JSON.stringify(error.response?.data || error.message, null, 2));
      }
    }
  });

  const deleteVendor = useMutation({
    mutationFn: vendorService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });

  return { createVendor, updateVendor, deleteVendor };
};
