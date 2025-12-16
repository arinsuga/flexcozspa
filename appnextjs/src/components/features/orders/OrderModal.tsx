'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Order } from '@/services/orderService';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Order>) => void;
  initialData?: Order;
  isLoading?: boolean;
}

export default function OrderModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
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
      setFormData(initialData);
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
            />
            <Input
              label="Order Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
        </div>
        
        <Input
          label="Description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Input
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
             />
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
             </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Order Date"
              name="order_date"
              type="date"
              value={formData.order_date ? formData.order_date.split('T')[0] : ''}
              onChange={handleChange}
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
