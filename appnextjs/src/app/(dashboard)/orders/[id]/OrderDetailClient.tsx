'use client';

import { useRouter } from 'next/navigation';
import { useOrderMutations } from '@/hooks/useOrders';
import Button from '@/components/common/Button';
import OrderSheetTable from '@/components/features/orders/OrderSheetTable';
import InfoDialog from '@/components/common/InfoDialog';
import { useRef, useState, useEffect } from 'react';
import { Order } from '@/services/orderService';
import { OrderSheet } from '@/services/orderSheetService';

interface OrderDetailClientProps {
  id: string;
  initialData?: Partial<Order>;
  mode?: 'create' | 'edit';
  onBack?: (data?: Partial<Order>) => void;
  onSubmit?: (data: Partial<Order>) => void;
  submitLabel?: string;
  readOnlyInfo?: boolean;
}

export default function OrderDetailClient({ id, initialData, mode = 'edit', onBack, onSubmit, submitLabel, readOnlyInfo = false }: OrderDetailClientProps) {
  const router = useRouter();
  const { updateOrder: updateOrderMutation, createOrder: createOrderMutation } = useOrderMutations();

  // Use initialData directly or as a starting point for state
  const [order, setOrder] = useState<Partial<Order>>(initialData || {});
  const [localSheets, setLocalSheets] = useState<OrderSheet[]>([]);
  const sheetRef = useRef<any>(null);

  // Sync localSheets with initialData once OR when initialData significantly changes
  // This is important because the parent (Wizard) might have updated initialData
  useEffect(() => {
    const items = (initialData as any)?.order_items || (initialData as any)?.ordersheets || [];
    
    console.log("order detail client")
    console.log(items);

    setLocalSheets(items);
    if (initialData) {
      setOrder(initialData);
    }
  }, [initialData]);

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

  const handleHeaderChange = (field: keyof Order, value: any) => {
    setOrder(prev => ({ ...prev, [field]: value }));
  };

  const getLatestPayload = () => {
    const allRowsToSave: Partial<OrderSheet>[] = sheetRef.current?.getSheetData() || [];
    return {
      ...order,
      project_id: order.project_id ? Number(order.project_id) : undefined,
      contract_id: order.contract_id ? Number(order.contract_id) : undefined,
      order_items: allRowsToSave 
    };
  };

  const handleBack = () => {
    if (onBack) {
      onBack(getLatestPayload());
    } else {
      router.back();
    }
  };

  const handleSave = async () => {
    const payload = getLatestPayload();

    if (onSubmit) {
      onSubmit(payload);
      return;
    }

    try {
      if (mode === 'create' || id === 'new') {
         await createOrderMutation.mutateAsync(payload);
         setInfoDialog({
           isOpen: true,
           title: 'Success',
           message: 'Order created successfully!',
           variant: 'success',
           onClose: () => {
             setInfoDialog(prev => ({ ...prev, isOpen: false }));
             router.push('/orders');
           }
         });
      } else {
         await updateOrderMutation.mutateAsync({ 
           id, 
           data: payload
         });
         setInfoDialog({
           isOpen: true,
           title: 'Success',
           message: 'Order saved successfully!',
           variant: 'success',
         });
      }
    } catch (error) {
      console.error('Save failed', error);
      setInfoDialog({
        isOpen: true,
        title: 'Error',
        message: 'Failed to save order. Please try again.',
        variant: 'error',
      });
    }
  };

  if (!order && id !== 'new') {
    return <div className="p-6 text-error">Order not found</div>;
  }

  const safeOrder = order || {};

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-2 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {mode === 'create' ? 'New Order' : 'Order Details'}
            </h3>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleBack} leftIcon="arrow_back">Back</Button>
            <Button 
              variant="primary" 
              leftIcon={onSubmit ? 'arrow_forward' : 'save'} 
              onClick={handleSave} 
              isLoading={updateOrderMutation.isPending || createOrderMutation.isPending}
            >
              {submitLabel || (mode === 'create' ? 'Save Order' : 'Save Changes')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm font-medium">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Order Number</label>
              <input 
                type="text" 
                value={safeOrder.order_number || ''} 
                onChange={(e) => handleHeaderChange('order_number', e.target.value)}
                disabled={readOnlyInfo}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
              />
            </div>
            <div>
               <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Project</label>
               <input 
                 type="text"
                 value={safeOrder.project?.project_name || ''}
                 disabled
                 className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 cursor-not-allowed opacity-75"
               />
            </div>
            <div>
               <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Contract</label>
               <input 
                 type="text"
                 value={safeOrder.contract?.contract_name || ''}
                 disabled
                 className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 cursor-not-allowed opacity-75"
               />
            </div>
            <div>
               <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Status</label>
               <select
                  value={safeOrder.orderstatus_id || '0'}
                  onChange={(e) => handleHeaderChange('orderstatus_id', e.target.value)}
                  disabled={readOnlyInfo}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
               >
                  <option value="0">Open/Pending</option>
                  <option value="1">Approved</option>
                  <option value="2">Rejected</option>
               </select>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Order Date</label>
              <input 
                type="date"
                value={safeOrder.order_dt ? safeOrder.order_dt.split(/[ T]/)[0] : ''}
                onChange={(e) => handleHeaderChange('order_dt', e.target.value)}
                disabled={readOnlyInfo}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">PIC</label>
               <input 
                type="text"
                value={safeOrder.order_pic || ''}
                onChange={(e) => handleHeaderChange('order_pic', e.target.value)}
                disabled={readOnlyInfo}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Description</label>
              <textarea
                rows={1}
                value={safeOrder.order_description || ''}
                onChange={(e) => handleHeaderChange('order_description', e.target.value)}
                disabled={readOnlyInfo}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
              />
            </div>
        </div>

        <div className="pt-4 space-y-4">
                <OrderSheetTable 
                  ref={sheetRef} 
                  data={localSheets} 
                  orderId={id} 
                  projectId={Number(safeOrder.project_id) || 0} 
                  contractId={Number(safeOrder.contract_id) || 0}
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
