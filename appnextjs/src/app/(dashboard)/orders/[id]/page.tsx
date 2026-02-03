'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import OrderDetailClient from './OrderDetailClient';
import OrderForm from '@/components/features/orders/OrderForm';
import OrderSheetConfirmation from '@/components/features/orders/OrderSheetConfirmation';
import Stepper from '@/components/common/Stepper';
import { useOrder, useOrderMutations } from '@/hooks/useOrders';
import { Order } from '@/services/orderService';
import { OrderSheet } from '@/services/orderSheetService';
import InfoDialog from '@/components/common/InfoDialog';
import { TableSkeleton } from '@/components/common/Skeleton';

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const mode = searchParams.get('mode') || 'view';

  const { data: orderResponse, isLoading: isOrderLoading } = useOrder(id);
  const { updateOrder } = useOrderMutations();
  const [step, setStep] = useState(1);
  const [orderData, setOrderData] = useState<Partial<Order>>({});
  
  // Initialize orderData from fetched order
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  useEffect(() => {
    if (orderResponse?.data && !isDataInitialized) {
      setOrderData(orderResponse.data);
      setIsDataInitialized(true);
    } else if (orderResponse && !orderResponse.data && !isDataInitialized) {
      setOrderData(orderResponse);
      setIsDataInitialized(true);
    }
  }, [orderResponse, isDataInitialized]);

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

  if (isOrderLoading || (id !== 'new' && !isDataInitialized)) return <div className="p-6"><TableSkeleton cols={1} rows={5} /></div>;

  if (mode === 'view') {
    return (
      <OrderSheetConfirmation 
        order={orderData} 
        mode="view" 
        onBack={() => router.push('/orders')} 
        onSave={() => {}} 
        isLoading={false} 
      />
    );
  }

  // Edit Mode Logic (3 steps)
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
      await updateOrder.mutateAsync({ id, data: payload });
      setInfoDialog({
        isOpen: true,
        title: 'Success',
        message: 'Order updated successfully!',
        variant: 'success',
        onClose: () => {
          setInfoDialog(prev => ({ ...prev, isOpen: false }));
          router.push('/orders');
        }
      });
    } catch (error) {
      console.error('Update failed', error);
      setInfoDialog({
        isOpen: true,
        title: 'Error',
        message: 'Failed to update order. Please try again.',
        variant: 'error',
      });
    }
  };

  const steps = ['Order Details', 'Order Sheet Input', 'Order Sheet Confirmation'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Order: {orderData.order_number}</h1>
        <Stepper steps={steps} currentStep={step} />
      </div>
      
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
              id={id} 
              initialData={orderData} 
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
          <OrderSheetConfirmation 
            order={orderData}
            onBack={() => setStep(2)}
            onSave={handleFinalSave}
            isLoading={updateOrder.isPending}
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
