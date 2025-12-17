'use client';

import { useVendors, useVendorMutations } from '@/hooks/useVendors';
import { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import VendorModal from '@/components/features/vendors/VendorModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Vendor } from '@/services/vendorService';
import { vendorTypeService } from '@/services/vendorTypeService';

export default function VendorsPage() {
  const { data: vendorsResponse, isLoading, error } = useVendors();
  const { createVendor, updateVendor, deleteVendor } = useVendorMutations();
  const [vendorTypeMap, setVendorTypeMap] = useState<Record<number, string>>({});

  // Handle both direct array and paginated response formats
  const vendors = Array.isArray(vendorsResponse) 
    ? vendorsResponse 
    : vendorsResponse?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | undefined>(undefined);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [appError, setAppError] = useState<string | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  useEffect(() => {
    const fetchVendorTypes = async () => {
      try {
        const data = await vendorTypeService.getAll();
        const types = Array.isArray(data) ? data : data.data || [];
        const map: Record<number, string> = {};
        types.forEach((type: any) => {
            map[type.id] = type.vendortype_name;
        });
        setVendorTypeMap(map);
      } catch (err) {
        console.error('Failed to load vendor types', err);
      }
    };
    fetchVendorTypes();
  }, []);

  const handleCreate = () => {
    setEditingVendor(undefined);
    setFormErrors({});
    setAppError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormErrors({});
    setAppError(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (vendor: Vendor) => {
    setVendorToDelete(vendor);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (data: Partial<Vendor>) => {
    try {
      if (editingVendor) {
        await updateVendor.mutateAsync({ id: editingVendor.id, data });
      } else {
        await createVendor.mutateAsync(data);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      if (error.response?.status === 422) {
        setFormErrors(error.response.data.errors);
      } else {
        console.error('App Error:', error);
        setAppError("An application error occurred. Please try again later.");
        setIsModalOpen(false);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (vendorToDelete) {
      await deleteVendor.mutateAsync(vendorToDelete.id);
      setIsDeleteOpen(false);
      setVendorToDelete(null);
    }
  };

  if (isLoading) return <div className="p-4">Loading vendors...</div>;
  if (error) return <div className="p-4 text-error">Error loading vendors</div>;

  return (
    <div className="space-y-6">
      {appError && (
        <div className="bg-red-50 border-l-4 border-error p-4 relative dark:bg-red-900/20 dark:border-red-500">
            <div className="flex">
                <div className="flex-shrink-0">
                    <span className="text-error">⚠️</span>
                </div>
                <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-200">
                        {appError}
                    </p>
                </div>
                <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                        <button
                            type="button"
                            onClick={() => setAppError(null)}
                            className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50 dark:bg-transparent dark:hover:bg-red-900/40"
                        >
                            <span className="sr-only">Dismiss</span>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vendors</h1>
        <Button onClick={handleCreate} leftIcon="add">
          New Vendor
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vendor Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {vendors?.map((vendor: Vendor) => (
              <tr key={vendor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {vendor.vendor_code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {vendor.vendor_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {vendorTypeMap[vendor.vendortype_id] || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div>{vendor.vendor_email}</div>
                    <div>{vendor.vendor_phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                     ${vendor.is_active === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                   `}>
                        {vendor.is_active === 1 ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(vendor)}
                    className="text-primary hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(vendor)}
                    className="text-error hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
             {vendors?.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No vendors found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <VendorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingVendor}
        isLoading={createVendor.isPending || updateVendor.isPending}
        errors={formErrors}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Vendor"
        message={`Are you sure you want to delete ${vendorToDelete?.vendor_name}?`}
        variant="danger"
        isLoading={deleteVendor.isPending}
      />
    </div>
  );
}
