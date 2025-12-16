'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Contract } from '@/services/contractService';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Contract>) => void;
  initialData?: Contract;
  isLoading?: boolean;
}

export default function ContractModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}: ContractModalProps) {
  const [formData, setFormData] = useState<Partial<Contract>>({
    contract_number: '',
    name: '',
    description: '',
    amount: 0,
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        contract_number: '',
        name: '',
        description: '',
        amount: 0,
        start_date: '',
        end_date: '',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      title={initialData ? 'Edit Contract' : 'New Contract'}
      size="lg"
    >
      <form id="contract-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contract Number"
              name="contract_number"
              value={formData.contract_number}
              onChange={handleChange}
              required
            />
            <Input
              label="Contract Name"
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
            {/* Status could be a select, skipping for now or adding as hidden default */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              name="start_date"
              type="date"
              value={formData.start_date ? formData.start_date.split('T')[0] : ''} // basic formatting
              onChange={handleChange}
            />
            <Input
              label="End Date"
              name="end_date"
              type="date"
              value={formData.end_date ? formData.end_date.split('T')[0] : ''}
              onChange={handleChange}
            />
        </div>

        <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              {initialData ? 'Update Contract' : 'Create Contract'}
            </Button>
        </div>
      </form>
    </Modal>
  );
}
