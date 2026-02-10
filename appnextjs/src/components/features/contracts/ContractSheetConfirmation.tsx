'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Contract } from '@/services/contractService';
import { ContractSheet } from '@/services/contractSheetService';
import Button from '@/components/common/Button';
import { useProject } from '@/hooks/useProjects';
import { useContractStatuses } from '@/hooks/useContractStatuses';
import { useSheetGroupsByType } from '@/hooks/useSheetGroups';
import { SheetGroup } from '@/services/sheetGroupService';
import { formatNumeric } from '@/utils/numberFormat';
import InfoDialog from '@/components/common/InfoDialog';


interface ContractSheetConfirmationProps {
  contract: Partial<Contract>;
  onBack: () => void;
  onSave: (processedSheets: ContractSheet[]) => void;
  isLoading: boolean;
  mode?: 'edit' | 'view';
}

export default function ContractSheetConfirmation({ contract, onBack, onSave, isLoading, mode = 'edit' }: ContractSheetConfirmationProps) {
  const { data: projectData } = useProject(contract.project_id || '');
  const project = projectData?.data || projectData;
  const { data: statusData } = useContractStatuses();
  const statuses = Array.isArray(statusData) ? statusData : (statusData?.data || []);
  const statusName = statuses.find((s: { id: number; name: string }) => s.id === contract.contractstatus_id)?.name || 'N/A';

  const { data: workSheetGroupsData } = useSheetGroupsByType(0);
  const { data: costSheetGroupsData } = useSheetGroupsByType(1);

  const sheetGroups = useMemo(() => {
    const workGroups = Array.isArray(workSheetGroupsData) ? workSheetGroupsData : (workSheetGroupsData?.data || []);
    const costGroups = Array.isArray(costSheetGroupsData) ? costSheetGroupsData : (costSheetGroupsData?.data || []);
    return [...workGroups, ...costGroups].sort((a, b) => {
        if (a.sheetgroup_type !== b.sheetgroup_type) {
            return a.sheetgroup_type - b.sheetgroup_type;
        }
        return (a.sheetgroup_seqno || 0) - (b.sheetgroup_seqno || 0);
    });
  }, [workSheetGroupsData, costSheetGroupsData]);

  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  useEffect(() => {
    if (sheetGroups.length > 0 && activeTabId === null) {
      const firstTabId = sheetGroups[0].id;
      // Use requestAnimationFrame or setTimeout to avoid synchronous setState inside effect warning
      requestAnimationFrame(() => setActiveTabId(firstTabId));
    }
  }, [sheetGroups, activeTabId]);
  
  // Refined processing logic
  const processedSheets = useMemo(() => {
    const rawSheets = contract.contract_sheets || [];
    // 1. Filter: sheet_code is not blank
    const validRaw = [...rawSheets].filter(s => s.sheet_code && s.sheet_code.toString().trim() !== '');
    
    // Explicitly clean codes (Remove ALL spaces including middle ones)
    const cleanedSheets = validRaw.map(s => ({
      ...s,
      sheet_code: s.sheet_code!.toString().replace(/\s+/g, '')
    }));

    // 2. Sort by sheetgroup_seqno then sheet_seqno
    cleanedSheets.sort((a, b) => {
      if (a.sheetgroup_seqno !== b.sheetgroup_seqno) {
        return (a.sheetgroup_seqno || 0) - (b.sheetgroup_seqno || 0);
      }
      return (a.sheet_seqno || 0) - (b.sheet_seqno || 0);
    });

    // Create a map to cache items by code for parent resolution
    const codeMap = new Map<string, typeof cleanedSheets[0]>();
    cleanedSheets.forEach((s) => {
      codeMap.set(s.sheet_code!, s);
    });

    const result = cleanedSheets.map((s, index) => {
      const code = s.sheet_code!;

      // Rule: Parenting resolution based on dot count
      const lastDotIndex = code.lastIndexOf('.');
      const parentCode = lastDotIndex !== -1 ? code.substring(0, lastDotIndex) : null;
      const parent = parentCode ? codeMap.get(parentCode) : null;
      
      // Rule 3: Set sheet_type (0 if has child, 1 if local item)
      const hasChild = cleanedSheets.some(other => {
        return other.sheet_code!.startsWith(code + '.');
      });
      
      // Rule 4: Sequencing order base on code pattern
      const seqNo = index + 1;

      // Rule 1 & 7: Relaxed validation logic
      const errors: string[] = [];
      
      // Check for duplicated codes
      const isDuplicate = (cleanedSheets || []).filter(other => other.sheet_code === code).length > 1;
      if (isDuplicate) {
        errors.push(`Duplicate code detected: "${code}"`);
      }

      // Rule 1: Parent validation gap check adjustment
      if (parentCode && parentCode.includes('.') && !parent) {
        errors.push(`Parent structure gap: Intermediate parent code "${parentCode}" not found in current list`);
      }

      return {
        ...s,
        parent_code: parentCode,
        sheetheader_id: parent?.id || null, 
        sheet_type: hasChild ? 0 : 1,
        sheetgroup_seqno: s.sheetgroup_seqno || seqNo,
        sheet_seqno: s.sheet_seqno || seqNo,
        validation_errors: errors
      };
    });

    // Step 4: Calculate Recursive Subtotals for Headers (Frontend)
    return result.map(item => {
      if (item.sheet_type === 0) { // It's a header
        const prefix = item.sheet_code + '.';
        // Sum only leaf nodes (sheet_type === 1) to avoid double counting intermediate headers
        const subTotal = result.reduce((sum, other) => {
          if (other.sheet_type === 1 && other.sheet_code.startsWith(prefix)) {
            const val = typeof other.sheet_grossamt === 'string' ? parseFloat(other.sheet_grossamt) : (other.sheet_grossamt || 0);
            return sum + val;
          }
          return sum;
        }, 0);

        const subExpense = result.reduce((sum, other) => {
          if (other.sheet_type === 1 && other.sheet_code.startsWith(prefix)) {
            const val = typeof other.order_summary?.order_amount === 'string' ? parseFloat(other.order_summary.order_amount) : (other.order_summary?.order_amount || 0);
            return sum + val;
          }
          return sum;
        }, 0);

        return {
          ...item,
          sheet_grossamt: parseFloat(subTotal.toFixed(2)),
          sheet_grossamt2: parseFloat(subTotal.toFixed(2)),
          sheet_netamt: parseFloat(subTotal.toFixed(2)),
          sheet_netamt2: parseFloat(subTotal.toFixed(2)),
          sheet_realamt: parseFloat(subTotal.toFixed(2)),
          order_summary: { ...item.order_summary, order_amount: parseFloat(subExpense.toFixed(2)) }
        };
      }
      return item;
    });
  }, [contract.contract_sheets]); 

  const filteredSheets = useMemo(() => {
      if (activeTabId === null) return [];
      return processedSheets.filter(s => s.sheetgroup_id === activeTabId);
  }, [processedSheets, activeTabId]);

  const handleSaveClick = () => {
    // Only save if no validation errors (or let the user decide, but usually we block if invalid)
    const hasErrors = (processedSheets || []).some(s => (s.validation_errors?.length || 0) > 0);
    if (hasErrors) {
      setErrorMessage('Please fix validation errors before saving.');
      setIsErrorModalOpen(true);
      return;
    }

    onSave(processedSheets as ContractSheet[]);
  };

  return (
    <div className={`space-y-6 bg-white dark:bg-gray-800 p-6 shadow sm:rounded-lg ${mode === 'view' ? 'border-t-4 border-primary' : ''}`}>
      {mode === 'edit' ? (
        <div className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Step 3: Contract Sheet Confirmation</h2>
            <p className="text-sm text-gray-500 mt-1">Review and validate your contract sheet structure before saving.</p>
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contract Summary</h2>
            <p className="text-sm text-gray-500 mt-1">Read-only view of the contract and its items.</p>
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
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Contract Number</label>
          <div className="mt-1 text-sm text-gray-900 dark:text-white font-bold">{contract.contract_number}</div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Contract Name</label>
          <div className="mt-1 text-sm text-gray-900 dark:text-white font-bold">{contract.contract_name}</div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Amount</label>
          <div className="mt-1 text-sm text-primary font-black scale-110 origin-left">
            {formatNumeric(contract.contract_amount?.toString() || '0')}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</label>
          <div className="mt-1 text-sm text-gray-900 dark:text-white font-bold">{statusName}</div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Contract Date</label>
          <div className="mt-1 text-sm text-gray-900 dark:text-white font-bold">{contract.contract_dt?.split('T')[0]}</div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contract Sheets Structure</h3>
            <div className="text-xs text-gray-500">
                <span className="inline-block w-3 h-3 bg-red-500 mr-1 rounded-full"></span> Error 
                <span className="inline-block w-3 h-3 bg-blue-100 dark:bg-blue-900 ml-4 mr-1 rounded-full"></span> Header
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Vertical Tabs Sidebar */}
          <div className="w-full md:w-72 flex-shrink-0 bg-gray-50 dark:bg-gray-900/50 rounded-lg overflow-hidden border dark:border-gray-700">
            <nav 
              className="flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto whitespace-nowrap scrollbar-hide max-h-[600px]" 
              aria-label="Tabs"
              onWheel={(e) => {
                if (window.innerWidth >= 768) {
                  e.currentTarget.scrollTop += e.deltaY;
                } else {
                  e.currentTarget.scrollLeft += e.deltaY;
                }
              }}
            >
              {sheetGroups.map((group: SheetGroup) => {
                const tabLabel = `${group.sheetgroup_code}. ${group.sheetgroup_name}`;
                const isActive = activeTabId === group.id;
                const hasData = processedSheets.some(s => s.sheetgroup_id === group.id);
                
                return (
                  <button
                    key={group.id}
                    onClick={() => setActiveTabId(group.id)}
                    className={`
                      flex-1 md:flex-none text-left py-3 px-4 border-b-2 md:border-b-0 md:border-r-4 font-medium text-xs transition-colors
                      ${isActive
                        ? 'border-primary text-primary bg-primary/5'
                        : !hasData
                          ? 'border-transparent text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/10'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between gap-2">
                        <span>{tabLabel}</span>
                        {!hasData && (
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                            Empty
                          </span>
                        )}
                      </div>
                  </button>
                );
              })}
            </nav>
          </div>
          
          <div className="flex-grow w-full overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
            {(filteredSheets?.length || 0) === 0 ? (
              <div className="bg-white dark:bg-gray-800 px-6 py-20 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-full flex items-center justify-center">
                  <span className="material-icons-outlined text-3xl">folder_off</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">No Data in This Group</h4>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
                    Ensure you have entered at least one row with a valid &quot;Code&quot; in Step 2 for this group.
                  </p>
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase w-16">Seq</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase">Parent</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase">Description</th>
                  <th className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase">Vol</th>
                  <th className="px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase">Sat</th>
                  <th className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase">H.Satuan</th>
                  <th className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase">Total</th>
                  <th className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase">Pengeluaran</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {(filteredSheets?.length || 0) === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-400 italic">
                      No valid sheets found in this group. Ensure rows have a &quot;Code&quot; entered in Step 2.
                    </td>
                  </tr>
                ) : (
                  filteredSheets.map((sheet: any, index: number) => {
                    const hasErrors = (sheet.validation_errors?.length || 0) > 0;
                    const isHeader = sheet.sheet_type === 0;
                    const inUse = (sheet.ordersheets_count || 0) > 0;
                    const isActive = sheet.is_active !== 0 || !sheet.id || typeof sheet.id === 'string';
  
                    return (
                      <tr 
                        key={index} 
                        className={`
                          transition-colors
                          ${hasErrors ? 'bg-red-50 dark:bg-red-950/30' : ''}
                          ${!hasErrors && !inUse && isHeader ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                          ${!hasErrors && inUse ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}
                          ${!isActive ? 'opacity-60' : ''}
                          hover:bg-gray-50 dark:hover:bg-gray-700/50
                        `}
                      >
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-right text-gray-400 font-mono">
                          {sheet.sheetgroup_seqno}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs font-mono text-gray-400">
                          {sheet.parent_code || ''}
                        </td>
                        <td className={`px-4 py-2 whitespace-nowrap text-sm font-mono font-bold ${hasErrors ? 'text-red-600 dark:text-red-400' : (isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400')}`}>
                          {sheet.sheet_code}
                          {hasErrors && (
                            <div className="mt-1 flex flex-col gap-1">
                              {sheet.validation_errors?.map((err: string, i: number) => (
                                <span key={i} className="text-[10px] font-sans bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-0.5 rounded border border-red-200 dark:border-red-800">
                                  {err}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className={`px-4 py-2 text-sm ${isHeader ? 'font-black flex items-center gap-2' : ''} ${isActive ? (isHeader ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300') : 'text-gray-400'}`}>
                          {sheet.sheet_name}
                          {isHeader && (
                            <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                              Header
                            </span>
                          )}
                          {inUse && (
                            <span className="text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                              In Use
                            </span>
                          )}
                        </td>
                        <td className={`px-4 py-2 whitespace-nowrap text-sm text-right ${isActive ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                          {isHeader ? '-' : (sheet.sheet_qty || '0')}
                        </td>
                        <td className={`px-4 py-2 whitespace-nowrap text-xs text-center ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                          {isHeader ? '-' : (sheet.uom_code || '-')}
                        </td>
                        <td className={`px-4 py-2 whitespace-nowrap text-sm text-right ${isActive ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                          {isHeader ? '-' : (sheet.sheet_price ? formatNumeric(sheet.sheet_price.toString()) : '0')}
                        </td>
                        <td className={`px-4 py-2 whitespace-nowrap text-sm text-right font-bold ${isActive ? (isHeader ? 'text-gray-900 dark:text-white' : 'text-primary') : 'text-gray-400'}`}>
                          {formatNumeric(sheet.sheet_grossamt?.toString() || '0')}
                        </td>
                        <td className={`px-4 py-2 whitespace-nowrap text-sm text-right font-bold ${isActive ? (isHeader ? 'text-gray-900 dark:text-white' : 'text-amber-600') : 'text-gray-400'}`}>
                          {formatNumeric(sheet.order_summary?.order_amount?.toString() || '0')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
        </div>
      </div>

      <InfoDialog
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Validation Error"
        message={errorMessage}
        variant="error"
      />
    </div>

  );
}
