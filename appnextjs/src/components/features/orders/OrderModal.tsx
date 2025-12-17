'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Order } from '@/services/orderService';
import SelectInput from '@/components/common/SelectInput';

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
  const [formData, setFormData] = useState<Partial<Order>>({
    order_number: '',
    name: '',
    description: '',
    amount: 0,
    order_date: '',
    status: 'pending', // Default status
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    } else {
      setFormData({
        order_number: '',
        name: '',
        description: '',
        amount: 0,
        order_date: '',
        status: 'pending',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Order' : 'New Order'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Order Number"
              name="order_number"
              value={formData.order_number}
              onChange={handleChange}
              required
              error={errors?.order_number?.[0]}
            />
            <Input
              label="Order Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              error={errors?.name?.[0]}
            />
        </div>
        
        <Input
          label="Description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          error={errors?.description?.[0]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Input
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                error={errors?.amount?.[0]}
             />
             <SelectInput
                label="Status"
                name="status"
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]}
                value={formData.status}
                onChange={(value) => setFormData(prev => ({ ...prev, status: value as string }))}
                error={errors?.status?.[0]}
             />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Order Date"
              name="order_date"
              type="date"
              value={formData.order_date ? formData.order_date.split('T')[0] : ''}
              onChange={handleChange}
              error={errors?.order_date?.[0]}
            />
             {/* Add Project/Contract/Vendor Pickers later */}
        </div>

        <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              {initialData ? 'Update Order' : 'Create Order'}
            </Button>
        </div>
      </form>
    </Modal>
  );
}
