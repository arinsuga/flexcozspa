'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ContractDetailClient from './ContractDetailClient';
import ContractForm from '@/components/features/contracts/ContractForm';
import ContractSheetConfirmation from '@/components/features/contracts/ContractSheetConfirmation';
import Stepper from '@/components/common/Stepper';
import { useContract, useContractMutations } from '@/hooks/useContracts';
import { Contract } from '@/services/contractService';
import { ContractSheet } from '@/services/contractSheetService';
import InfoDialog from '@/components/common/InfoDialog';
import { TableSkeleton } from '@/components/common/Skeleton';

export default function ContractDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const mode = searchParams.get('mode') || 'view';

  const { data: contractResponse, isLoading: isContractLoading } = useContract(id);
  const { updateContract } = useContractMutations();
  const [step, setStep] = useState(1);
  const [contractData, setContractData] = useState<Partial<Contract>>({});
  
  // Initialize contractData from fetched contract
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  useEffect(() => {
    if (contractResponse?.data && !isDataInitialized) {
      setContractData(contractResponse.data);
      setIsDataInitialized(true);
    } else if (contractResponse && !contractResponse.data && !isDataInitialized) {
      setContractData(contractResponse);
      setIsDataInitialized(true);
    }
  }, [contractResponse, isDataInitialized]);

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

  if (isContractLoading || (id !== 'new' && !isDataInitialized)) return <div className="p-6"><TableSkeleton cols={1} rows={5} /></div>;

  if (mode === 'view') {
    return (
      <ContractSheetConfirmation 
        contract={contractData} 
        mode="view" 
        onBack={() => router.push('/contracts')} 
        onSave={() => {}} 
        isLoading={false} 
      />
    );
  }

  // Edit Mode Logic (3 steps)
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
      await updateContract.mutateAsync({ id, data: payload });
      setInfoDialog({
        isOpen: true,
        title: 'Success',
        message: 'Contract updated successfully!',
        variant: 'success',
        onClose: () => {
          setInfoDialog(prev => ({ ...prev, isOpen: false }));
          router.push('/contracts');
        }
      });
    } catch (error) {
      console.error('Update failed', error);
      setInfoDialog({
        isOpen: true,
        title: 'Error',
        message: 'Failed to update contract. Please try again.',
        variant: 'error',
      });
    }
  };

  const steps = ['Contract Details', 'Contract Sheet Input', 'Contract Sheet Confirmation'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Contract: {contractData.contract_number}</h1>
        <Stepper steps={steps} currentStep={step} />
      </div>
      
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
              id={id} 
              initialData={contractData} 
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
          <ContractSheetConfirmation 
            contract={contractData}
            onBack={() => setStep(2)}
            onSave={handleFinalSave}
            isLoading={updateContract.isPending}
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
