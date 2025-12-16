'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Vendor } from '@/services/vendorService';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Vendor>) => void;
  initialData?: Vendor;
  isLoading?: boolean;
}

export default function VendorModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}: VendorModalProps) {
  const [formData, setFormData] = useState<Partial<Vendor>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'active',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      title={initialData ? 'Edit Vendor' : 'New Vendor'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Vendor Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        
        <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={handleChange}
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <textarea
                name="address"
                rows={3}
                value={formData.address || ''}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blacklisted">Blacklisted</option>
            </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              {initialData ? 'Update Vendor' : 'Create Vendor'}
            </Button>
        </div>
      </form>
    </Modal>
  );
}
