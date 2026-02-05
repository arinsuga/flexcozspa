'use client';

import { useVendors, useVendorMutations } from '@/hooks/useVendors';
import React, { useState } from 'react';
import Button from '@/components/common/Button';
import VendorModal from '@/components/features/vendors/VendorModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Vendor } from '@/services/vendorService';
import { TableSkeleton } from '@/components/common/Skeleton';

import SelectInput from '@/components/common/SelectInput';
import Input from '@/components/common/Input';
import Pagination from '@/components/common/Pagination';
import axios from 'axios';
import InfoDialog from '@/components/common/InfoDialog';


export default function VendorsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState('');

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const { data: vendorsResponse, isLoading, error } = useVendors({
    page,
    per_page: 10,
    search_query: searchQuery,
    search_column: searchColumn,
    sort_by: 'id',
    sort_order: 'desc'
  });

  const { createVendor, updateVendor, deleteVendor } = useVendorMutations();

  // Handle both direct array and paginated response formats
  const vendors = Array.isArray(vendorsResponse) 
    ? vendorsResponse 
    : vendorsResponse?.data || [];
    
  const meta = vendorsResponse && !Array.isArray(vendorsResponse) ? vendorsResponse : { current_page: 1, last_page: 1 };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | undefined>(undefined);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  
  // Modal states for notifications
  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info'
  });

  const [inUseModal, setInUseModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    item: Vendor | null;
  }>({
    isOpen: false,
    title: '',
    message: '',
    item: null
  });

  const showInfo = (title: string, message: string, variant: 'success' | 'error' | 'info' = 'info') => {
    setInfoModal({ isOpen: true, title, message, variant });
  };

  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  const handleCreate = () => {
    setEditingVendor(undefined);
    setFormErrors({});
    setIsModalOpen(true);
  };


  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormErrors({});
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
      showInfo('Success', `Vendor ${editingVendor ? 'updated' : 'created'} successfully!`, 'success');
    } catch (error: unknown) {
      if (error != null && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number; data: { errors: Record<string, string[]> } } };
        if (axiosError.response.status === 422) {
          setFormErrors(axiosError.response.data.errors);
        } else {
          console.error('App Error:', error);
          setIsModalOpen(false);
          showInfo('Error', 'An application error occurred. Please try again later.', 'error');
        }
      } else {
        console.error('App Error:', error);
        setIsModalOpen(false);
        showInfo('Error', 'An application error occurred. Please try again later.', 'error');
      }
    }
  };



  const handleConfirmDelete = async () => {
    if (vendorToDelete) {
      try {
        await deleteVendor.mutateAsync(vendorToDelete.id);
        setIsDeleteOpen(false);
        setVendorToDelete(null);
        showInfo('Success', 'Vendor deleted successfully!', 'success');
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
          setIsDeleteOpen(false);
          setInUseModal({
            isOpen: true,
            title: 'Vendor In Use',
            message: error?.response?.data?.message || 'This vendor is in use (by orders or ordersheet items) and cannot be physically deleted. Would you like to mark it as inactive instead?',
            item: vendorToDelete
          });
        } else {
          setIsDeleteOpen(false);
          showInfo('Error', 'Failed to delete vendor.', 'error');
        }
      }
    }
  };

  const handleMarkInactive = async () => {
    if (inUseModal.item) {
      try {
        await updateVendor.mutateAsync({ 
          id: inUseModal.item.id, 
          data: { is_active: 0 } 
        });
        setInUseModal(prev => ({ ...prev, isOpen: false, item: null }));
        showInfo('Success', 'Vendor marked as inactive!', 'success');
      } catch {
        showInfo('Error', 'Failed to mark vendor as inactive.', 'error');
      }
    }
  };

  if (isLoading) return <TableSkeleton cols={6} rows={8} />;
  if (error) return <div className="p-4 text-error">Error loading vendors</div>;

  return (
    <div className="space-y-6">


      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vendors</h1>
        <Button onClick={handleCreate} leftIcon="add">
          New Vendor
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-48">
                <SelectInput
                    options={[
                        {value: '', label: 'All Columns'},
                        {value: 'vendor_name', label: 'Vendor Name'},
                        {value: 'vendor_code', label: 'Vendor Code'},
                    ]}
                    value={searchColumn}
                    onChange={(val) => setSearchColumn(val as string)}
                    placeholder="Search By"
                    className="z-30" 
                />
            </div>
            <div className="flex-1 flex gap-2">
                <Input
                    placeholder="Search vendors..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <Button onClick={handleSearch} iconOnly={false} leftIcon="search">
                    Search
                </Button>
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden flex flex-col h-[600px]">
        <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
         <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vendor Type</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {vendors?.map((vendor: Vendor) => (
              <tr 
                key={vendor.id} 
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${!vendor.is_active ? 'opacity-60' : ''}`}
                onClick={() => handleEdit(vendor)}
              >
                 <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {vendor.vendor_code}
                </td>
                <td className="px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    <div className="flex flex-col gap-1">
                        <span>{vendor.vendor_name}</span>
                        {vendor.is_active == 0 && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 w-fit uppercase tracking-wider">
                                Inactive
                            </span>
                        )}
                    </div>
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {vendor.vendortype?.vendortype_name || '-'}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="truncate max-w-[200px]">{vendor.vendor_email}</div>
                    <div className="text-xs text-gray-400">{vendor.vendor_phone}</div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-center text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => handleEdit(vendor)}
                      className="text-primary hover:text-indigo-900"
                      title="Edit"
                    >
                      <span className="material-icons">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(vendor)}
                      className="text-error hover:text-red-900"
                      title="Delete"
                    >
                      <span className="material-icons">delete</span>
                    </button>
                   </div>
                </td>
              </tr>
            ))}
             {vendors?.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No vendors found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
       </div>
      </div>

      <div className="mt-4">
         <Pagination
            currentPage={meta.current_page || 1}
            lastPage={meta.last_page || 1}
            onPageChange={setPage}
         />
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


      <ConfirmDialog
        isOpen={inUseModal.isOpen}
        onClose={() => setInUseModal(prev => ({ ...prev, isOpen: false, item: null }))}
        onConfirm={handleMarkInactive}
        title={inUseModal.title}
        message={inUseModal.message}
        confirmLabel="Mark Inactive"
        variant="warning"
        isLoading={updateVendor.isPending}
      />

      <InfoDialog
        isOpen={infoModal.isOpen}
        onClose={() => setInfoModal(prev => ({ ...prev, isOpen: false }))}
        title={infoModal.title}
        message={infoModal.message}
        variant={infoModal.variant}
      />
    </div>

  );
}
