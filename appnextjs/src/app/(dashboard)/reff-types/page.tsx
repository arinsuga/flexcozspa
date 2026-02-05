'use client';

import { useReffTypes, useReffTypeMutations } from '@/hooks/useReffTypes';
import React, { useState } from 'react';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { ReffType } from '@/services/refftypeService';
import { TableSkeleton } from '@/components/common/Skeleton';
import SelectInput from '@/components/common/SelectInput';
import Pagination from '@/components/common/Pagination';
import axios from 'axios';
import InfoDialog from '@/components/common/InfoDialog';


export default function ReffTypesPage() {
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

  const { data: refftypesResponse, isLoading, error } = useReffTypes({
    page,
    per_page: 10,
    search_query: searchQuery,
    search_column: searchColumn,
    sort_by: 'id',
    sort_order: 'desc'
  });
  const { createReffType, updateReffType, deleteReffType } = useReffTypeMutations();

  // Handle both direct array and paginated response formats
  const refftypes = refftypesResponse?.data && Array.isArray(refftypesResponse.data)
    ? refftypesResponse.data
    : Array.isArray(refftypesResponse)
      ? refftypesResponse
      : [];
    
  const meta = refftypesResponse?.current_page 
    ? refftypesResponse 
    : { current_page: 1, last_page: 1 };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReffType, setEditingReffType] = useState<ReffType | undefined>(undefined);
  const [formData, setFormData] = useState<Partial<ReffType>>({});
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
    item: ReffType | null;
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
  const [refftypeToDelete, setReffTypeToDelete] = useState<ReffType | null>(null);

  const handleCreate = () => {
    setEditingReffType(undefined);
    setFormData({});
    setFormErrors({});
    setIsModalOpen(true);
  };


  const handleEdit = (refftype: ReffType) => {
    setEditingReffType(refftype);
    setFormData(refftype);
    setFormErrors({});
    setIsModalOpen(true);
  };


  const handleDeleteClick = (refftype: ReffType) => {
    setReffTypeToDelete(refftype);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReffType) {
        await updateReffType.mutateAsync({ id: editingReffType.id, data: formData });
      } else {
        await createReffType.mutateAsync(formData);
      }
      setIsModalOpen(false);
      showInfo('Success', `Reference Type ${editingReffType ? 'updated' : 'created'} successfully!`, 'success');
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
    if (refftypeToDelete) {
      try {
        await deleteReffType.mutateAsync(refftypeToDelete.id);
        setIsDeleteOpen(false);
        setReffTypeToDelete(null);
        showInfo('Success', 'Reference Type deleted successfully!', 'success');
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
          setIsDeleteOpen(false);
          setInUseModal({
            isOpen: true,
            title: 'Reference Type In Use',
            message: error?.response?.data?.message || 'This reference type is in use (by ordersheet items) and cannot be physically deleted. Would you like to mark it as inactive instead?',
            item: refftypeToDelete
          });
        } else {
          setIsDeleteOpen(false);
          showInfo('Error', 'Failed to delete reference type.', 'error');
        }
      }
    }
  };

  const handleMarkInactive = async () => {
    if (inUseModal.item) {
      try {
        await updateReffType.mutateAsync({ 
          id: inUseModal.item.id, 
          data: { is_active: 0 } 
        });
        setInUseModal(prev => ({ ...prev, isOpen: false, item: null }));
        showInfo('Success', 'Reference Type marked as inactive!', 'success');
      } catch {
        showInfo('Error', 'Failed to mark reference type as inactive.', 'error');
      }
    }
  };

  if (isLoading) return <TableSkeleton cols={4} rows={8} />;
  if (error) return <div className="p-4 text-error">Error loading Reference Types</div>;

  return (
    <div className="space-y-6">


      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reference Types</h1>
        <Button onClick={handleCreate} leftIcon="add">
          New Reference Type
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-48">
                <SelectInput
                    options={[
                        {value: '', label: 'All Columns'},
                        {value: 'refftype_code', label: 'Code'},
                        {value: 'refftype_name', label: 'Name'},
                    ]}
                    value={searchColumn}
                    onChange={(val) => setSearchColumn(val as string)}
                    placeholder="Search By"
                    className="z-30" 
                />
            </div>
            <div className="flex-1 flex gap-2">
                <Input
                    placeholder="Search reference types..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {refftypes?.map((rt: ReffType) => (
              <tr key={rt.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!rt.is_active ? 'opacity-60' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{rt.refftype_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{rt.refftype_code || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{rt.refftype_description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${!!rt.is_active ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'}`}>
                    {!!rt.is_active ? 'active' : 'inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-4">
                    <button 
                      onClick={() => handleEdit(rt)}
                      className="text-primary hover:text-indigo-900"
                      title="Edit"
                    >
                      <span className="material-icons">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(rt)}
                      className="text-error hover:text-red-900"
                      title="Delete"
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
             {refftypes?.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No reference types found.
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
        title={editingReffType ? 'Edit Reference Type' : 'New Reference Type'}
        size="md"
      >
          <form onSubmit={handleSubmit} className="space-y-4">
               <Input
                   label="Name"
                   value={formData.refftype_name || ''}
                   onChange={(e) => setFormData({...formData, refftype_name: e.target.value})}
                   required
                   error={formErrors?.refftype_name?.[0]}
               />
               <Input
                   label="Code"
                   value={formData.refftype_code || ''}
                   onChange={(e) => setFormData({...formData, refftype_code: e.target.value})}
                   error={formErrors?.refftype_code?.[0]}
               />
               <Input
                   label="Description"
                   value={formData.refftype_description || ''}
                   onChange={(e) => setFormData({...formData, refftype_description: e.target.value})}
                   error={formErrors?.refftype_description?.[0]}
               />
               <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                    Cancel
                    </Button>
                    <Button variant="primary" type="submit" isLoading={createReffType.isPending || updateReffType.isPending}>
                    {editingReffType ? 'Update' : 'Create'}
                    </Button>
               </div>
          </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Reference Type"
        message={`Are you sure you want to delete ${refftypeToDelete?.refftype_name}?`}
        variant="danger"
        isLoading={deleteReffType.isPending}
      />

      <ConfirmDialog
        isOpen={inUseModal.isOpen}
        onClose={() => setInUseModal(prev => ({ ...prev, isOpen: false, item: null }))}
        onConfirm={handleMarkInactive}
        title={inUseModal.title}
        message={inUseModal.message}
        confirmLabel="Mark Inactive"
        variant="warning"
        isLoading={updateReffType.isPending}
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
