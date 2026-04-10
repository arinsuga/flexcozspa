'use client';

import Modal from '@/components/common/Modal';
import { Order } from '@/services/orderService';
import ExpenseForm from './ExpenseForm';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Order>) => void;
  initialData?: Order;
  isLoading?: boolean;
  errors?: Record<string, string[]>;
}

export default function ExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  errors
}: ExpenseModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Expense' : 'New Expense'}
      size="lg"
    >
      <ExpenseForm 
        initialData={initialData} 
        onSubmit={onSubmit} 
        isLoading={isLoading} 
        errors={errors} 
      />
    </Modal>
  );
}
