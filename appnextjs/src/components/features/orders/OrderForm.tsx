'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Order } from '@/services/orderService';
import SelectInput from '@/components/common/SelectInput';
import Textarea from '@/components/common/Textarea';
import { useProjects } from '@/hooks/useProjects';
import { useContracts } from '@/hooks/useContracts';
import { Project } from '@/services/projectService';
import { Contract } from '@/services/contractService';
import Link from 'next/link';
import { useOrderStatuses } from '@/hooks/useOrderStatuses';
import { OrderStatus } from '@/services/orderStatusService';

interface OrderFormProps {
  initialData?: Partial<Order>;
  onSubmit: (data: Partial<Order>) => void;
  isLoading?: boolean;
  errors?: Record<string, string[]>;
  submitLabel?: string;
}

export default function OrderForm({ initialData, onSubmit, isLoading, errors, submitLabel }: OrderFormProps) {
  const { data: projectsData } = useProjects();
  const { data: contractsData } = useContracts();
  const { data: statusData } = useOrderStatuses();
  
  const projects = (projectsData?.data || []) as Project[];
  const contracts = (contractsData?.data || []) as Contract[];
  const statuses = Array.isArray(statusData) ? statusData : (statusData?.data || []);

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<Partial<Order>>(() => ({
    order_number: initialData?.order_number || '',
    order_description: initialData?.order_description || '',
    order_pic: initialData?.order_pic || '',
    order_dt: initialData?.order_dt || getCurrentDate(),
    orderstatus_id: initialData?.orderstatus_id || 1,
    project_id: initialData?.project_id || undefined,
    contract_id: initialData?.contract_id || undefined,
  }));

  // Accurate initialization tracking
  const [isInitialized, setIsInitialized] = useState(!!(initialData && Object.keys(initialData).length > 2));

  // Sync formData when initialData changes (essential for async fetches)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 2 && !isInitialized) {
      setFormData({
        order_number: initialData.order_number || '',
        order_description: initialData.order_description || '',
        order_pic: initialData.order_pic || '',
        order_dt: initialData.order_dt || getCurrentDate(),
        orderstatus_id: initialData.orderstatus_id || 1,
        project_id: initialData.project_id || undefined,
        contract_id: initialData.contract_id || undefined,
      });
      setIsInitialized(true);
    }
  }, [initialData, isInitialized]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 shadow sm:rounded-lg">
      <div className="flex justify-end gap-3">
        <Link
          href="/orders"
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Cancel
        </Link>
        <Button variant="primary" type="submit" isLoading={isLoading}>
          {isLoading ? 'Saving...' : (submitLabel || (initialData?.id ? 'Update Order' : 'Create Order'))}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1 */}
        <div className="space-y-4">
          <SelectInput
            label="Project Name *"
            name="project_id"
            required
            options={projects.map(project => ({
              value: project.id,
              label: project.project_name
            }))}
            value={formData.project_id}
            onChange={(value) => setFormData(prev => ({ ...prev, project_id: value as number }))}
            placeholder="Select Project"
            error={errors?.project_id?.[0]}
          />
          
          <Input
            label="Order Number *"
            name="order_number"
            value={formData.order_number || ''}
            onChange={handleChange}
            required
            error={errors?.order_number?.[0]}
          />

          <Input
            label="Order PIC"
            name="order_pic"
            value={formData.order_pic || ''}
            onChange={handleChange}
            error={errors?.order_pic?.[0]}
          />

          <Textarea
            label="Order Description *"
            name="order_description"
            value={formData.order_description || ''}
            onChange={handleChange}
            required
            rows={3}
            error={errors?.order_description?.[0]}
          />
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <SelectInput
            label="Contract Name *"
            name="contract_id"
            required
            options={contracts.map(contract => ({
              value: contract.id,
              label: contract.contract_name
            }))}
            value={formData.contract_id}
            onChange={(value) => setFormData(prev => ({ ...prev, contract_id: value as number }))}
            placeholder="Select Contract"
            error={errors?.contract_id?.[0]}
          />

          <Input
            label="Order Date"
            name="order_dt"
            type="date"
            value={formData.order_dt ? formData.order_dt.split(/[ T]/)[0] : ''}
            onChange={handleChange}
            error={errors?.order_dt?.[0]}
          />

          <SelectInput
            label="Status"
            name="orderstatus_id"
            options={statuses.map((s: OrderStatus) => ({
              value: s.id,
              label: s.name
            }))}
            value={formData.orderstatus_id}
            onChange={(value) => setFormData(prev => ({ ...prev, orderstatus_id: value as number }))}
            error={errors?.orderstatus_id?.[0]}
            placeholder="Select Status"
          />
        </div>
      </div>
    </form>
  );
}
