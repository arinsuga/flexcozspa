'use client';

import { useRouter } from 'next/navigation';
import { useContract, useContractMutations } from '@/hooks/useContracts';
import { useContractStatuses } from '@/hooks/useContractStatuses';
import { useProject } from '@/hooks/useProjects';
import { useQuery } from '@tanstack/react-query';
import { uomService } from '@/services/uomService';
import Button from '@/components/common/Button';
import ContractSheetTable from '@/components/features/contracts/ContractSheetTable';
import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { useSheetGroupsByType } from '@/hooks/useSheetGroups';
import { ContractSheet } from '@/services/contractSheetService';
import { SheetGroup } from '@/services/sheetGroupService';

interface ContractDetailClientProps {
  id: string;
}

// Hardcoded STATUS_MAP removed in favor of dynamic fetching

// Hardcoded WORK_TABS removed in favor of dynamic fetching from sheetGroupService

export default function ContractDetailClient({ id }: ContractDetailClientProps) {
  const router = useRouter();
  const { data: contractData, isLoading: isContractLoading } = useContract(id);
  const { data: uomsData, isLoading: isUomsLoading } = useQuery({
    queryKey: ['uoms'],
    queryFn: () => uomService.getAll(),
  });
  const { data: sheetGroupsData, isLoading: isSheetGroupsLoading } = useSheetGroupsByType(0);
  const { data: statusesData, isLoading: isStatusesLoading } = useContractStatuses();
  const { updateContract: updateContractMutation } = useContractMutations();
  
  // Extract contract from response - handle different API response structures
  const contract = contractData?.data || contractData;
  
  const { data: projectData, isLoading: isProjectLoading } = useProject(contract?.project_id);
  const project = projectData?.data || projectData;

  const sheetGroups = useMemo(() => {
    return Array.isArray(sheetGroupsData) ? sheetGroupsData : (sheetGroupsData?.data || []);
  }, [sheetGroupsData]);
  
  const statuses = useMemo(() => {
    return Array.isArray(statusesData) ? statusesData : (statusesData?.data || []);
  }, [statusesData]);

  const statusMap = useMemo(() => {
    const map: Record<number, string> = {};
    statuses.forEach((s: any) => {
      map[s.id] = s.name;
    });
    return map;
  }, [statuses]);

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
    if (sheetGroups.length > 0 && activeTabId === null) {
      setActiveTabId(sheetGroups[0].id);
    }
  }, [sheetGroups, activeTabId]);

  const uoms = useMemo(() => {
    return Array.isArray(uomsData) ? uomsData : (uomsData?.data || []);
  }, [uomsData]);

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
          contract_id: typeof id === 'string' ? parseInt(id) : id,
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

  const handleSave = async () => {
    if (activeTabId === null) return;
    
    // Latest data from current tab
    const currentTabRows: Partial<ContractSheet>[] = sheetRef.current?.getSheetData() || [];
    const currentSheetGroupId = activeTabId;
    
    // Combine with other tabs from local state
    const allRowsToSave = [
      ...localSheets.filter(s => s.sheetgroup_id !== currentSheetGroupId),
      ...currentTabRows.map((row: Partial<ContractSheet>) => ({
        ...row,
        sheetgroup_id: currentSheetGroupId,
        contract_id: typeof id === 'string' ? parseInt(id) : id,
        project_id: contract?.project_id
      }))
    ];

    // Sort sheets by sheetgroup_id sequentially (A-I)
    // sheetgroup_id 1: PREPARATION, 2: DEMOLISH, etc.
    const sortedSheets = [...allRowsToSave].sort((a, b) => {
      if (a.sheetgroup_id !== b.sheetgroup_id) {
        return (a.sheetgroup_id || 0) - (b.sheetgroup_id || 0);
      }
      return (a.sheet_seqno || 0) - (b.sheet_seqno || 0);
    });

    try {
      // One-shot persistence: update contract with nested sheets
      // Ensure top-level contract fields are also correctly typed
      await updateContractMutation.mutateAsync({ 
        id, 
        data: { 
          ...contract,
          project_id: parseInt(contract.project_id as unknown as string),
          contractstatus_id: contract.contractstatus_id ? parseInt(contract.contractstatus_id as unknown as string) : null,
          contract_sheets: sortedSheets as ContractSheet[] 
        } 
      });
      alert('Saved successfully!');
      // After save, we reset initialization to refresh from API
      setHasInitialized(false);
    } catch (error) {
      console.error('Save failed', error);
      alert('Failed to save.');
    }
  };

  if (isContractLoading || isUomsLoading || isSheetGroupsLoading || isStatusesLoading || isProjectLoading) {
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
              <Button variant="primary" leftIcon="save" onClick={handleSave} isLoading={updateContractMutation.isPending}>Save Changes</Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 text-md">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Project Number</label>
              <div className="font-medium">{project?.project_number || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Project Name</label>
              <div className="font-medium">{project?.project_name || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Contract Number</label>
              <div className="font-medium">{contract.contract_number}</div>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Status</label>
              <div className="font-medium">{statusMap[contract.contractstatus_id] || 'Unknown'}</div>
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
              uoms={uoms}
              contractId={id}
              projectId={contract.project_id}
              sheetgroupId={activeTabId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
