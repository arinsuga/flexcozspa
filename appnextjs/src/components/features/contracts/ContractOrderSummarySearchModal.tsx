'use client';

import { useState, useMemo } from 'react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import { useContractOrderSummary } from '@/hooks/useContractOrderSummary';
import { ContractOrderSummary } from '@/services/contractOrderSummaryService';
import { formatNumeric } from '@/utils/numberFormat';

interface ContractOrderSummarySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: ContractOrderSummary) => void;
  contractId: number;
}

export default function ContractOrderSummarySearchModal({
  isOpen,
  onClose,
  onSelect,
  contractId
}: ContractOrderSummarySearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: summaryResponse, isLoading } = useContractOrderSummary(contractId);

  const summaryData = useMemo(() => {
    const raw = summaryResponse?.data || summaryResponse;
    if (!Array.isArray(raw)) return [];
    return raw;
  }, [summaryResponse]);

  const filteredItems = useMemo(() => {
    return summaryData.filter(item => {
      const matchesSearch = 
        item.sheet_code.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.sheet_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [summaryData, searchQuery]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Contract Item"
      size="xl"
    >
      <div className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1 min-w-0">
            <Input
              label="Search Code or Name"
              placeholder="Search code or sheet name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="h-[450px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <Loading />
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 shadow-sm">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Code</th>
                    <th className="px-3 py-2 font-semibold">Sheet Name</th>
                    <th className="px-3 py-2 font-semibold text-right text-amber-600 dark:text-amber-400">Available Amt</th>
                    <th className="px-3 py-2 font-semibold text-right">Contract Amt</th>
                    <th className="px-3 py-2 font-semibold text-right">Order Amt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <tr 
                        key={item.contractsheet_id}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onDoubleClick={() => onSelect(item)}
                      >
                        <td className="px-3 py-2 font-medium">{item.sheet_code}</td>
                        <td className="px-3 py-2">{item.sheet_name}</td>
                        <td className="px-3 py-2 text-right font-semibold text-amber-600 dark:text-amber-400">
                           {formatNumeric(item.available_amount)}
                        </td>
                        <td className="px-3 py-2 text-right">{formatNumeric(item.contract_amount)}</td>
                        <td className="px-3 py-2 text-right">{formatNumeric(item.order_amount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        {contractId ? 'No items found for this contract' : 'Please select a contract first'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
          <p className="text-xs text-gray-500 italic flex-1 self-center">
            Double-click a row to select item
          </p>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
