'use client';

import { useParams, useRouter } from 'next/navigation';
import { useOrder } from '@/hooks/useOrders';
import { useOrderSheets, useOrderSheetMutations } from '@/hooks/useOrderSheets';
import Button from '@/components/common/Button';
import SheetComponent from '@/components/common/SheetComponent';
import Loading from '@/components/common/Loading';
import { useRef, useState, useEffect } from 'react';

const COLUMNS = [
    { type: 'hidden', name: 'id' },
    { type: 'text', title: 'Item Name', width: 150, name: 'item_name' },
    { type: 'text', title: 'Description', width: 300, name: 'description' },
    { type: 'numeric', title: 'Qty', width: 80, name: 'qty' },
    { type: 'numeric', title: 'Unit Price', width: 120, mask: '$ #,##0.00', name: 'unit_price' },
    { type: 'numeric', title: 'Total', width: 120, mask: '$ #,##0.00', name: 'total_price', readOnly: true },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  // @ts-ignore
  const id = params.id as string;
  
  const { data: order, isLoading: isOrderLoading } = useOrder(id);
  const { data: sheets, isLoading: isSheetsLoading } = useOrderSheets(id);
  const { saveSheet } = useOrderSheetMutations();
  
  const sheetRef = useRef<any>(null);
  
  const handleSave = async () => {
    if (!sheetRef.current) return;
    const currentData = sheetRef.current.getJson();
    try {
        await saveSheet.mutateAsync({ orderId: id, rows: currentData });
        alert('Saved successfully!');
    } catch (error) {
        console.error("Save failed", error);
        alert('Failed to save.');
    }
  };

  if (isOrderLoading || isSheetsLoading) return <div className="p-6">Loading...</div>;
  if (!order) return <div className="p-6 text-error">Order not found</div>;

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {order.order_number}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">{order.order_description}</p>
        </div>
        <div className="flex gap-2">
            <Button variant="ghost" onClick={() => router.back()} leftIcon="arrow_back">
                Back
            </Button>
            <Button 
                variant="primary" 
                leftIcon="save" 
                onClick={handleSave}
                isLoading={saveSheet.isPending}
            >
               Save Changes
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4 md:col-span-1 h-fit">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
                Details
            </h3>
            <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                   <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Order Date</label>
                   <div className="font-medium">{order.order_dt ? order.order_dt.split('T')[0] : 'N/A'}</div>
                </div>
                <div>
                   <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Status</label>
                   <div className="font-medium capitalize">
                        {order.orderstatus_id === '0' ? 'Open/Pending' : 
                         order.orderstatus_id === '1' ? 'Approved' : 
                         order.orderstatus_id === '2' ? 'Rejected' : 
                         order.orderstatus_id}
                   </div>
                </div>
                <div>
                    <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Description</label>
                    <div className="mt-1">{order.order_description || 'No description provided.'}</div>
                </div>
                <div>
                    <label className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Order PIC</label>
                    <div className="mt-1">{order.order_pic || 'N/A'}</div>
                </div>
            </div>
         </div>

         <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 md:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Order Sheet
                </h3>
            </div>
            
            <SheetComponent
                ref={sheetRef}
                data={sheets || []}
                columns={COLUMNS}
            />
         </div>
      </div>
    </div>
  );
}
