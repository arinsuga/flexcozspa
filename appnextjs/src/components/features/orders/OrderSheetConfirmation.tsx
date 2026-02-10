'use client';

import React, { useMemo, useState } from 'react';
import { Order } from '@/services/orderService';
import { OrderSheet } from '@/services/orderSheetService';
import Button from '@/components/common/Button';
import { useProject } from '@/hooks/useProjects';
import { useContract } from '@/hooks/useContracts';
import { formatNumeric } from '@/utils/numberFormat';
import { useContractOrderSummary } from '@/hooks/useContractOrderSummary';
import { ContractOrderSummary } from '@/services/contractOrderSummaryService';
import InfoDialog from '@/components/common/InfoDialog';


interface OrderSheetConfirmationProps {
  order: Partial<Order> & { order_items?: Partial<OrderSheet>[]; ordersheets?: Partial<OrderSheet>[] };
  onBack: () => void;
  onSave: (processedSheets: OrderSheet[]) => void;
  isLoading: boolean;
  mode?: 'edit' | 'view';
}

export default function OrderSheetConfirmation({ order, onBack, onSave, isLoading, mode = 'edit' }: OrderSheetConfirmationProps) {
  const { data: projectData } = useProject(order.project_id || '');
  const project = projectData?.data || projectData;
  const { data: contractData } = useContract(order.contract_id || '');
  const contract = (contractData as any)?.data || contractData;
  const { data: summaryDataResponse } = useContractOrderSummary(order.contract_id || 0, order.id);

  const summaryData = useMemo(() => {
    const raw = summaryDataResponse?.data || summaryDataResponse;
    return Array.isArray(raw) ? raw : [];
  }, [summaryDataResponse]);

  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info'
  });

  const showInfo = (title: string, message: string, variant: 'success' | 'error' | 'info' = 'info') => {
    setInfoModal({ isOpen: true, title, message, variant });
  };

  
  // Refined processing logic
  const processedSheets = useMemo(() => {
    const rawSheets = order.order_items || order.ordersheets || [];
    const safeRawSheets: Partial<OrderSheet>[] = Array.isArray(rawSheets) ? rawSheets : [];

    // 1. Filter: sheet_code is not blank
    const validRaw = safeRawSheets.filter((s) => s && s.sheet_code && s.sheet_code.toString().trim() !== '');
    
    // Explicitly clean codes (Remove ALL spaces)
    const cleanedSheets = validRaw.map((s) => ({
      ...s,
      sheet_code: s.sheet_code!.toString().replace(/\s+/g, '')
    }));

    // 2. Sort naturally by code string pattern
    cleanedSheets.sort((a, b) => {
      return a.sheet_code!.localeCompare(b.sheet_code!, undefined, { 
        numeric: true, 
        sensitivity: 'base' 
      });
    });

    return cleanedSheets.map((s, index: number) => {
      const code = s.sheet_code!;
      const seqNo = index + 1;
      const errors: string[] = [];
      const grossAmt = Number(s.sheet_grossamt) || 0;
      
      // 4. Existence check in contract
      const contractMatch = summaryData.find((cs: ContractOrderSummary) => cs.sheet_code === code);
      
      const availableAmt = contractMatch ? Number(contractMatch.available_amount) : (Number(s.available_amount) || 0);
      const qty = Number(s.sheet_qty) || 0;
      const vendorId = s.vendor_id;
      
      // 1. Mandatory Field Checks
      if (!code) errors.push('Code is required');
      if (!s.sheet_refftypeid) errors.push('Reff Type is required');
      if (!s.sheet_reffno) errors.push('Reff No is required');
      if (!vendorId) errors.push('Vendor (S/SM) is required');
      if (!s.uom_code) errors.push('UOM (Sat) is required');

      // 2. Numeric > 0 Checks
      const price = Number(s.sheet_price) || 0;
      if (qty <= 0) errors.push('Vol (Quantity) must be > 0');
      if (price <= 0) errors.push('H.Satuan (Price) must be > 0');
      if (grossAmt <= 0) errors.push('Total must be > 0');

      // 3. Duplicate check
      const isDuplicate = cleanedSheets.filter((other) => other.sheet_code === code).length > 1;
      if (isDuplicate) {
        errors.push(`Duplicate code detected: "${code}"`);
      }

      // 4. Existence check in contract moved up
      if (!contractMatch) {
        errors.push(`Code "${code}" not found in contract summary`);
      }

      // 5. Amount validation
      if (grossAmt > availableAmt && mode === 'edit') {
        errors.push(`Amount exceeds available contract balance (${formatNumeric(availableAmt.toString())})`);
      }

      return {
        ...s,
        sheetgroup_id: contractMatch?.sheetgroup_id || s.sheetgroup_id,
        sheetgroup_type: contractMatch?.sheetgroup_type || s.sheetgroup_type,
        sheet_type: 1, // Treat all as items for orders
        sheet_dt: order.order_dt || new Date().toISOString().split('T')[0],
        sheet_grossamt: grossAmt,
        sheet_netamt: grossAmt,
        sheetgroup_seqno: seqNo,
        sheet_seqno: seqNo,
        available_amount: availableAmt,
        validation_errors: errors
      };
    });
  }, [order.order_items, order.ordersheets, order.order_dt, summaryData, mode]); 

  const handleSaveClick = () => {
    const sheets = processedSheets || [];
    if (sheets.length === 0) {
      showInfo('Attention', 'Please add at least one item to the order sheet.', 'info');
      return;
    }

    const hasErrors = sheets.some(s => (s.validation_errors?.length || 0) > 0);
    if (hasErrors) {
      showInfo('Validation Error', 'Please fix validation errors before saving.', 'error');
      return;
    }

    onSave(sheets as OrderSheet[]);
  };

  return (
    <div className={`space-y-6 bg-white dark:bg-gray-800 p-6 shadow sm:rounded-lg ${mode === 'view' ? 'border-t-4 border-primary' : ''}`}>
      {mode === 'edit' ? (
        <div className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Step 3: Order Sheet Confirmation</h2>
            <p className="text-sm text-gray-500 mt-1">Review and validate your order sheet structure before saving.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onBack} leftIcon="arrow_back" disabled={isLoading}>
              Back
            </Button>
            <Button variant="primary" onClick={handleSaveClick} leftIcon="save" isLoading={isLoading}>
              Save Data
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
           <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Summary</h2>
            <p className="text-sm text-gray-500 mt-1">Read-only view of the order and its items.</p>
          </div>
          <Button variant="ghost" onClick={onBack} leftIcon="arrow_back">
            Back to List
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border dark:border-gray-700">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Project</label>
          <div className="mt-1 text-sm text-gray-900 dark:text-white font-bold">
            {project?.project_number} - {project?.project_name}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Contract</label>
          <div className="mt-1 text-sm text-gray-900 dark:text-white font-bold">{contract?.contract_number} - {contract?.contract_name}</div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Order Number</label>
          <div className="mt-1 text-sm text-gray-900 dark:text-white font-bold">{order.order_number}</div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Order Date</label>
          <div className="mt-1 text-sm text-gray-900 dark:text-white font-bold">{order.order_dt?.split('T')[0]}</div>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
          <div className="mt-1 text-sm text-gray-700 dark:text-gray-300 italic">{order.order_description || '-'}</div>
        </div>
      </div>

      {processedSheets.some(s => (s.validation_errors?.length || 0) > 0) && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="material-icons text-red-500">error</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-red-800 dark:text-red-300 uppercase tracking-tight">Validation Rules</h3>
              <div className="mt-2 text-xs text-red-700 dark:text-red-400 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  <span>Minimal <strong>1 row</strong> added to save data</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  <span><strong>Code</strong> must exist in Contract Summary</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  <span>Mandatory: <strong>Code, Reff Type/No, S/SM, Vol, Sat, Price, Total</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  <span>Numeric constraints: <strong>Vol, Price, Total must be {'>'} 0</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Sheets Preview</h3>
        
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase w-16">Seq</th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase">Reff</th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase">Vendor</th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase">Description</th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase">Vol</th>
                <th className="px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase">Sat</th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase">Available</th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {(processedSheets?.length || 0) === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-400 italic">
                    No valid items found.
                  </td>
                </tr>
              ) : (
                processedSheets.map((sheet: Partial<OrderSheet>, index: number) => {
                  const hasErrors = (sheet.validation_errors?.length || 0) > 0;

                  return (
                    <tr 
                      key={index} 
                      className={`
                        transition-colors
                        ${hasErrors ? 'bg-red-50 dark:bg-red-950/30' : ''}
                        hover:bg-gray-50 dark:hover:bg-gray-700/50
                      `}
                    >
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-right text-gray-400 font-mono">
                        {sheet.sheet_seqno}
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap text-sm font-mono font-bold ${hasErrors ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                        {sheet.sheet_code}
                        {hasErrors && (
                          <div className="mt-1 flex flex-col gap-1">
                            {(sheet.validation_errors || []).map((err: string, i: number) => (
                              <span key={i} className="text-[10px] font-sans bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-0.5 rounded border border-red-200 dark:border-red-800 whitespace-normal max-w-[200px]">
                                {err}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                         {sheet.sheet_reffno || '-'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                         {sheet.vendor_name || '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                        {sheet.sheet_description}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300 font-mono">
                        {formatNumeric(sheet.sheet_qty?.toString() || '0')}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-center text-gray-500 uppercase">
                        {(sheet.uom_code || '-')}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-500 font-mono">
                         {formatNumeric(sheet.available_amount?.toString() || '0')}
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap text-sm text-right font-bold ${hasErrors && (sheet.validation_errors || []).some((e: string) => e.includes('Amount exceeds')) ? 'text-red-600' : 'text-primary'}`}>
                        {formatNumeric(sheet.sheet_grossamt?.toString() || '0')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
