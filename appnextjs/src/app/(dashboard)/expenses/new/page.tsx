'use client';

import React, { useState } from 'react';
import ExpenseForm from '@/components/features/expenses/ExpenseForm';
import ExpenseDetailClient from '../[id]/ExpenseDetailClient';
import ExpenseSheetConfirmation from '@/components/features/expenses/ExpenseSheetConfirmation';
import { Expense } from '@/services/expenseService';
import { OrderSheet } from '@/services/orderSheetService';
import Stepper from '@/components/common/Stepper';
import { useExpenseMutations } from '@/hooks/useExpenses';
import { useRouter } from 'next/navigation';
import InfoDialog from '@/components/common/InfoDialog';

export default function NewExpensePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [expenseData, setExpenseData] = useState<Partial<Expense>>({
    expense_dt: new Date().toISOString().split('T')[0],
    expensestatus_id: 1, // Open/Pending
  });
  const { createExpense } = useExpenseMutations();

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
      await createExpense.mutateAsync(payload);
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
    } catch (error) {
      console.error('Final save failed', error);
      setInfoDialog({
        isOpen: true,
        title: 'Error',
        message: 'Failed to save expense. Please try again.',
        variant: 'error',
      });
    }
  };

  const steps = ['Expense Details', 'Expense Sheet Input', 'Expense Sheet Confirmation'];

  return (
    <div className="space-y-6">
      <Stepper steps={steps} currentStep={step} />
      
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
              id="new" 
              initialData={expenseData} 
              mode="create" 
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
            isLoading={createExpense.isPending}
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
