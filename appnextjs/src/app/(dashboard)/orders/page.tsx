'use client';

import { useOrders, useOrderMutations } from '@/hooks/useOrders';
import { useState } from 'react';
import Button from '@/components/common/Button';
import OrderModal from '@/components/features/orders/OrderModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Order } from '@/services/orderService';
import Link from 'next/link';
import { TableSkeleton } from '@/components/common/Skeleton';

export default function OrdersPage() {
  const { data: ordersResponse, isLoading, error } = useOrders();
  const { createOrder, updateOrder, deleteOrder } = useOrderMutations();

  // Handle both direct array and paginated response formats
  const orders = Array.isArray(ordersResponse) 
    ? ordersResponse 
    : ordersResponse?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | undefined>(undefined);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [appError, setAppError] = useState<string | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const handleCreate = () => {
    setEditingOrder(undefined);
    setFormErrors({});
    setAppError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setFormErrors({});
    setAppError(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (data: Partial<Order>) => {
    try {
      if (editingOrder) {
        await updateOrder.mutateAsync({ id: editingOrder.id, data });
      } else {
        await createOrder.mutateAsync(data);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      if (error.response?.status === 422) {
        setFormErrors(error.response.data.errors);
      } else {
        console.error('App Error:', error);
        setAppError("An application error occurred. Please try again later.");
        setIsModalOpen(false);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (orderToDelete) {
      await deleteOrder.mutateAsync(orderToDelete.id);
      setIsDeleteOpen(false);
      setOrderToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
          case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
          case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
          default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      }
  };

  if (isLoading) return <TableSkeleton cols={5} rows={8} />;
  if (error) return <div className="p-4 text-error">Error loading orders</div>;

  return (
    <div className="space-y-6">
      {appError && (
        <div className="bg-red-50 border-l-4 border-error p-4 relative dark:bg-red-900/20 dark:border-red-500">
            <div className="flex">
                <div className="flex-shrink-0">
                    <span className="text-error">⚠️</span>
                </div>
                <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-200">
                        {appError}
                    </p>
                </div>
                <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                        <button
                            type="button"
                            onClick={() => setAppError(null)}
                            className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50 dark:bg-transparent dark:hover:bg-red-900/40"
                        >
                            <span className="sr-only">Dismiss</span>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <Button onClick={handleCreate} leftIcon="add">
          New Order
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {orders?.map((order: Order) => (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    <Link href={`/orders/${order.id}`} className="hover:underline">
                        {order.order_number}
                    </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{order.order_description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                        {order.order_status === '0' ? 'Open/Pending' : 
                         order.order_status === '1' ? 'Approved' : 
                         order.order_status === '2' ? 'Rejected' : 
                         order.order_status}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                   {order.order_dt ? order.order_dt.split('T')[0] : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(order)}
                    className="text-primary hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(order)}
                    className="text-error hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {orders?.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No orders found. Create one to get started.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingOrder}
        isLoading={createOrder.isPending || updateOrder.isPending}
        errors={formErrors}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Order"
        message={`Are you sure you want to delete ${orderToDelete?.order_number}? This action cannot be undone.`}
        variant="danger"
        isLoading={deleteOrder.isPending}
      />
    </div>
  );
}
