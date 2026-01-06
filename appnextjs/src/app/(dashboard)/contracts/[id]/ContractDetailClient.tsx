'use client';

import { useRouter } from 'next/navigation';
import { useContract } from '@/hooks/useContracts';
import { useContractSheets } from '@/hooks/useContractSheets';
import { useQuery } from '@tanstack/react-query';
import { uomService } from '@/services/uomService';
import Button from '@/components/common/Button';
import ContractSheetTable from '@/components/features/contracts/ContractSheetTable';
import { useRef } from 'react';
import { useContractSheetMutations } from '@/hooks/useContractSheets';

interface ContractDetailClientProps {
  id: string;
}

const STATUS_MAP: Record<number, string> = {
  0: 'Open',
  1: 'Approved',
  2: 'Closed',
  3: 'Canceled/Rejected',
  4: 'Pending'
};

export default function ContractDetailClient({ id }: ContractDetailClientProps) {
  const router = useRouter();
  const { data: contractData, isLoading: isContractLoading } = useContract(id);
  const { data: sheetsData, isLoading: isSheetsLoading } = useContractSheets(id);
  const { data: uomsData, isLoading: isUomsLoading } = useQuery({
    queryKey: ['uoms'],
    queryFn: () => uomService.getAll(),
  });
  const { saveSheet } = useContractSheetMutations();

  const sheetRef = useRef<any>(null);

  // Extract contract from response - handle different API response structures
  const contract = contractData?.data || contractData;
  const sheets = Array.isArray(sheetsData) ? sheetsData : (sheetsData?.data || []);
  const uoms = Array.isArray(uomsData) ? uomsData : (uomsData?.data || []);

  const handleSave = async () => {
    if (!sheetRef.current) return;
    
    try {
      const sheetData = sheetRef.current.getSheetData();
      await saveSheet.mutateAsync({ contractId: id, rows: sheetData });
      alert('Saved successfully!');
    } catch (error) {
      console.error('Save failed', error);
      alert('Failed to save.');
    }
  };

  if (isContractLoading || isSheetsLoading || isUomsLoading) {
    return <div className="p-6">Loading...</div>;
  }
  
  if (!contract) {
    return <div className="p-6 text-error">Contract not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 h-fit md:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-2 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Contract Sheet</h3>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => router.back()} leftIcon="arrow_back">Back</Button>
              <Button variant="primary" leftIcon="save" onClick={handleSave} isLoading={saveSheet.isPending}>Save Changes</Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 text-md">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Contract Number</label>
              <div className="font-medium">{contract.contract_number}</div>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Status</label>
              <div className="font-medium">{STATUS_MAP[contract.contractstatus_id] || 'Unknown'}</div>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Start Date</label>
              <div className="font-medium">{contract.contract_startdt ? new Date(contract.contract_startdt).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">End Date</label>
              <div className="font-medium">{contract.contract_enddt ? new Date(contract.contract_enddt).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Amount</label>
              <div className="font-medium text-primary">
                {contract.contract_amount ? `${parseFloat(contract.contract_amount).toLocaleString()}` : 'N/A'}
              </div>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Progress</label>
              <div className="font-medium">{contract.contract_progress ? `${contract.contract_progress}%` : '0%'}</div>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">PIC</label>
              <div className="font-medium">{contract.contract_pic || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Payment</label>
              <div className="font-medium">
                {contract.contract_payment ? `${parseFloat(contract.contract_payment).toLocaleString()}` : 'N/A'}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Description</label>
              <div className="mt-1">{contract.contract_description || 'No description provided.'}</div>
            </div>
          </div>

          <ContractSheetTable 
            ref={sheetRef} 
            data={sheets} 
            uoms={uoms}
            contractId={id}
            projectId={contract.project_id}
          />
        </div>
      </div>
    </div>
  );
}
