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
import InfoDialog from '@/components/common/InfoDialog';

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
    : (contractsResponse as any)?.data || [];
    
  const meta = contractsResponse && !Array.isArray(contractsResponse) ? contractsResponse : { current_page: 1, last_page: 1 };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract] = useState<Contract | undefined>(undefined);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'success' | 'error' | 'info' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info'
  });
  
  const showInfo = (title: string, message: string, variant: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setInfoModal({ isOpen: true, title, message, variant });
  };
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const [inUseModal, setInUseModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    item: Contract | null;
  }>({
    isOpen: false,
    title: '',
    message: '',
    item: null
  });

  const handleCreate = () => {
    router.push('/contracts/new');
  };

  const handleEdit = (contract: Contract) => {
    router.push(`/contracts/${contract.id}?mode=edit`);
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
          showInfo('Error', "An application error occurred. Please try again later.", 'error');
          setIsModalOpen(false);
        }
      } else {
        showInfo('Error', "An unexpected error occurred. Please try again later.", 'error');
        setIsModalOpen(false);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (contractToDelete) {
      try {
        await deleteContract.mutateAsync(contractToDelete.id);
        setIsDeleteOpen(false);
        setContractToDelete(null);
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
          setIsDeleteOpen(false);
          setInUseModal({
            isOpen: true,
            title: 'Contract In Use',
            message: error?.response?.data?.message || 'This contract is in use (by orders) and cannot be physically deleted. Would you like to mark it as inactive instead?',
            item: contractToDelete
          });
        } else {
          setIsDeleteOpen(false);
          showInfo('Error', "Failed to delete contract.", 'error');
        }
      }
    }
  };

  const handleMarkInactive = async () => {
    if (inUseModal.item) {
      try {
        await updateContract.mutateAsync({ 
          id: inUseModal.item.id, 
          data: { is_active: 0 } 
        });
        setInUseModal(prev => ({ ...prev, isOpen: false, item: null }));
      } catch {
        showInfo('Error', "Failed to mark contract as inactive.", 'error');
      }
    }
  };

  if (isLoading) return <TableSkeleton cols={7} rows={8} />;
  if (error) return <div className="p-4 text-error">Error loading contracts</div>;

  return (
    <div className="space-y-6">
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
                        {value: 'contract_dt', label: 'Contract Date'},
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
                onClick={() => router.push(`/contracts/${contract.id}?mode=view`)}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${!contract.is_active ? 'opacity-60' : ''}`}
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
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col gap-1">
                        <span className="text-gray-500 dark:text-gray-400">{contract.contract_status?.name || 'N/A'}</span>
                        {contract.is_active == 0 && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 w-fit uppercase tracking-wider">
                                Inactive
                            </span>
                        )}
                    </div>
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

      <ConfirmDialog
        isOpen={inUseModal.isOpen}
        onClose={() => setInUseModal(prev => ({ ...prev, isOpen: false, item: null }))}
        onConfirm={handleMarkInactive}
        title={inUseModal.title}
        message={inUseModal.message}
        confirmLabel="Mark Inactive"
        variant="warning"
        isLoading={updateContract.isPending}
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
