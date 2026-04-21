'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ExpenseDetailClient from './ExpenseDetailClient';
import ExpenseForm from '@/components/features/expenses/ExpenseForm';
import ExpenseSheetConfirmation from '@/components/features/expenses/ExpenseSheetConfirmation';
import Stepper from '@/components/common/Stepper';
import { useExpense, useExpenseMutations } from '@/hooks/useExpenses';
import { Expense } from '@/services/expenseService';
import { OrderSheet } from '@/services/orderSheetService';
import InfoDialog from '@/components/common/InfoDialog';
import { TableSkeleton } from '@/components/common/Skeleton';

export default function ExpenseDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const mode = searchParams.get('mode') || 'view';

  const { data: expenseResponse, isLoading: isExpenseLoading } = useExpense(id);
  const { updateExpense } = useExpenseMutations();
  const [step, setStep] = useState(1);
  const [expenseData, setExpenseData] = useState<Partial<Expense>>({});
  
  // Initialize expenseData from fetched expense
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  useEffect(() => {
    if (expenseResponse?.data && !isDataInitialized) {
      setExpenseData(expenseResponse.data);
      setIsDataInitialized(true);
    } else if (expenseResponse && !expenseResponse.data && !isDataInitialized) {
      setExpenseData(expenseResponse);
      setIsDataInitialized(true);
    }
  }, [expenseResponse, isDataInitialized]);

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

  if (isExpenseLoading || (id !== 'new' && !isDataInitialized)) return <div className="p-6"><TableSkeleton cols={1} rows={5} /></div>;

  if (mode === 'view') {
    return (
      <ExpenseSheetConfirmation 
        order={expenseData} 
        mode="view" 
        onBack={() => router.push('/expenses')} 
        onSave={() => {}} 
        isLoading={false} 
      />
    );
  }

  // Edit Mode Logic (3 steps)
  const handleStep1Submit = (data: Partial<Expense>) => {
    setExpenseData(prev => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleStep2Submit = (data: Partial<Expense>) => {
    setExpenseData(prev => ({ ...prev, ...data }));
    setStep(3);
  };

  const handleFinalSave = async (processedSheets: OrderSheet[]) => {
    try {
      const payload = {
        ...expenseData,
        expense_items: processedSheets
      };
      await updateExpense.mutateAsync({ id, data: payload });
      setInfoDialog({
        isOpen: true,
        title: 'Success',
        message: 'Expense updated successfully!',
        variant: 'success',
        onClose: () => {
          setInfoDialog(prev => ({ ...prev, isOpen: false }));
          router.push('/expenses');
        }
      });
    } catch (error) {
      console.error('Update failed', error);
      setInfoDialog({
        isOpen: true,
        title: 'Error',
        message: 'Failed to update expense. Please try again.',
        variant: 'error',
      });
    }
  };

  const steps = ['Expense Details', 'Expense Sheet Input', 'Expense Sheet Confirmation'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Expense: {expenseData.expense_number}</h1>
        <Stepper steps={steps} currentStep={step} />
      </div>
      
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 shadow sm:rounded-lg">
             <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Step 1: Expense Details</h2>
             <ExpenseForm 
                onSubmit={handleStep1Submit} 
                submitLabel="Next Step" 
                initialData={expenseData} 
             />
          </div>
        </div>
      )}

      {step === 2 && (
         <div className="space-y-6">
            <ExpenseDetailClient 
              id={id} 
              initialData={expenseData} 
              mode="edit" 
              onBack={() => setStep(1)}
              onSubmit={handleStep2Submit}
              submitLabel="Next Step"
              readOnlyInfo={true}
            />
         </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <ExpenseSheetConfirmation 
            order={expenseData}
            onBack={() => setStep(2)}
            onSave={handleFinalSave}
            isLoading={updateExpense.isPending}
          />
        </div>
      )}
      
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
