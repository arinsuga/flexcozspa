'use client';

import React, { useState } from 'react';
import ContractForm from '@/components/features/contracts/ContractForm';
import ContractDetailClient from '../[id]/ContractDetailClient';
import { Contract } from '@/services/contractService';
import Stepper from '@/components/common/Stepper';

export default function NewContractPage() {
  const [step, setStep] = useState(1);
  const [contractData, setContractData] = useState<Partial<Contract>>({});

  const handleFormSubmit = (data: Partial<Contract>) => {
    setContractData(prev => ({ ...prev, ...data }));
    setStep(2);
  };

  const steps = ['Contract Details', 'Contract Sheets'];

  return (
    <div className="space-y-6">
      <Stepper steps={steps} currentStep={step} />
      
      {step === 1 && (
        <div className="space-y-6">
           {/* Header removed here as Stepper provides context, or keep if title is desired */}
          <div className="bg-white dark:bg-gray-800 p-6 shadow sm:rounded-lg">
             <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Step 1: Contract Details</h2>
             <ContractForm 
                onSubmit={handleFormSubmit} 
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
              readOnlyInfo={true}
            />
         </div>
      )}
    </div>
  );
}
