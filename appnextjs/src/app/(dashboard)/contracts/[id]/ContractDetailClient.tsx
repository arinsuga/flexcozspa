'use client';

import { useParams, useRouter } from 'next/navigation';
import { useContract } from '@/hooks/useContracts';
import { useContractSheets, useContractSheetMutations } from '@/hooks/useContractSheets';
import Button from '@/components/common/Button';
import SheetComponent from '@/components/common/SheetComponent';
import Loading from '@/components/common/Loading';
import { useRef } from 'react';

const COLUMNS = [
    { type: 'hidden', name: 'id' },
    { type: 'text', title: 'Item Name', width: 150, name: 'item_name' },
    { type: 'text', title: 'Description', width: 300, name: 'description' },
    { type: 'numeric', title: 'Qty', width: 80, name: 'qty' },
    { type: 'numeric', title: 'Unit Price', width: 120, mask: '$ #,##0.00', name: 'unit_price' },
    { type: 'numeric', title: 'Total', width: 120, mask: '$ #,##0.00', name: 'total_price', readOnly: true },
];

interface ContractDetailClientProps {
  id: string;
}

export default function ContractDetailClient({ id }: ContractDetailClientProps) {
  const router = useRouter();
  const { data: contract, isLoading: isContractLoading } = useContract(id);
  const { data: sheets, isLoading: isSheetsLoading } = useContractSheets(id);
  const { saveSheet } = useContractSheetMutations();

  const sheetRef = useRef<any>(null);

  const handleSave = async () => {
    if (!sheetRef.current) return;
    const currentData = sheetRef.current.getJson();
    try {
      await saveSheet.mutateAsync({ contractId: id, rows: currentData });
      alert('Saved successfully!');
    } catch (error) {
      console.error('Save failed', error);
      alert('Failed to save.');
    }
  };

  if (isContractLoading || isSheetsLoading) return <div className="p-6">Loading...</div>;
  if (!contract) return <div className="p-6 text-error">Contract not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{contract.contract_number}</h1>
          <p className="text-gray-500 dark:text-gray-400">{contract.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => router.back()} leftIcon="arrow_back">Back</Button>
          <Button variant="primary" leftIcon="save" onClick={handleSave} isLoading={saveSheet.isPending}>Save Changes</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4 md:col-span-1 h-fit">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Start Date</label>
              <div className="font-medium">{contract.start_date || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">End Date</label>
              <div className="font-medium">{contract.end_date || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Amount</label>
              <div className="font-medium text-primary">{contract.amount ? `$${contract.amount.toLocaleString()}` : 'N/A'}</div>
            </div>
            <div className="col-span-2">
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Description</label>
              <div className="mt-1">{contract.description || 'No description provided.'}</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Contract Sheet</h3>
          </div>
          <SheetComponent ref={sheetRef} data={sheets || []} columns={COLUMNS} />
        </div>
      </div>
    </div>
  );
}
