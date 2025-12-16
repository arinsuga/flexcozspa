'use client';

import { useReferences, useReferenceMutations } from '@/hooks/useReferences';
import { useState } from 'react';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Reference } from '@/services/referenceService';

export default function ReferencesPage() {
  const { data: references, isLoading, error } = useReferences();
  const { createReference, updateReference, deleteReference } = useReferenceMutations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReference, setEditingReference] = useState<Reference | undefined>(undefined);
  const [formData, setFormData] = useState<Partial<Reference>>({});
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [referenceToDelete, setReferenceToDelete] = useState<Reference | null>(null);

  const handleCreate = () => {
    setEditingReference(undefined);
    setFormData({ is_active: true });
    setIsModalOpen(true);
  };

  const handleEdit = (ref: Reference) => {
    setEditingReference(ref);
    setFormData(ref);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (ref: Reference) => {
    setReferenceToDelete(ref);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReference) {
      await updateReference.mutateAsync({ id: editingReference.id, data: formData });
    } else {
      await createReference.mutateAsync(formData);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (referenceToDelete) {
      await deleteReference.mutateAsync(referenceToDelete.id);
      setIsDeleteOpen(false);
      setReferenceToDelete(null);
    }
  };

  if (isLoading) return <div className="p-4">Loading references...</div>;
  if (error) return <div className="p-4 text-error">Error loading references</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reference Data</h1>
        <Button onClick={handleCreate} leftIcon="add">
          New Reference
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {references?.map((ref: Reference) => (
              <tr key={ref.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{ref.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{ref.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{ref.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                     ${ref.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                   `}>
                        {ref.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(ref)}
                    className="text-primary hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(ref)}
                    className="text-error hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
             {references?.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No references found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReference ? 'Edit Reference' : 'New Reference'}
        size="md"
      >
          <form onSubmit={handleSubmit} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                   <Input
                       label="Type"
                       value={formData.type || ''}
                       onChange={(e) => setFormData({...formData, type: e.target.value})}
                       required
                       placeholder="e.g. PAYMENT_METHOD"
                   />
                   <Input
                       label="Code"
                       value={formData.code || ''}
                       onChange={(e) => setFormData({...formData, code: e.target.value})}
                       required
                   />
               </div>
               <Input
                   label="Name"
                   value={formData.name || ''}
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   required
               />
               <Input
                   label="Description"
                   value={formData.description || ''}
                   onChange={(e) => setFormData({...formData, description: e.target.value})}
               />
               <div>
                   <label className="flex items-center space-x-2 cursor-pointer">
                       <input 
                            type="checkbox" 
                            checked={formData.is_active || false} 
                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                       <span className="text-sm text-gray-700 dark:text-gray-300">Is Active</span>
                   </label>
               </div>

               <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                    Cancel
                    </Button>
                    <Button variant="primary" type="submit" isLoading={createReference.isPending || updateReference.isPending}>
                    {editingReference ? 'Update' : 'Create'}
                    </Button>
               </div>
          </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Reference"
        message={`Are you sure you want to delete ${referenceToDelete?.name}?`}
        variant="danger"
        isLoading={deleteReference.isPending}
      />
    </div>
  );
}
