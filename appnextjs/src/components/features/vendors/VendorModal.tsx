'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Vendor } from '@/services/vendorService';
import { vendorTypeService, VendorType } from '@/services/vendorTypeService';
import SelectInput from '@/components/common/SelectInput';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Vendor>) => void;
  initialData?: Vendor;
  isLoading?: boolean;
  errors?: Record<string, string[]>;
}

export default function VendorModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  errors
}: VendorModalProps) {
  const [formData, setFormData] = useState<Partial<Vendor>>({
    vendor_code: '',
    vendor_name: '',
    vendortype_id: 0,
    vendor_email: '',
    vendor_phone: '',
    vendor_address: '',
    is_active: 1, // Default to active, not shown in UI
  });
  
  const [vendorTypes, setVendorTypes] = useState<VendorType[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchVendorTypes = async () => {
      try {
        const data = await vendorTypeService.getAll();
        setVendorTypes(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error('Failed to load vendor types', err);
      }
    };
    if (isOpen) {
      fetchVendorTypes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        vendor_code: '',
        vendor_name: '',
        vendortype_id: 0,
        vendor_email: '',
        vendor_phone: '',
        vendor_address: '',
        is_active: 1,
      });
    }
    setValidationErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error for the field being edited
    if (validationErrors[name]) {
        setValidationErrors(prev => ({ ...prev, [name]: [] }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string[]> = {};
    
    if (!formData.vendor_code) {
        newErrors.vendor_code = ['Vendor Code is required'];
    }
    if (!formData.vendortype_id || formData.vendortype_id == 0) {
        newErrors.vendortype_id = ['Vendor Type is required'];
    }
    if (formData.vendor_phone && !/^[0-9\s()\-]+$/.test(formData.vendor_phone)) {
        newErrors.vendor_phone = ['Phone number can only contain numbers, spaces, (, ), and -'];
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
        onSubmit(formData);
    }
  };

  // Merge API errors with client-side validation errors
  const displayErrors = { ...errors, ...validationErrors };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Vendor' : 'New Vendor'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <Input
              label="Vendor Code"
              name="vendor_code"
              value={formData.vendor_code || ''}
              onChange={handleChange}
              required
              error={displayErrors?.vendor_code?.[0]}
            />
            <SelectInput
                label="Vendor Type"
                name="vendortype_id"
                required
                options={vendorTypes.map(type => ({
                  value: type.id,
                  label: type.vendortype_name
                }))}
                value={formData.vendortype_id}
                onChange={(value) => setFormData(prev => ({ ...prev, vendortype_id: value as number }))}
                placeholder="Select Type"
                error={displayErrors?.vendortype_id?.[0]}
            />
        </div>

        <Input
          label="Vendor Name"
          name="vendor_name"
          value={formData.vendor_name || ''}
          onChange={handleChange}
          required
          error={displayErrors?.vendor_name?.[0]}
        />
        
        <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              name="vendor_email"
              type="email"
              value={formData.vendor_email || ''}
              onChange={handleChange}
              error={displayErrors?.vendor_email?.[0]}
            />
            <Input
              label="Phone"
              name="vendor_phone"
              type="tel"
              value={formData.vendor_phone || ''}
              onChange={handleChange}
              error={displayErrors?.vendor_phone?.[0]}
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <textarea
                name="vendor_address"
                rows={3}
                value={formData.vendor_address || ''}
                onChange={handleChange}
                className={`block w-full rounded-lg border px-3 py-2 shadow-sm outline-none transition-all dark:bg-gray-800 dark:text-gray-100 ${
                  displayErrors?.vendor_address 
                    ? 'border-error ring-1 ring-error focus:border-error focus:ring-error' 
                    : 'border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700'
                }`}
            />
            {displayErrors?.vendor_address && (
              <p className="mt-1 text-xs text-error">{displayErrors.vendor_address[0]}</p>
            )}
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
