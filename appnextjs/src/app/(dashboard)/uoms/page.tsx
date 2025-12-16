'use client';

import { useUOMs, useUOMMutations } from '@/hooks/useUOMs';
import { useState } from 'react';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { UOM } from '@/services/uomService';

export default function UOMPage() {
  const { data: uoms, isLoading, error } = useUOMs();
  const { createUOM, updateUOM, deleteUOM } = useUOMMutations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUOM, setEditingUOM] = useState<UOM | undefined>(undefined);
  const [formData, setFormData] = useState<Partial<UOM>>({});
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [uomToDelete, setUOMToDelete] = useState<UOM | null>(null);

  const handleCreate = () => {
    setEditingUOM(undefined);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleEdit = (uom: UOM) => {
    setEditingUOM(uom);
    setFormData(uom);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (uom: UOM) => {
    setUOMToDelete(uom);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUOM) {
      await updateUOM.mutateAsync({ id: editingUOM.id, data: formData });
    } else {
      await createUOM.mutateAsync(formData);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (uomToDelete) {
      await deleteUOM.mutateAsync(uomToDelete.id);
      setIsDeleteOpen(false);
      setUOMToDelete(null);
    }
  };

  if (isLoading) return <div className="p-4">Loading UOMs...</div>;
  if (error) return <div className="p-4 text-error">Error loading UOMs</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Units of Measure</h1>
        <Button onClick={handleCreate} leftIcon="add">
          New UOM
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Symbol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {uoms?.map((uom: UOM) => (
              <tr key={uom.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{uom.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{uom.symbol || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{uom.description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(uom)}
                    className="text-primary hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(uom)}
                    className="text-error hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
             {uoms?.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No UOMs found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUOM ? 'Edit UOM' : 'New UOM'}
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
                   label="Symbol"
                   value={formData.symbol || ''}
                   onChange={(e) => setFormData({...formData, symbol: e.target.value})} // e.g., kg, m
               />
               <Input
                   label="Description"
                   value={formData.description || ''}
                   onChange={(e) => setFormData({...formData, description: e.target.value})}
               />
               <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                    Cancel
                    </Button>
                    <Button variant="primary" type="submit" isLoading={createUOM.isPending || updateUOM.isPending}>
                    {editingUOM ? 'Update' : 'Create'}
                    </Button>
               </div>
          </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete UOM"
        message={`Are you sure you want to delete ${uomToDelete?.name}?`}
        variant="danger"
        isLoading={deleteUOM.isPending}
      />
    </div>
  );
}
