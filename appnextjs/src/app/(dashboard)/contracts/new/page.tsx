'use client';

import React, { useState } from 'react';
import ContractForm from '@/components/features/contracts/ContractForm';
import ContractDetailClient from '../[id]/ContractDetailClient';
import ContractSheetConfirmation from '@/components/features/contracts/ContractSheetConfirmation';
import { Contract } from '@/services/contractService';
import { ContractSheet } from '@/services/contractSheetService';
import Stepper from '@/components/common/Stepper';
import { useContractMutations } from '@/hooks/useContracts';
import { useRouter } from 'next/navigation';
import InfoDialog from '@/components/common/InfoDialog';


export default function NewContractPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [contractData, setContractData] = useState<Partial<Contract>>({});
  const { createContract } = useContractMutations();
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


  const handleStep1Submit = (data: Partial<Contract>) => {
    setContractData(prev => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleStep2Submit = (data: Partial<Contract>) => {
    setContractData(prev => ({ ...prev, ...data }));
    setStep(3);
  };

  const handleFinalSave = async (processedSheets: ContractSheet[]) => {
    try {
      const payload = {
        ...contractData,
        contract_sheets: processedSheets
      };
      await createContract.mutateAsync(payload);
      showInfo('Success', 'Contract created successfully!', 'success');
      setTimeout(() => router.push('/contracts'), 1500);
    } catch (error) {
      console.error('Final save failed', error);
      showInfo('Error', 'Failed to save contract.', 'error');
    }
  };


  const steps = ['Contract Details', 'Contract Sheet Input', 'Contract Sheet Confirmation'];

  return (
    <div className="space-y-6">
      <Stepper steps={steps} currentStep={step} />
      
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 shadow sm:rounded-lg">
             <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Step 1: Contract Details</h2>
             <ContractForm 
                onSubmit={handleStep1Submit} 
                submitLabel="Next Step" 
                initialData={contractData} 
             />
          </div>
        </div>
      )}

      {step === 2 && (
         <div className="space-y-6">
            <ContractDetailClient 
              id="new" 
              initialData={contractData} 
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
          <ContractSheetConfirmation 
            contract={contractData}
            onBack={() => setStep(2)}
            onSave={handleFinalSave}
            isLoading={createContract.isPending}
          />
        </div>
      )}

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
