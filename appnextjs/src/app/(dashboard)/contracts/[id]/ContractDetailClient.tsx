'use client';

import { useRouter } from 'next/navigation';
import { useContract, useContractMutations } from '@/hooks/useContracts';
import { useContractStatuses } from '@/hooks/useContractStatuses';
import { useProject } from '@/hooks/useProjects';
import Button from '@/components/common/Button';
import ContractSheetTable from '@/components/features/contracts/ContractSheetTable';
import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { useSheetGroupsByType } from '@/hooks/useSheetGroups';
import { ContractSheet } from '@/services/contractSheetService';
import { SheetGroup } from '@/services/sheetGroupService';
import { Contract } from '@/services/contractService';
import { formatNumeric, parseNumeric } from '@/utils/numberFormat';

interface ContractDetailClientProps {
  id: string;
  initialData?: Partial<Contract>;
  mode?: 'create' | 'edit' | 'view';
  onBack?: () => void;
  onSubmit?: (data: Partial<Contract>) => void;
  submitLabel?: string;
  readOnlyInfo?: boolean;
}

export default function ContractDetailClient({ 
  id, 
  initialData, 
  mode = 'view', 
  onBack, 
  onSubmit,
  submitLabel,
  readOnlyInfo = false 
}: ContractDetailClientProps) {
  const router = useRouter();
  const { data: contractData, isLoading: isContractLoading } = useContract(id);
  const { data: sheetGroupsData, isLoading: isSheetGroupsLoading } = useSheetGroupsByType(0);
  const { data: statusesData, isLoading: isStatusesLoading } = useContractStatuses();
  const { updateContract: updateContractMutation, createContract: createContractMutation } = useContractMutations();
  
  // Resolve contract data: prefer initialData (for create mode) or fetched data
  const fetchedContract = contractData?.data || contractData;
  const [contract, setContract] = useState<Partial<Contract> | null>(initialData || null);

  useEffect(() => {
    if (fetchedContract && !initialData) {
      setContract(fetchedContract);
    }
  }, [fetchedContract, initialData]);

  const { data: projectData, isLoading: isProjectLoading } = useProject(contract?.project_id ?? '');
  const project = projectData?.data || projectData;

  const sheetGroups = useMemo(() => {
    return Array.isArray(sheetGroupsData) ? sheetGroupsData : (sheetGroupsData?.data || []);
  }, [sheetGroupsData]);
  
  const statuses = useMemo(() => {
    return Array.isArray(statusesData) ? statusesData : (statusesData?.data || []);
  }, [statusesData]);

  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [localSheets, setLocalSheets] = useState<ContractSheet[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const sheetRef = useRef<any>(null);

  // Sync localSheets with API data once upon initial load
  useEffect(() => {
    if (contract && !hasInitialized) {
      const sheets = contract.contract_sheets || [];
      setLocalSheets(sheets);
      setHasInitialized(true);
    }
  }, [contract, hasInitialized]);

  // Initialize activeTabId when sheetGroups are loaded
  useEffect(() => {
    if (Array.isArray(sheetGroups) && sheetGroups.length > 0 && activeTabId === null) {
      setActiveTabId(sheetGroups[0].id);
    }
  }, [sheetGroups, activeTabId]);


  // Sync current tab data to localSheets
  const syncCurrentTabToLocal = useCallback(() => {
    if (sheetRef.current && activeTabId !== null) {
      const currentTabRows: Partial<ContractSheet>[] = sheetRef.current.getSheetData();
      const currentSheetGroupId = activeTabId;
      
      setLocalSheets(prev => {
        // Remove old rows for this group and add new ones from the spreadsheet
        const otherRows = prev.filter(s => s.sheetgroup_id !== currentSheetGroupId);
        const updatedRows = currentTabRows.map((row: Partial<ContractSheet>) => ({
          ...row,
          sheetgroup_id: currentSheetGroupId,
          contract_id: (typeof id === 'string' && id !== 'new') ? parseInt(id) : undefined,
          project_id: contract?.project_id
        })) as ContractSheet[];
        return [...otherRows, ...updatedRows];
      });
    }
  }, [activeTabId, id, contract?.project_id]);

  const handleTabClick = (groupId: number) => {
    if (groupId === activeTabId) return;
    syncCurrentTabToLocal();
    setActiveTabId(groupId);
  };

  // Filter localSheets based on current tab
  const filteredSheets = useMemo(() => {
    if (activeTabId === null) return [];
    return localSheets.filter((s: ContractSheet) => s.sheetgroup_id === activeTabId);
  }, [localSheets, activeTabId]);

  const handleHeaderChange = (field: keyof Contract, value: any) => {
    setContract(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleSave = async () => {
    if (activeTabId === null || !contract) return;
    
    // Latest data from current tab
    const currentTabRows: Partial<ContractSheet>[] = sheetRef.current?.getSheetData() || [];
    const currentSheetGroupId = activeTabId;
    
    // Combine with other tabs from local state
    const allRowsToSave = [
      ...localSheets.filter(s => s.sheetgroup_id !== currentSheetGroupId),
      ...currentTabRows.map((row: Partial<ContractSheet>) => ({
        ...row,
        sheetgroup_id: currentSheetGroupId,
        contract_id: (typeof id === 'string' && id !== 'new') ? parseInt(id) : undefined,
        project_id: contract.project_id
      }))
    ];

    // Sort sheets by sheetgroup_id sequentially (A-I)
    const sortedSheets = [...allRowsToSave].sort((a, b) => {
      if (a.sheetgroup_id !== b.sheetgroup_id) {
        return (a.sheetgroup_id || 0) - (b.sheetgroup_id || 0);
      }
      return (a.sheet_seqno || 0) - (b.sheet_seqno || 0);
    });

    const payload = {
       ...contract,
       project_id: contract.project_id ? Number(contract.project_id) : 0,
       contractstatus_id: contract.contractstatus_id ? Number(contract.contractstatus_id) : 1,
       contract_amount: parseNumeric(contract.contract_amount?.toString() || ''),
       contract_payment: parseNumeric(contract.contract_payment?.toString() || ''),
       contract_sheets: sortedSheets as ContractSheet[]
    };

    if (onSubmit) {
      onSubmit(payload);
      return;
    }

    try {
      if (mode === 'create' || id === 'new') {
         await createContractMutation.mutateAsync(payload);
         alert('Contract created successfully!');
         router.push('/contracts');
      } else {
         await updateContractMutation.mutateAsync({ 
           id, 
           data: payload
         });
         alert('Saved successfully!');
         // Re-sync to ensure we have latest IDs etc if needed, though usually we might stay or reload
         setHasInitialized(false); 
      }
    } catch (error) {
      console.error('Save failed', error);
      alert('Failed to save.');
    }
  };

  // Loading states
  if ((isContractLoading && id !== 'new') || isSheetGroupsLoading || isStatusesLoading || (isProjectLoading && contract?.project_id)) {
    return <div className="p-6">Loading...</div>;
  }
  
  if (!contract && id !== 'new') {
    return <div className="p-6 text-error">Contract not found</div>;
  }

  // Safe defaults for render
  const safeContract = contract || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 h-fit md:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-2 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {mode === 'create' ? 'New Contract Sheet' : 'Contract Sheet'}
              </h3>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onBack || (() => router.back())} leftIcon="arrow_back">Back</Button>
              <Button 
                variant="primary" 
                leftIcon={onSubmit ? 'arrow_forward' : 'save'} 
                onClick={handleSave} 
                isLoading={updateContractMutation.isPending || createContractMutation.isPending}
              >
                {submitLabel || (mode === 'create' ? 'Save Contract' : 'Save Changes')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 text-md">
            {/* Read-only Project Info */}
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Project Number</label>
              <div className="font-medium">{project?.project_number || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Project Name</label>
              <div className="font-medium">{project?.project_name || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Contract Date</label>
              <input 
                type="date" 
                value={safeContract.contract_dt ? safeContract.contract_dt.split('T')[0] : ''} 
                onChange={(e) => handleHeaderChange('contract_dt', e.target.value)}
                disabled={readOnlyInfo}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
              />
            </div>

            {/* Editable Fields */}
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Contract Number</label>
              <input 
                type="text" 
                value={safeContract.contract_number || ''} 
                onChange={(e) => handleHeaderChange('contract_number', e.target.value)}
                disabled={readOnlyInfo}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
              />
            </div>
            <div>
               <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Status</label>
               <select
                  value={safeContract.contractstatus_id || 1}
                  onChange={(e) => handleHeaderChange('contractstatus_id', Number(e.target.value))}
                  disabled={readOnlyInfo}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
               >
                  {statuses.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
               </select>
            </div>


            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Payment Date</label>
              <input 
                type="date"
                value={safeContract.contract_payment_dt ? safeContract.contract_payment_dt.split('T')[0] : ''}
                onChange={(e) => handleHeaderChange('contract_payment_dt', e.target.value)}
                disabled={readOnlyInfo}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
              />
            </div>

            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Payment Amount</label>
              <input 
                type="text"
                value={safeContract.contract_payment || ''}
                onChange={(e) => handleHeaderChange('contract_payment', e.target.value.replace(/[^0-9,.]/g, ''))}
                onBlur={(e) => handleHeaderChange('contract_payment', formatNumeric(e.target.value))}
                disabled={readOnlyInfo}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 text-right ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
              />
            </div>

            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Start Date</label>
              <input 
                type="date"
                value={safeContract.contract_startdt ? safeContract.contract_startdt.split('T')[0] : ''}
                onChange={(e) => handleHeaderChange('contract_startdt', e.target.value)}
                disabled={readOnlyInfo}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">End Date</label>
              <input 
                type="date"
                value={safeContract.contract_enddt ? safeContract.contract_enddt.split('T')[0] : ''}
                onChange={(e) => handleHeaderChange('contract_enddt', e.target.value)}
                disabled={readOnlyInfo}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
              />
            </div>

            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Progress %</label>
              <input 
                type="number"
                min="0" max="100"
                value={safeContract.contract_progress || '0'}
                onChange={(e) => handleHeaderChange('contract_progress', e.target.value)}
                disabled={readOnlyInfo}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
              />
            </div>

            <div className="col-span-2 row-span-2">
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Description</label>
              <textarea
                rows={5}
                value={safeContract.contract_description || ''}
                onChange={(e) => handleHeaderChange('contract_description', e.target.value)}
                disabled={readOnlyInfo}
                 className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">PIC</label>
               <input 
                type="text"
                value={safeContract.contract_pic || ''}
                onChange={(e) => handleHeaderChange('contract_pic', e.target.value)}
                disabled={readOnlyInfo}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Amount</label>
              <input 
                type="text"
                value={safeContract.contract_amount || ''}
                onChange={(e) => handleHeaderChange('contract_amount', e.target.value.replace(/[^0-9,.]/g, ''))}
                onBlur={(e) => handleHeaderChange('contract_amount', formatNumeric(e.target.value))}
                disabled={readOnlyInfo}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 font-medium text-primary text-right ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
              />
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 overflow-x-auto whitespace-nowrap scrollbar-hide" aria-label="Tabs">
              {sheetGroups.map((group: SheetGroup) => {
                const tabLabel = `${group.sheetgroup_code}. ${group.sheetgroup_name}`;
                return (
                  <button
                    key={group.id}
                    onClick={() => handleTabClick(group.id)}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${activeTabId === group.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }
                    `}
                  >
                    {tabLabel}
                  </button>
                );
              })}
            </nav>
          </div>

          {activeTabId !== null && (
            <ContractSheetTable 
              key={`sheet-tab-${activeTabId}`}
              ref={sheetRef} 
              data={filteredSheets} 
              contractId={id}
              projectId={safeContract.project_id || 0}
              sheetgroupId={activeTabId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
