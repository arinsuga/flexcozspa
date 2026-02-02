'use client';

import React, { useState } from 'react';
import OrderForm from '@/components/features/orders/OrderForm';
import OrderDetailClient from '../[id]/OrderDetailClient';
import OrderSheetConfirmation from '@/components/features/orders/OrderSheetConfirmation';
import { Order } from '@/services/orderService';
import { OrderSheet } from '@/services/orderSheetService';
import Stepper from '@/components/common/Stepper';
import { useOrderMutations } from '@/hooks/useOrders';
import { useRouter } from 'next/navigation';

export default function NewOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [orderData, setOrderData] = useState<Partial<Order>>({});
  const { createOrder } = useOrderMutations();

  const handleStep1Submit = (data: Partial<Order>) => {
    setOrderData(prev => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleStep2Submit = (data: Partial<Order>) => {
    setOrderData(prev => ({ ...prev, ...data }));
    setStep(3);
  };

  const handleFinalSave = async (processedSheets: OrderSheet[]) => {
    try {
      const payload = {
        ...orderData,
        order_items: processedSheets
      };
      await createOrder.mutateAsync(payload);
      alert('Order created successfully!');
      router.push('/orders');
    } catch (error) {
      console.error('Final save failed', error);
      alert('Failed to save order.');
    }
  };

  const steps = ['Order Details', 'Order Sheet Input', 'Order Sheet Confirmation'];

  return (
    <div className="space-y-6">
      <Stepper steps={steps} currentStep={step} />
      
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 shadow sm:rounded-lg">
             <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Step 1: Order Details</h2>
             <OrderForm 
                onSubmit={handleStep1Submit} 
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
              onSubmit={handleStep2Submit}
              submitLabel="Next Step"
              readOnlyInfo={true}
            />
         </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <OrderSheetConfirmation 
            order={orderData}
            onBack={() => setStep(2)}
            onSave={handleFinalSave}
            isLoading={createOrder.isPending}
          />
        </div>
      )}
    </div>
  );
}
