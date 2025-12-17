'use client';

import { useSheetGroups, useSheetGroupMutations } from '@/hooks/useSheetGroups';
import { useState } from 'react';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { SheetGroup } from '@/services/sheetGroupService';
import SelectInput from '@/components/common/SelectInput';

export default function SheetGroupsPage() {
  const { data: sheetgroups, isLoading, error } = useSheetGroups();
  const { createSheetGroup, updateSheetGroup, deleteSheetGroup } = useSheetGroupMutations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSheetGroup, setEditingSheetGroup] = useState<SheetGroup | undefined>(undefined);
  const [formData, setFormData] = useState<Partial<SheetGroup>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [appError, setAppError] = useState<string | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [sheetgroupToDelete, setSheetGroupToDelete] = useState<SheetGroup | null>(null);

  const [filterType, setFilterType] = useState<string>('all');

  const handleCreate = () => {
    setEditingSheetGroup(undefined);
    setFormData({});
    setFormErrors({});
    setAppError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sheetgroup: SheetGroup) => {
    setEditingSheetGroup(sheetgroup);
    setFormData(sheetgroup);
    setFormErrors({});
    setAppError(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (sheetgroup: SheetGroup) => {
    setSheetGroupToDelete(sheetgroup);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSheetGroup) {
        await updateSheetGroup.mutateAsync({ id: editingSheetGroup.id, data: formData });
      } else {
        await createSheetGroup.mutateAsync(formData);
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
    if (sheetgroupToDelete) {
      await deleteSheetGroup.mutateAsync(sheetgroupToDelete.id);
      setIsDeleteOpen(false);
      setSheetGroupToDelete(null);
    }
  };

  const getTypeLabel = (type: number) => {
    return type === 0 ? 'Work' : 'Cost';
  };

  const filteredSheetGroups = sheetgroups?.data?.filter((sg: SheetGroup) => {
    if (filterType === 'all') return true;
    return sg.sheetgroup_type === parseInt(filterType);
  }) || [];

  if (isLoading) return <div className="p-4">Loading Sheet Groups...</div>;
  if (error) return <div className="p-4 text-error">Error loading Sheet Groups</div>;

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sheet Groups</h1>
        <Button onClick={handleCreate} leftIcon="add">
          New Sheet Group
        </Button>
      </div>

      {/* Filter by Type */}
      <div className="flex gap-2">
        <Button 
          variant={filterType === 'all' ? 'primary' : 'ghost'} 
          size="sm"
          onClick={() => setFilterType('all')}
        >
          All
        </Button>
        <Button 
          variant={filterType === '0' ? 'primary' : 'ghost'} 
          size="sm"
          onClick={() => setFilterType('0')}
        >
          Work
        </Button>
        <Button 
          variant={filterType === '1' ? 'primary' : 'ghost'} 
          size="sm"
          onClick={() => setFilterType('1')}
        >
          Cost
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredSheetGroups.map((sheetgroup: SheetGroup) => (
              <tr key={sheetgroup.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{sheetgroup.sheetgroup_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sheetgroup.sheetgroup_code || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    sheetgroup.sheetgroup_type === 0 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {getTypeLabel(sheetgroup.sheetgroup_type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sheetgroup.sheetgroup_description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(sheetgroup)}
                    className="text-primary hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(sheetgroup)}
                    className="text-error hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
             {filteredSheetGroups.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No sheet groups found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSheetGroup ? 'Edit Sheet Group' : 'New Sheet Group'}
        size="md"
      >
          <form onSubmit={handleSubmit} className="space-y-4">
               <Input
                   label="Name"
                   value={formData.sheetgroup_name || ''}
                   onChange={(e) => setFormData({...formData, sheetgroup_name: e.target.value})}
                   required
                   error={formErrors?.sheetgroup_name?.[0]}
               />
               <Input
                   label="Code"
                   value={formData.sheetgroup_code || ''}
                   onChange={(e) => setFormData({...formData, sheetgroup_code: e.target.value})}
                   error={formErrors?.sheetgroup_code?.[0]}
               />
               <SelectInput
                 label="Type"
                 name="sheetgroup_type"
                 required
                 options={[
                   { value: 0, label: 'Work' },
                   { value: 1, label: 'Cost' }
                 ]}
                 value={formData.sheetgroup_type ?? ''}
                 onChange={(value) => setFormData({...formData, sheetgroup_type: value as number})}
                 placeholder="Select type..."
                 error={formErrors?.sheetgroup_type?.[0]}
               />
               <Input
                   label="Description"
                   value={formData.sheetgroup_description || ''}
                   onChange={(e) => setFormData({...formData, sheetgroup_description: e.target.value})}
                   error={formErrors?.sheetgroup_description?.[0]}
               />
               <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                    Cancel
                    </Button>
                    <Button variant="primary" type="submit" isLoading={createSheetGroup.isPending || updateSheetGroup.isPending}>
                    {editingSheetGroup ? 'Update' : 'Create'}
                    </Button>
               </div>
          </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Sheet Group"
        message={`Are you sure you want to delete ${sheetgroupToDelete?.sheetgroup_name}?`}
        variant="danger"
        isLoading={deleteSheetGroup.isPending}
      />
    </div>
  );
}
