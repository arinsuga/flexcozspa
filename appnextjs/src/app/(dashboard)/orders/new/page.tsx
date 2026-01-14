'use client';

import React, { useState } from 'react';
import OrderForm from '@/components/features/orders/OrderForm';
import OrderDetailClient from '../[id]/OrderDetailClient';
import { Order } from '@/services/orderService';
import Stepper from '@/components/common/Stepper';

export default function NewOrderPage() {
  const [step, setStep] = useState(1);
  const [orderData, setOrderData] = useState<Partial<Order>>({});

  const handleFormSubmit = (data: Partial<Order>) => {
    setOrderData(prev => ({ ...prev, ...data }));
    setStep(2);
  };

  const steps = ['Order Details', 'Order Sheet'];

  return (
    <div className="space-y-6">
      <Stepper steps={steps} currentStep={step} />
      
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 shadow sm:rounded-lg">
             <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Step 1: Order Details</h2>
             <OrderForm 
                onSubmit={handleFormSubmit} 
                submitLabel="Next Step" 
                initialData={orderData} 
             />
          </div>
        </div>
      )}

      {step === 2 && (
         <div className="space-y-6">
            <OrderDetailClient 
              id="new" 
              initialData={orderData} 
              mode="create" 
              onBack={() => setStep(1)}
              readOnlyInfo={true}
            />
         </div>
      )}
    </div>
  );
}
