'use client';

import { useReffTypes, useReffTypeMutations } from '@/hooks/useReffTypes';
import { useState } from 'react';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { ReffType } from '@/services/refftypeService';

export default function ReffTypesPage() {
  const { data: refftypes, isLoading, error } = useReffTypes();
  const { createReffType, updateReffType, deleteReffType } = useReffTypeMutations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReffType, setEditingReffType] = useState<ReffType | undefined>(undefined);
  const [formData, setFormData] = useState<Partial<ReffType>>({});
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [refftypeToDelete, setReffTypeToDelete] = useState<ReffType | null>(null);

  const handleCreate = () => {
    setEditingReffType(undefined);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleEdit = (refftype: ReffType) => {
    setEditingReffType(refftype);
    setFormData(refftype);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (refftype: ReffType) => {
    setReffTypeToDelete(refftype);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReffType) {
      await updateReffType.mutateAsync({ id: editingReffType.id, data: formData });
    } else {
      await createReffType.mutateAsync(formData);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (refftypeToDelete) {
      await deleteReffType.mutateAsync(refftypeToDelete.id);
      setIsDeleteOpen(false);
      setReffTypeToDelete(null);
    }
  };

  if (isLoading) return <div className="p-4">Loading Reference Types...</div>;
  if (error) return <div className="p-4 text-error">Error loading Reference Types</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reference Types</h1>
        <Button onClick={handleCreate} leftIcon="add">
          New Reference Type
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {refftypes?.data?.map((refftype: ReffType) => (
              <tr key={refftype.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{refftype.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{refftype.code || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{refftype.description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(refftype)}
                    className="text-primary hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(refftype)}
                    className="text-error hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
             {refftypes?.data?.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No reference types found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
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
                   value={formData.name || ''}
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   required
               />
               <Input
                   label="Code"
                   value={formData.code || ''}
                   onChange={(e) => setFormData({...formData, code: e.target.value})}
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
        message={`Are you sure you want to delete ${refftypeToDelete?.name}?`}
        variant="danger"
        isLoading={deleteReffType.isPending}
      />
    </div>
  );
}
