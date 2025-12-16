'use client';

import { useSheetGroups, useSheetGroupMutations } from '@/hooks/useSheetGroups';
import { useState } from 'react';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { SheetGroup } from '@/services/sheetGroupService';

export default function SheetGroupsPage() {
  const { data: sheetgroups, isLoading, error } = useSheetGroups();
  const { createSheetGroup, updateSheetGroup, deleteSheetGroup } = useSheetGroupMutations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSheetGroup, setEditingSheetGroup] = useState<SheetGroup | undefined>(undefined);
  const [formData, setFormData] = useState<Partial<SheetGroup>>({});
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [sheetgroupToDelete, setSheetGroupToDelete] = useState<SheetGroup | null>(null);

  const [filterType, setFilterType] = useState<string>('all');

  const handleCreate = () => {
    setEditingSheetGroup(undefined);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleEdit = (sheetgroup: SheetGroup) => {
    setEditingSheetGroup(sheetgroup);
    setFormData(sheetgroup);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (sheetgroup: SheetGroup) => {
    setSheetGroupToDelete(sheetgroup);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSheetGroup) {
      await updateSheetGroup.mutateAsync({ id: editingSheetGroup.id, data: formData });
    } else {
      await createSheetGroup.mutateAsync(formData);
    }
    setIsModalOpen(false);
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
    return sg.type === parseInt(filterType);
  }) || [];

  if (isLoading) return <div className="p-4">Loading Sheet Groups...</div>;
  if (error) return <div className="p-4 text-error">Error loading Sheet Groups</div>;

  return (
    <div className="space-y-6">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{sheetgroup.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sheetgroup.code || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    sheetgroup.type === 0 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {getTypeLabel(sheetgroup.type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sheetgroup.description || '-'}</td>
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
                   value={formData.name || ''}
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   required
               />
               <Input
                   label="Code"
                   value={formData.code || ''}
                   onChange={(e) => setFormData({...formData, code: e.target.value})}
               />
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Type
                 </label>
                 <select
                   value={formData.type ?? ''}
                   onChange={(e) => setFormData({...formData, type: parseInt(e.target.value)})}
                   className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                   required
                 >
                   <option value="">Select type...</option>
                   <option value="0">Work</option>
                   <option value="1">Cost</option>
                 </select>
               </div>
               <Input
                   label="Description"
                   value={formData.description || ''}
                   onChange={(e) => setFormData({...formData, description: e.target.value})}
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
        message={`Are you sure you want to delete ${sheetgroupToDelete?.name}?`}
        variant="danger"
        isLoading={deleteSheetGroup.isPending}
      />
    </div>
  );
}
