'use client';

import OrderForm from '@/components/features/orders/OrderForm';
import { useOrderMutations } from '@/hooks/useOrders';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Order } from '@/services/orderService';

export default function NewOrderPage() {
  const { createOrder } = useOrderMutations();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = (data: Partial<Order>) => {
    createOrder.mutate(data, {
      onSuccess: () => {
        router.push('/orders');
      },
      onError: (error: any) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data.errors);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">New Order</h1>
      </div>
      <OrderForm onSubmit={handleSubmit} isLoading={createOrder.isPending} errors={errors} />
    </div>
  );
}
