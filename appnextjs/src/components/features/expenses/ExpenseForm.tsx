'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Expense } from '@/services/expenseService';
import SelectInput from '@/components/common/SelectInput';
import Textarea from '@/components/common/Textarea';
import { useProjects } from '@/hooks/useProjects';
import { useContracts } from '@/hooks/useContracts';
import { Project } from '@/services/projectService';
import { Contract } from '@/services/contractService';
import Link from 'next/link';
import { useReffTypes } from '@/hooks/useReffTypes';
import { useOrders } from '@/hooks/useOrders';
import { ReffType } from '@/services/refftypeService';
import { Order } from '@/services/orderService';

interface ExpenseFormProps {
  initialData?: Partial<Expense>;
  onSubmit: (data: Partial<Expense>) => void;
  isLoading?: boolean;
  errors?: Record<string, string[]>;
  submitLabel?: string;
}

export default function ExpenseForm({ initialData, onSubmit, isLoading, errors, submitLabel }: ExpenseFormProps) {
  const { data: projectsData } = useProjects();
  const { data: reffTypesData } = useReffTypes();
  
  const projects = (projectsData?.data || []) as Project[];
  const reffTypes = (reffTypesData?.data || []) as ReffType[];

  const [formData, setFormData] = useState<Partial<Expense>>(() => ({
    expense_number: initialData?.expense_number || '',
    expense_description: initialData?.expense_description || '',
    expense_pic: initialData?.expense_pic || '',
    expense_dt: initialData?.expense_dt || getCurrentDate(),
    expensestatus_id: initialData?.expensestatus_id || 1,
    project_id: initialData?.project_id || undefined,
    contract_id: initialData?.contract_id || undefined,
    order_id: initialData?.order_id || undefined,
    refftype_id: initialData?.refftype_id || undefined,
  }));

  // Fetch orders based on selected project
  const { data: ordersData } = useOrders(formData.project_id ? { project_id: formData.project_id } : { enabled: false });
  const orders = (ordersData?.data || []) as Order[];

  // Accurate initialization tracking
  const [isInitialized, setIsInitialized] = useState(!!(initialData && Object.keys(initialData).length > 2));

  // Sync formData when initialData changes (essential for async fetches)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 2 && !isInitialized) {
      setFormData({
        expense_number: initialData.expense_number || '',
        expense_description: initialData.expense_description || '',
        expense_pic: initialData.expense_pic || '',
        expense_dt: initialData.expense_dt || getCurrentDate(),
        expensestatus_id: initialData.expensestatus_id || 1,
        project_id: initialData.project_id || undefined,
        contract_id: initialData.contract_id || undefined,
        order_id: initialData.order_id || undefined,
        refftype_id: initialData.refftype_id || undefined,
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
          href="/expenses"
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Cancel
        </Link>
        <Button variant="primary" type="submit" isLoading={isLoading}>
          {isLoading ? 'Saving...' : (submitLabel || (initialData?.id ? 'Update Expense' : 'Create Expense'))}
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

          <SelectInput
            label="Expense Number Type *"
            name="refftype_id"
            required
            options={reffTypes.map(rt => ({
              value: rt.id,
              label: rt.refftype_name
            }))}
            value={formData.refftype_id}
            onChange={(value) => setFormData(prev => ({ ...prev, refftype_id: value as number }))}
            placeholder="Select Type"
            error={errors?.refftype_id?.[0]}
          />
          
          <Input
            label="Expense Number *"
            name="expense_number"
            value={formData.expense_number || ''}
            onChange={handleChange}
            required
            error={errors?.expense_number?.[0]}
          />

          <Input
            label="Expense PIC"
            name="expense_pic"
            value={formData.expense_pic || ''}
            onChange={handleChange}
            error={errors?.expense_pic?.[0]}
          />

          <Textarea
            label="Expense Description *"
            name="expense_description"
            value={formData.expense_description || ''}
            onChange={handleChange}
            required
            rows={3}
            error={errors?.expense_description?.[0]}
          />
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <SelectInput
            label="Order Name *"
            name="order_id"
            required
            options={orders.map(order => ({
              value: order.id,
              label: `${order.order_number} - ${order.order_description.substring(0, 30)}...`
            }))}
            value={formData.order_id}
            onChange={(value) => {
              const selectedOrder = orders.find(o => o.id === value);
              setFormData(prev => ({ 
                ...prev, 
                order_id: value as number,
                contract_id: selectedOrder?.contract_id || prev.contract_id
              }));
            }}
            placeholder={formData.project_id ? "Select Order" : "Select Project first"}
            disabled={!formData.project_id}
            error={errors?.order_id?.[0]}
          />

          <Input
            label="Expense Date"
            name="expense_dt"
            type="date"
            value={formData.expense_dt ? formData.expense_dt.split(/[ T]/)[0] : ''}
            onChange={handleChange}
            error={errors?.expense_dt?.[0]}
          />
        </div>
      </div>
    </form>
  );
}
