'use client';

import { useVendors, useVendorMutations } from '@/hooks/useVendors';
import { useState } from 'react';
import Button from '@/components/common/Button';
import VendorModal from '@/components/features/vendors/VendorModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Vendor } from '@/services/vendorService';

export default function VendorsPage() {
  const { data: vendors, isLoading, error } = useVendors();
  const { createVendor, updateVendor, deleteVendor } = useVendorMutations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | undefined>(undefined);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  const handleCreate = () => {
    setEditingVendor(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (vendor: Vendor) => {
    setVendorToDelete(vendor);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (data: Partial<Vendor>) => {
    if (editingVendor) {
      await updateVendor.mutateAsync({ id: editingVendor.id, data });
    } else {
      await createVendor.mutateAsync(data);
    }
    setIsModalOpen(false);
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {vendors?.map((vendor: Vendor) => (
              <tr key={vendor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {vendor.name}
                    <div className="text-xs text-gray-500 font-normal">{vendor.address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div>{vendor.email}</div>
                    <div>{vendor.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                     ${vendor.status === 'active' ? 'bg-green-100 text-green-800' : 
                       vendor.status === 'blacklisted' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}
                   `}>
                        {vendor.status}
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
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
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
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Vendor"
        message={`Are you sure you want to delete ${vendorToDelete?.name}?`}
        variant="danger"
        isLoading={deleteVendor.isPending}
      />
    </div>
  );
}
