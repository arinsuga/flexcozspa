'use client';

import Modal from '@/components/common/Modal';
import { Order } from '@/services/orderService';
import OrderForm from './OrderForm';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Order>) => void;
  initialData?: Order;
  isLoading?: boolean;
  errors?: Record<string, string[]>;
}

export default function OrderModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  errors
}: OrderModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Order' : 'New Order'}
      size="lg"
    >
      <OrderForm 
        initialData={initialData} 
        onSubmit={onSubmit} 
        isLoading={isLoading} 
        errors={errors} 
      />
    </Modal>
  );
}
