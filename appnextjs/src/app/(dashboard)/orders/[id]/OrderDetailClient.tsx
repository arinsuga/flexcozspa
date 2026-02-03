'use client';

import { useRouter } from 'next/navigation';
import { useOrder, useOrderMutations } from '@/hooks/useOrders';
import { useProjects } from '@/hooks/useProjects';
import { useContracts } from '@/hooks/useContracts';
import Button from '@/components/common/Button';
import OrderSheetTable from '@/components/features/orders/OrderSheetTable';
import InfoDialog from '@/components/common/InfoDialog';
import { useRef, useState, useMemo, useEffect } from 'react';
import { Order } from '@/services/orderService';
import { useOrderSheets } from '@/hooks/useOrderSheets';
import { OrderSheet } from '@/services/orderSheetService';

interface OrderDetailClientProps {
  id: string;
  initialData?: Partial<Order>;
  mode?: 'create' | 'edit';
  onBack?: () => void;
  onSubmit?: (data: Partial<Order>) => void;
  submitLabel?: string;
  readOnlyInfo?: boolean;
}

export default function OrderDetailClient({ id, initialData, mode = 'edit', onBack, onSubmit, submitLabel, readOnlyInfo = false }: OrderDetailClientProps) {
  const router = useRouter();
  const { data: orderResponse, isLoading: isOrderLoading } = useOrder(id);
  const { data: projectsData } = useProjects();
  const { data: contractsData } = useContracts();
  const { data: sheetsData, isLoading: isSheetsLoading } = useOrderSheets(id);
  const { updateOrder: updateOrderMutation, createOrder: createOrderMutation } = useOrderMutations();

  const projects = useMemo(() => projectsData?.data || [], [projectsData]);
  const contracts = useMemo(() => contractsData?.data || [], [contractsData]);

  // Resolve order data: prefer initialData (for create mode) or fetched data
  const fetchedOrder = orderResponse?.data || orderResponse;
  const [order, setOrder] = useState<Partial<Order> | null>(initialData || null);
  const [isDataInitialized, setIsDataInitialized] = useState(false);

  // Initialize order data when it becomes available
  useEffect(() => {
    if (fetchedOrder && !isDataInitialized) {
      setOrder(fetchedOrder);
      setIsDataInitialized(true);
    }
  }, [fetchedOrder, isDataInitialized]);

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


  // Sync localSheets with API data once
  useEffect(() => {
    if (hasInitializedSheets) return;

    const itemsFromProps = (initialData as any)?.order_items || (initialData as any)?.ordersheets;
    
    if (Array.isArray(itemsFromProps)) {
       setLocalSheets(itemsFromProps);
       setHasInitializedSheets(true);
    } else if (sheetsData && id !== 'new') {
       const sheets = Array.isArray(sheetsData) ? sheetsData : (sheetsData as any).data || [];
       setLocalSheets(sheets);
       setHasInitializedSheets(true);
    } else if (fetchedOrder?.ordersheets && id !== 'new') {
       setLocalSheets(fetchedOrder.ordersheets);
       setHasInitializedSheets(true);
    }
  }, [sheetsData, initialData, hasInitializedSheets, id, fetchedOrder]);

  const handleHeaderChange = (field: keyof Order, value: any) => {
    setOrder(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleSave = async () => {
    if (!order) return;
    
    // Latest data from the table
    const allRowsToSave: Partial<OrderSheet>[] = sheetRef.current?.getSheetData() || [];

    const payload = {
       ...order,
       project_id: order.project_id ? Number(order.project_id) : undefined,
       contract_id: order.contract_id ? Number(order.contract_id) : undefined,
       order_items: allRowsToSave // Transitioning to order_items for consistency
    };

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

  if ((isOrderLoading && id !== 'new') || (isSheetsLoading && id !== 'new')) {
    return <div className="p-6">Loading...</div>;
  }
  
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
            <Button variant="ghost" onClick={onBack || (() => router.back())} leftIcon="arrow_back">Back</Button>
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
               <select
                  value={safeOrder.project_id || ''}
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
               <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Contract</label>
               <select
                  value={safeOrder.contract_id || ''}
                  onChange={(e) => handleHeaderChange('contract_id', e.target.value)}
                  disabled={readOnlyInfo}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs py-1 dark:bg-gray-700 dark:border-gray-600 ${readOnlyInfo ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
               >
                  <option value="">Select Contract</option>
                  {contracts.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.contract_name}</option>
                  ))}
               </select>
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
                value={safeOrder.order_dt ? safeOrder.order_dt.split('T')[0] : ''}
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
