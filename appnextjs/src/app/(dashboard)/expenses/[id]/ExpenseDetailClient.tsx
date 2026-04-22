'use client';

import { useRouter } from 'next/navigation';
import { useExpense, useExpenseMutations } from '@/hooks/useExpenses';
import { useProjects } from '@/hooks/useProjects';
import { useContracts } from '@/hooks/useContracts';
import { useOrders } from '@/hooks/useOrders';
import { useReffTypes } from '@/hooks/useReffTypes';
import { ReffType } from '@/services/refftypeService';
import { Order } from '@/services/orderService';
import Button from '@/components/common/Button';
import ExpenseSheetTable from '@/components/features/expenses/ExpenseSheetTable';
import InfoDialog from '@/components/common/InfoDialog';
import { useRef, useState, useMemo, useEffect } from 'react';
import { Expense } from '@/services/expenseService';
import { useExpenseSheets } from '@/hooks/useOrderSheets';
import { OrderSheet } from '@/services/orderSheetService';

interface ExpenseDetailClientProps {
  id: string;
  initialData?: Partial<Expense>;
  mode?: 'create' | 'edit';
  onBack?: () => void;
  onSubmit?: (data: Partial<Expense>) => void;
  submitLabel?: string;
  readOnlyInfo?: boolean;
}

export default function ExpenseDetailClient({ id, initialData, mode = 'edit', onBack, onSubmit, submitLabel, readOnlyInfo = false }: ExpenseDetailClientProps) {
  const router = useRouter();
  const { data: expenseResponse, isLoading: isExpenseLoading } = useExpense(id);
  const { data: projectsData } = useProjects();
  const { data: contractsData } = useContracts();
  const { data: sheetsData, isLoading: isSheetsLoading } = useExpenseSheets(id);
  const { updateExpense: updateExpenseMutation, createExpense: createExpenseMutation } = useExpenseMutations();

  const projects = useMemo(() => projectsData?.data || [], [projectsData]);
  const contracts = useMemo(() => contractsData?.data || [], [contractsData]);

  // Resolve expense data: prefer initialData (for create mode) or fetched data
  const fetchedExpense = expenseResponse?.data || expenseResponse;
  const [expense, setExpense] = useState<Partial<Expense> | null>(initialData || null);
  const [isDataInitialized, setIsDataInitialized] = useState(false);

  // Initialize expense data when it becomes available
  useEffect(() => {
    if (fetchedExpense && !isDataInitialized) {
      setExpense(fetchedExpense);
      setIsDataInitialized(true);
    }
  }, [fetchedExpense, isDataInitialized]);

  const [localSheets, setLocalSheets] = useState<OrderSheet[]>([]);
  const [hasInitializedSheets, setHasInitializedSheets] = useState(false);
  const sheetRef = useRef<any>(null);

  // Info dialog state
  const [infoDialog, setInfoDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'success' | 'error' | 'info';
    onClose?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
  });

  const { data: ordersData } = useOrders(expense?.project_id ? { project_id: expense.project_id } : { enabled: false });
  const { data: reffTypesData } = useReffTypes();
  
  const orders = useMemo(() => (ordersData?.data || []) as Order[], [ordersData]);
  const reffTypes = useMemo(() => (reffTypesData?.data || []) as ReffType[], [reffTypesData]);


  // Sync localSheets with API data once
  useEffect(() => {
    if (hasInitializedSheets) return;

    const itemsFromProps = (initialData as any)?.expense_items || (initialData as any)?.ordersheets;
    
    if (Array.isArray(itemsFromProps)) {
       setLocalSheets(itemsFromProps);
       setHasInitializedSheets(true);
    } else if (sheetsData && id !== 'new') {
       const sheets = Array.isArray(sheetsData) ? sheetsData : (sheetsData as any).data || [];
       setLocalSheets(sheets);
       setHasInitializedSheets(true);
    } else if (fetchedExpense?.ordersheets && id !== 'new') {
       setLocalSheets(fetchedExpense.ordersheets);
       setHasInitializedSheets(true);
    }
  }, [sheetsData, initialData, hasInitializedSheets, id, fetchedExpense]);

  const handleHeaderChange = (field: keyof Expense, value: any) => {
    setExpense(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleSave = async () => {
    if (!expense) return;
    
    // Latest data from the table
    const allRowsToSave: Partial<OrderSheet>[] = sheetRef.current?.getSheetData() || [];

    const payload = {
       ...expense,
       project_id: expense.project_id ? Number(expense.project_id) : undefined,
       contract_id: expense.contract_id ? Number(expense.contract_id) : undefined,
       expense_items: allRowsToSave
    };

    if (onSubmit) {
      onSubmit(payload);
      return;
    }

    try {
      if (mode === 'create' || id === 'new') {
          await createExpenseMutation.mutateAsync(payload);
          setInfoDialog({
            isOpen: true,
            title: 'Success',
            message: 'Expense created successfully!',
            variant: 'success',
            onClose: () => {
              setInfoDialog(prev => ({ ...prev, isOpen: false }));
              router.push('/expenses');
            }
          });
      } else {
          await updateExpenseMutation.mutateAsync({ 
            id, 
            data: payload
          });
          setInfoDialog({
            isOpen: true,
            title: 'Success',
            message: 'Expense saved successfully!',
            variant: 'success',
          });
      }
    } catch (error) {
      console.error('Save failed', error);
      setInfoDialog({
        isOpen: true,
        title: 'Error',
        message: 'Failed to save expense. Please try again.',
        variant: 'error',
      });
    }
  };

  if ((isExpenseLoading && id !== 'new') || (isSheetsLoading && id !== 'new')) {
    return <div className="p-6">Loading...</div>;
  }
  
  if (!expense && id !== 'new') {
    return <div className="p-6 text-error">Expense not found</div>;
  }

  const safeExpense = expense || {};

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-2 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {mode === 'create' ? 'New Expense' : 'Expense Details'}
            </h3>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onBack || (() => router.back())} leftIcon="arrow_back">Back</Button>
            <Button 
              variant="primary" 
              leftIcon={onSubmit ? 'arrow_forward' : 'save'} 
              onClick={handleSave} 
              isLoading={updateExpenseMutation.isPending || createExpenseMutation.isPending}
            >
              {submitLabel || (mode === 'create' ? 'Save Expense' : 'Save Changes')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm font-medium">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Expense Number</label>
              <input 
                type="text" 
                value={safeExpense.expense_number || ''} 
                onChange={(e) => handleHeaderChange('expense_number', e.target.value)}
                disabled={readOnlyInfo}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
              />
            </div>
            <div>
               <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Project</label>
               <select
                  value={safeExpense.project_id || ''}
                  onChange={(e) => handleHeaderChange('project_id', e.target.value)}
                  disabled={readOnlyInfo}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
               >
                  <option value="">Select Project</option>
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.project_name}</option>
                  ))}
               </select>
            </div>
            <div>
               <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Order</label>
               <select
                  value={safeExpense.order_id || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const selectedOrder = orders.find(o => String(o.id) === val);
                    setExpense(prev => prev ? ({ 
                      ...prev, 
                      order_id: val ? parseInt(val) : undefined,
                      contract_id: selectedOrder?.contract_id || prev.contract_id
                    }) : null);
                  }}
                  disabled={readOnlyInfo}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
               >
                  <option value="">Select Order</option>
                  {orders.map((o: any) => (
                    <option key={o.id} value={o.id}>{o.order_number}</option>
                  ))}
               </select>
            </div>
            <div>
               <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Ref Type</label>
               <select
                  value={safeExpense.refftype_id || ''}
                  onChange={(e) => handleHeaderChange('refftype_id', e.target.value ? parseInt(e.target.value) : undefined)}
                  disabled={readOnlyInfo}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
               >
                  <option value="">Select Type</option>
                  {reffTypes.map((rt: any) => (
                    <option key={rt.id} value={rt.id}>{rt.refftype_name}</option>
                  ))}
               </select>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Expense Date</label>
              <input 
                type="date"
                value={safeExpense.expense_dt ? safeExpense.expense_dt.split(/[ T]/)[0] : ''}
                onChange={(e) => handleHeaderChange('expense_dt', e.target.value)}
                disabled={readOnlyInfo}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">PIC</label>
               <input 
                type="text"
                value={safeExpense.expense_pic || ''}
                onChange={(e) => handleHeaderChange('expense_pic', e.target.value)}
                disabled={readOnlyInfo}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Description</label>
              <textarea
                rows={1}
                value={safeExpense.expense_description || ''}
                onChange={(e) => handleHeaderChange('expense_description', e.target.value)}
                disabled={readOnlyInfo}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
              />
            </div>
        </div>

        <div className="pt-4 space-y-4">
                <ExpenseSheetTable 
                  ref={sheetRef} 
                  data={localSheets} 
                  expenseId={id} 
                  projectId={Number(safeExpense.project_id) || 0} 
                  contractId={Number(safeExpense.contract_id) || 0}
                  reffTypeId={Number(safeExpense.refftype_id) || undefined}
                  expenseNumber={safeExpense.expense_number}
                />
        </div>
      </div>

      <InfoDialog
        isOpen={infoDialog.isOpen}
        onClose={infoDialog.onClose || (() => setInfoDialog(prev => ({ ...prev, isOpen: false })))}
        title={infoDialog.title}
        message={infoDialog.message}
        variant={infoDialog.variant}
      />
    </div>
  );
}
