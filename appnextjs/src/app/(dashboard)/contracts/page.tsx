'use client';

import { useContracts, useContractMutations } from '@/hooks/useContracts';
import React, { useState } from 'react';
import Button from '@/components/common/Button';
import ContractModal from '@/components/features/contracts/ContractModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Contract } from '@/services/contractService';
import { TableSkeleton } from '@/components/common/Skeleton';
import { useRouter } from 'next/navigation';
import Input from '@/components/common/Input';
import SelectInput from '@/components/common/SelectInput';
import Pagination from '@/components/common/Pagination';
import axios from 'axios';

export default function ContractsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState('');

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const { data: contractsResponse, isLoading, error } = useContracts({
    page,
    per_page: 10,
    search_query: searchQuery,
    search_column: searchColumn,
    sort_by: 'id',
    sort_order: 'desc'
  });
  const { createContract, updateContract, deleteContract } = useContractMutations();

  // Handle both direct array and paginated response formats
  const contracts = Array.isArray(contractsResponse) 
    ? contractsResponse 
    : contractsResponse?.data || [];
    
  const meta = contractsResponse && !Array.isArray(contractsResponse) ? contractsResponse : { current_page: 1, last_page: 1 };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract] = useState<Contract | undefined>(undefined);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [appError, setAppError] = useState<string | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);

  const handleCreate = () => {
    router.push('/contracts/new');
  };

  const handleEdit = (contract: Contract) => {
    router.push(`/contracts/${contract.id}`);
  };

  const handleDeleteClick = (contract: Contract) => {
    setContractToDelete(contract);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (data: Partial<Contract>) => {
    try {
      if (editingContract) {
        await updateContract.mutateAsync({ id: editingContract.id, data });
        setIsModalOpen(false);
      } else {
        const result = await createContract.mutateAsync(data);
        setIsModalOpen(false);
        const newId = result?.id || result?.data?.id;
        if (newId) {
            router.push(`/contracts/${newId}`);
        }
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 422) {
          setFormErrors(err.response.data.errors);
        } else {
          console.error('App Error:', err);
          setAppError("An application error occurred. Please try again later.");
          setIsModalOpen(false);
        }
      } else {
        console.error('App Error:', err);
        setAppError("An unexpected error occurred. Please try again later.");
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

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-48">
                <SelectInput
                    options={[
                        {value: '', label: 'All Columns'},
                        {value: 'contract_name', label: 'Contract Name'},
                        {value: 'contract_number', label: 'Contract No'},
                        {value: 'contract_pic', label: 'PIC'},
                        {value: 'project_number', label: 'Project Number'},
                        {value: 'project_name', label: 'Project Name'},
                    ]}
                    value={searchColumn}
                    onChange={(val) => setSearchColumn(val as string)}
                    placeholder="Search By"
                    className="z-30" 
                />
            </div>
            <div className="flex-1 flex gap-2">
                <Input
                    placeholder="Search contracts..."
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
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Project No</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Project Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contract No</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dates</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">PIC</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {contracts?.map((contract: Contract) => (
              <tr 
                key={contract.id} 
                onClick={() => router.push(`/contracts/${contract.id}`)}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {contract.project?.project_number || '-'}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {contract.project?.project_name || '-'}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    {contract.contract_number}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 dark:text-gray-100">{contract.contract_name}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {contract.contract_amount ? `${parseFloat(contract.contract_amount).toLocaleString()}` : '-'}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[150px]">
                   {contract.contract_startdt ? new Date(contract.contract_startdt).toLocaleDateString() : 'N/A'} - {contract.contract_enddt ? new Date(contract.contract_enddt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                   {contract.contract_pic}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                   {contract.contract_status?.name || 'N/A'}
                </td>
                 <td className="px-3 py-4 whitespace-nowrap text-center text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-4">
                    <button 
                      onClick={() => handleEdit(contract)}
                      className="text-primary hover:text-indigo-900"
                      title="Edit"
                    >
                      <span className="material-icons">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(contract)}
                      className="text-error hover:text-red-900"
                      title="Delete"
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {contracts?.length === 0 && (
                <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No contracts found. Create one to get started.
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
