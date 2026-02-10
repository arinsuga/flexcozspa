'use client';

import { useRouter } from 'next/navigation';
import { useContract, useContractMutations } from '@/hooks/useContracts';
import { useContractStatuses } from '@/hooks/useContractStatuses';
import { useProject } from '@/hooks/useProjects';
import Button from '@/components/common/Button';
import ContractSheetTable from '@/components/features/contracts/ContractSheetTable';
import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { useSheetGroupsByType } from '@/hooks/useSheetGroups';
import { ContractSheet } from '@/services/contractSheetService';
import { SheetGroup } from '@/services/sheetGroupService';
import { Contract } from '@/services/contractService';
import { formatNumeric, parseNumeric } from '@/utils/numberFormat';
import axios from 'axios';
import InfoDialog from '@/components/common/InfoDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';


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
  const { isLoading: isContractLoading } = useContract(id);
  const { data: workSheetGroupsData, isLoading: isWorkSheetGroupsLoading } = useSheetGroupsByType(0);
  const { data: costSheetGroupsData, isLoading: isCostSheetGroupsLoading } = useSheetGroupsByType(1);
  const { data: statusesData, isLoading: isStatusesLoading } = useContractStatuses();
  const { updateContract: updateContractMutation, createContract: createContractMutation } = useContractMutations();
  
  // Sync contract state with fetched data if not already initialized from initialData
  const [contract, setContract] = useState<Partial<Contract> | null>(initialData || null);
  
  // No changes to effect order, but ensure we don't have loop

  const { data: projectData, isLoading: isProjectLoading } = useProject(contract?.project_id ?? '');
  const project = projectData?.data || projectData;

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
  
  const statuses = useMemo(() => {
    return Array.isArray(statusesData) ? statusesData : (statusesData?.data || []);
  }, [statusesData]);

  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [localSheets, setLocalSheets] = useState<ContractSheet[]>(initialData?.contract_sheets || []);
  const [hasInitialized, setHasInitialized] = useState(!!(initialData?.contract_sheets && initialData.contract_sheets.length > 0));
  const sheetRef = useRef<{ getSheetData: () => ContractSheet[] } | null>(null);

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

  const [inUseModal, setInUseModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    payload: Partial<Contract> | null;
  }>({
    isOpen: false,
    title: '',
    message: '',
    payload: null
  });

  const showInfo = (title: string, message: string, variant: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setInfoModal({ isOpen: true, title, message, variant });
  };


  // Sync localSheets with API data if not already provided or if data has changed (Surgical sync)
  useEffect(() => {
    if (contract?.contract_sheets && contract.contract_sheets.length > 0) {
      if (!hasInitialized) {
        setHasInitialized(true);
        setLocalSheets(contract.contract_sheets);
      } else {
        // Surgical update of expenses (order_summary) and active status while preserving other fields
        setLocalSheets(prev => {
          return prev.map(localSheet => {
            const serverSheet = contract.contract_sheets?.find((s: ContractSheet) => s.id === localSheet.id);
            if (serverSheet) {
              return {
                ...localSheet,
                order_summary: serverSheet.order_summary,
                ordersheets_count: serverSheet.ordersheets_count,
                is_active: serverSheet.is_active
              };
            }
            return localSheet;
          });
        });
      }
    }
  }, [contract?.contract_sheets, hasInitialized]);

  // Initialize activeTabId when sheetGroups are loaded
  if (Array.isArray(sheetGroups) && sheetGroups.length > 0 && activeTabId === null) {
    setActiveTabId(sheetGroups[0].id);
  }


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
    return localSheets
      .filter((s: ContractSheet) => s.sheetgroup_id === activeTabId)
      .sort((a, b) => (a.sheet_seqno || 0) - (b.sheet_seqno || 0));
  }, [localSheets, activeTabId]);

  const handleHeaderChange = (field: keyof Contract, value: string | number | boolean | null) => {
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

    // Sort sheets by sheetgroup_seqno then sheet_seqno
    const sortedSheets = [...allRowsToSave].sort((a, b) => {
      if (a.sheetgroup_seqno !== b.sheetgroup_seqno) {
        return (a.sheetgroup_seqno || 0) - (b.sheetgroup_seqno || 0);
      }
      return (a.sheet_seqno || 0) - (b.sheet_seqno || 0);
    });

    const payload = {
       ...contract,
       project_id: contract.project_id ? Number(contract.project_id) : 0,
       contractstatus_id: contract.contractstatus_id ? Number(contract.contractstatus_id) : 1,
       contract_amount: parseNumeric(contract.contract_amount?.toString() || '').toString(),
       contract_payment: parseNumeric(contract.contract_payment?.toString() || '').toString(),
       contract_sheets: sortedSheets as ContractSheet[]
    };

    if (onSubmit) {
      onSubmit(payload);
      return;
    }

    try {
      if (mode === 'create' || id === 'new') {
         await createContractMutation.mutateAsync(payload);
         showInfo('Success', 'Contract created successfully!', 'success');
         setTimeout(() => router.push('/contracts'), 1500);
      } else {
         await updateContractMutation.mutateAsync({ 
           id, 
           data: payload
         });
         showInfo('Success', 'Saved successfully!', 'success');
         setHasInitialized(false); 
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error?.response?.status === 409) {
        setInUseModal({
          isOpen: true,
          title: 'Items In Use',
          message: error?.response?.data?.message || 'Some items are in use and cannot be physically deleted. Would you like to mark them as inactive instead?',
          payload: { ...payload, force_soft_delete: true } as Partial<Contract> & { force_soft_delete: boolean }
        });
      } else {
        console.error('Save failed', error);
        showInfo('Error', 'Failed to save.', 'error');
      }
    }
  };

  const handleForceSave = async () => {
    if (!inUseModal.payload || !id) return;
    try {
      await updateContractMutation.mutateAsync({ 
        id, 
        data: inUseModal.payload
      });
      setInUseModal(prev => ({ ...prev, isOpen: false, payload: null }));
      showInfo('Success', 'Saved successfully (with soft-deletes)!', 'success');
      setHasInitialized(false);
    } catch {
      showInfo('Error', 'Failed to save even with soft-delete.', 'error');
    }
  };


  // Loading states
  if ((isContractLoading && id !== 'new') || isWorkSheetGroupsLoading || isCostSheetGroupsLoading || isStatusesLoading || (isProjectLoading && contract?.project_id)) {
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
                  {statuses.map((s: { id: number; name: string }) => (
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

          <div className="flex flex-col md:flex-row gap-3 items-start">
            {/* Vertical Tabs Sidebar */}
            <div className="w-full md:w-52 flex-shrink-0 bg-gray-50 dark:bg-gray-900/50 rounded-lg overflow-hidden border dark:border-gray-700">
              <nav 
                className="flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto whitespace-nowrap scrollbar-hide max-h-[600px]" 
                aria-label="Tabs"
                onWheel={(e) => {
                  if (window.innerWidth >= 768) { // Only vertical scroll on desktop
                    e.currentTarget.scrollTop += e.deltaY;
                  } else {
                    e.currentTarget.scrollLeft += e.deltaY;
                  }
                }}
              >
                {sheetGroups.map((group: SheetGroup) => {
                  const tabLabel = `${group.sheetgroup_code}. ${group.sheetgroup_name}`;
                  const isActive = activeTabId === group.id;
                  
                  return (
                    <button
                      key={group.id}
                      onClick={() => handleTabClick(group.id)}
                      className={`
                        flex-1 md:flex-none text-left py-3 px-4 border-b-2 md:border-b-0 md:border-r-4 font-medium text-xs transition-colors
                        ${isActive
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700/50'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{tabLabel}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Table Content */}
            <div className="flex-grow w-full overflow-hidden">
              {activeTabId !== null && (
                <>
                  {filteredSheets.length === 0 && (
                    <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-3 text-yellow-800 dark:text-yellow-200">
                      <span className="material-icons-outlined text-xl">info</span>
                      <div className="text-sm font-medium">
                        This group currently has no data. You can start adding items by typing in the table below.
                      </div>
                    </div>
                  )}
                  <ContractSheetTable 
                    key={`sheet-tab-${activeTabId}`}
                    ref={sheetRef} 
                    data={filteredSheets} 
                    contractId={id}
                    projectId={safeContract.project_id || 0}
                    sheetgroupId={activeTabId}
                    sheetgroupType={sheetGroups.find(g => g.id === activeTabId)?.sheetgroup_type ?? 0}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={inUseModal.isOpen}
        onClose={() => setInUseModal(prev => ({ ...prev, isOpen: false, payload: null }))}
        onConfirm={handleForceSave}
        title={inUseModal.title}
        message={inUseModal.message}
        confirmLabel="Mark Inactive & Save"
        variant="warning"
        isLoading={updateContractMutation.isPending}
      />

      <InfoDialog
        isOpen={infoModal.isOpen}
        onClose={() => setInfoModal(prev => ({ ...prev, isOpen: false }))}
        title={infoModal.title}
        message={infoModal.message}
        variant={infoModal.variant as 'success' | 'error' | 'info' | undefined}
      />
    </div>

  );
}
