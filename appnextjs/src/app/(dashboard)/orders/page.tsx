'use client';

import { useOrders, useOrderMutations } from '@/hooks/useOrders';
import React, { useState } from 'react';
import Button from '@/components/common/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Order } from '@/services/orderService';
import { TableSkeleton } from '@/components/common/Skeleton';
import { useRouter } from 'next/navigation';
import Input from '@/components/common/Input';
import SelectInput from '@/components/common/SelectInput';
import Pagination from '@/components/common/Pagination';


export default function OrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState('');

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const { data: ordersResponse, isLoading, error } = useOrders({
    page,
    per_page: 10,
    search_query: searchQuery,
    search_column: searchColumn,
    sort_by: 'id',
    sort_order: 'desc'
  });
  const { deleteOrder } = useOrderMutations();

  // Handle both direct array and paginated response formats
  const orders = ordersResponse?.data && Array.isArray(ordersResponse.data)
    ? ordersResponse.data
    : Array.isArray(ordersResponse)
      ? ordersResponse
      : [];
    
  const meta = ordersResponse?.current_page 
    ? ordersResponse 
    : { current_page: 1, last_page: 1 };


  const [appError, setAppError] = useState<string | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const handleCreate = () => {
    router.push('/orders/new');
  };

  const handleEdit = (order: Order) => {
    router.push(`/orders/${order.id}?mode=edit`);
  };

  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (orderToDelete) {
        try {
            await deleteOrder.mutateAsync(orderToDelete.id);
            setIsDeleteOpen(false);
            setOrderToDelete(null);
        } catch (err: unknown) {
             console.error('App Error:', err);
             setAppError("An unexpected error occurred. Please try again later.");
             setIsDeleteOpen(false);
        }
    }
  };

  const getStatusColor = (status: string | number) => {
      switch(String(status)) {
          case '1': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
          case '2': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
          case '0': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
          default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      }
  };

  if (isLoading) return <TableSkeleton cols={9} rows={8} />;
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

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-48">
                <SelectInput
                    options={[
                        {value: '', label: 'All Columns'},
                        {value: 'order_number', label: 'Order No'},
                        {value: 'order_description', label: 'Description'},
                        {value: 'project_number', label: 'Project Number'},
                        {value: 'project_name', label: 'Project Name'},
                        {value: 'contract_number', label: 'Contract Number'},
                        {value: 'contract_name', label: 'Contract Name'},
                    ]}
                    value={searchColumn}
                    onChange={(val) => setSearchColumn(val as string)}
                    placeholder="Search By"
                    className="z-30" 
                />
            </div>
            <div className="flex-1 flex gap-2">
                <Input
                    placeholder="Search orders..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <Button onClick={handleSearch} iconOnly={false} leftIcon="search">
                    Search
                </Button>
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden flex flex-col h-[600px]">
        <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Project No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contract No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contract Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {orders?.map((order: Order) => (
              <tr 
                key={order.id} 
                onClick={() => router.push(`/orders/${order.id}?mode=view`)}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {order.project?.project_number || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {order.project?.project_name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {order.contract?.contract_number || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {order.contract?.contract_name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    {order.order_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{order.order_description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.orderstatus_id)}`}>
                        {order.status?.name || order.orderstatus_id}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                   {order.order_dt ? order.order_dt.split('T')[0] : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-4">
                        <button 
                            onClick={() => handleEdit(order)}
                            className="text-primary hover:text-indigo-900"
                            title="Edit"
                        >
                            <span className="material-icons">edit</span>
                        </button>
                        <button 
                            onClick={() => handleDeleteClick(order)}
                            className="text-error hover:text-red-900"
                            title="Delete"
                        >
                            <span className="material-icons">delete</span>
                        </button>
                    </div>
                </td>
              </tr>
            ))}
            {orders?.length === 0 && (
                <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No orders found. Create one to get started.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      <div className="mt-4">
         <Pagination
            currentPage={meta.current_page || 1}
            lastPage={meta.last_page || 1}
            onPageChange={setPage}
         />
      </div>

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
