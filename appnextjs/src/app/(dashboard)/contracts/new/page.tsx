'use client';

import ContractForm from '@/components/features/contracts/ContractForm';
import { useContractMutations } from '@/hooks/useContracts';
import { useRouter } from 'next/navigation';

export default function NewContractPage() {
  const { createContract } = useContractMutations();
  const router = useRouter();

  const handleSubmit = (data: any) => {
    createContract.mutate(data, {
      onSuccess: () => {
        router.push('/contracts');
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">New Contract</h1>
      </div>
      <ContractForm onSubmit={handleSubmit} isLoading={createContract.isPending} />
    </div>
  );
}
