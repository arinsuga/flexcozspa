'use client';

import { useVendorTypes, useVendorTypeMutations } from '@/hooks/useVendorTypes';
import React, { useState } from 'react';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { VendorType } from '@/services/vendorTypeService';
import { TableSkeleton } from '@/components/common/Skeleton';
import SelectInput from '@/components/common/SelectInput';
import Pagination from '@/components/common/Pagination';
import axios from 'axios';
import InfoDialog from '@/components/common/InfoDialog';


export default function VendorTypesPage() {
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

  const { data: vendorTypesResponse, isLoading, error } = useVendorTypes({
    page,
    per_page: 10,
    search_query: searchQuery,
    search_column: searchColumn,
    sort_by: 'id',
    sort_order: 'desc'
  });
  const { createVendorType, updateVendorType, deleteVendorType } = useVendorTypeMutations();

  // Handle both direct array and paginated response formats
  const vendorTypes = vendorTypesResponse?.data && Array.isArray(vendorTypesResponse.data)
    ? vendorTypesResponse.data
    : Array.isArray(vendorTypesResponse)
      ? vendorTypesResponse
      : [];
    
  const meta = vendorTypesResponse?.current_page 
    ? vendorTypesResponse 
    : { current_page: 1, last_page: 1 };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendorType, setEditingVendorType] = useState<VendorType | undefined>(undefined);
  const [formData, setFormData] = useState<Partial<VendorType>>({});
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
    item: VendorType | null;
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
  const [vendorTypeToDelete, setVendorTypeToDelete] = useState<VendorType | null>(null);

  const handleCreate = () => {
    setEditingVendorType(undefined);
    setFormData({ is_active: 1 });
    setFormErrors({});
    setIsModalOpen(true);
  };


  const handleEdit = (vendorType: VendorType) => {
    setEditingVendorType(vendorType);
    setFormData(vendorType);
    setFormErrors({});
    setIsModalOpen(true);
  };


  const handleDeleteClick = (vendorType: VendorType) => {
    setVendorTypeToDelete(vendorType);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVendorType) {
        await updateVendorType.mutateAsync({ id: editingVendorType.id, data: formData });
      } else {
        await createVendorType.mutateAsync(formData);
      }
      setIsModalOpen(false);
      showInfo('Success', `Vendor Type ${editingVendorType ? 'updated' : 'created'} successfully!`, 'success');
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
    if (vendorTypeToDelete) {
      try {
        await deleteVendorType.mutateAsync(vendorTypeToDelete.id);
        setIsDeleteOpen(false);
        setVendorTypeToDelete(null);
        showInfo('Success', 'Vendor Type deleted successfully!', 'success');
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
          setIsDeleteOpen(false);
          setInUseModal({
            isOpen: true,
            title: 'Vendor Type In Use',
            message: error?.response?.data?.message || 'This vendor type is in use (by vendors) and cannot be physically deleted. Would you like to mark it as inactive instead?',
            item: vendorTypeToDelete
          });
        } else {
          setIsDeleteOpen(false);
          showInfo('Error', 'Failed to delete vendor type.', 'error');
        }
      }
    }
  };

  const handleMarkInactive = async () => {
    if (inUseModal.item) {
      try {
        await updateVendorType.mutateAsync({ 
          id: inUseModal.item.id, 
          data: { is_active: 0 } 
        });
        setInUseModal(prev => ({ ...prev, isOpen: false, item: null }));
        showInfo('Success', 'Vendor Type marked as inactive!', 'success');
      } catch {
        showInfo('Error', 'Failed to mark vendor type as inactive.', 'error');
      }
    }
  };

  if (isLoading) return <TableSkeleton cols={5} rows={8} />;
  if (error) return <div className="p-4 text-error">Error loading Vendor Types</div>;

  return (
    <div className="space-y-6">


      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vendor Types</h1>
        <Button onClick={handleCreate} leftIcon="add">
          New Vendor Type
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-48">
                <SelectInput
                    options={[
                        {value: '', label: 'All Columns'},
                        {value: 'vendortype_code', label: 'Code'},
                        {value: 'vendortype_name', label: 'Name'},
                    ]}
                    value={searchColumn}
                    onChange={(val) => setSearchColumn(val as string)}
                    placeholder="Search By"
                    className="z-30" 
                />
            </div>
            <div className="flex-1 flex gap-2">
                <Input
                    placeholder="Search vendor types..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {vendorTypes?.map((vt: VendorType) => (
              <tr key={vt.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!vt.is_active ? 'opacity-60' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{vt.vendortype_code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{vt.vendortype_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{vt.vendortype_description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${vt.is_active ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'}`}>
                    {vt.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-4">
                    <button 
                      onClick={() => handleEdit(vt)}
                      className="text-primary hover:text-indigo-900"
                      title="Edit"
                    >
                      <span className="material-icons">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(vt)}
                      className="text-error hover:text-red-900"
                      title="Delete"
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
             {vendorTypes?.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No Vendor Types found.
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVendorType ? 'Edit Vendor Type' : 'New Vendor Type'}
        size="md"
      >
          <form onSubmit={handleSubmit} className="space-y-4">
               <Input
                   label="Code"
                   value={formData.vendortype_code || ''}
                   onChange={(e) => setFormData({...formData, vendortype_code: e.target.value.toUpperCase()})}
                   required
                   error={formErrors?.vendortype_code?.[0]}
                   placeholder="e.g. SUPPLIER"
               />
               <Input
                   label="Name"
                   value={formData.vendortype_name || ''}
                   onChange={(e) => setFormData({...formData, vendortype_name: e.target.value})}
                   required
                   error={formErrors?.vendortype_name?.[0]}
                   placeholder="e.g. Supplier"
               />
               <Input
                   label="Description"
                   value={formData.vendortype_description || ''}
                   onChange={(e) => setFormData({...formData, vendortype_description: e.target.value})}
                   error={formErrors?.vendortype_description?.[0]}
               />
               <div className="flex items-center gap-2">
                 <input 
                   type="checkbox" 
                   id="is_active"
                   checked={formData.is_active === 1}
                   onChange={(e) => setFormData({...formData, is_active: e.target.checked ? 1 : 0})}
                   className="rounded border-gray-300 text-primary focus:ring-primary"
                 />
                 <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
               </div>
               
               <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                    Cancel
                    </Button>
                    <Button variant="primary" type="submit" isLoading={createVendorType.isPending || updateVendorType.isPending}>
                    {editingVendorType ? 'Update' : 'Create'}
                    </Button>
               </div>
          </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Vendor Type"
        message={`Are you sure you want to delete ${vendorTypeToDelete?.vendortype_name}?`}
        variant="danger"
        isLoading={deleteVendorType.isPending}
      />

      <ConfirmDialog
        isOpen={inUseModal.isOpen}
        onClose={() => setInUseModal(prev => ({ ...prev, isOpen: false, item: null }))}
        onConfirm={handleMarkInactive}
        title={inUseModal.title}
        message={inUseModal.message}
        confirmLabel="Mark Inactive"
        variant="warning"
        isLoading={updateVendorType.isPending}
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
