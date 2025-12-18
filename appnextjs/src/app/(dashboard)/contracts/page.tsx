'use client';

import { useContracts, useContractMutations } from '@/hooks/useContracts';
import { useState } from 'react';
import Button from '@/components/common/Button';
import ContractModal from '@/components/features/contracts/ContractModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Contract } from '@/services/contractService';
import Link from 'next/link';
import { TableSkeleton } from '@/components/common/Skeleton';

export default function ContractsPage() {
  const { data: contractsResponse, isLoading, error } = useContracts();
  const { createContract, updateContract, deleteContract } = useContractMutations();

  // Handle both direct array and paginated response formats
  const contracts = Array.isArray(contractsResponse) 
    ? contractsResponse 
    : contractsResponse?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | undefined>(undefined);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [appError, setAppError] = useState<string | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);

  const handleCreate = () => {
    setEditingContract(undefined);
    setFormErrors({});
    setAppError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setFormErrors({});
    setAppError(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (contract: Contract) => {
    setContractToDelete(contract);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (data: Partial<Contract>) => {
    try {
      if (editingContract) {
        await updateContract.mutateAsync({ id: editingContract.id, data });
      } else {
        await createContract.mutateAsync(data);
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
    if (contractToDelete) {
      await deleteContract.mutateAsync(contractToDelete.id);
      setIsDeleteOpen(false);
      setContractToDelete(null);
    }
  };

  if (isLoading) return <TableSkeleton cols={7} rows={8} />;
  if (error) return <div className="p-4 text-error">Error loading contracts</div>;

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contracts</h1>
        <Button onClick={handleCreate} leftIcon="add">
          New Contract
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contract No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">PIC</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {contracts?.map((contract: Contract) => (
              <tr key={contract.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    <Link href={`/contracts/${contract.id}`} className="hover:underline">
                        {contract.contract_number}
                    </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{contract.contract_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {contract.contract_amount ? `$${parseFloat(contract.contract_amount).toLocaleString()}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                   {contract.contract_startdt ? new Date(contract.contract_startdt).toLocaleDateString() : 'N/A'} - {contract.contract_enddt ? new Date(contract.contract_enddt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                   {contract.contract_pic}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                   {contract.contract_status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(contract)}
                    className="text-primary hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(contract)}
                    className="text-error hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {contracts?.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No contracts found. Create one to get started.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <ContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingContract}
        isLoading={createContract.isPending || updateContract.isPending}
        errors={formErrors}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Contract"
        message={`Are you sure you want to delete ${contractToDelete?.contract_number} - ${contractToDelete?.contract_name}? This action cannot be undone.`}
        variant="danger"
        isLoading={deleteContract.isPending}
      />
    </div>
  );
}
