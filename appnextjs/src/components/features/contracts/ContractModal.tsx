'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Contract } from '@/services/contractService';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/services/projectService';
import SelectInput from '@/components/common/SelectInput';
import Textarea from '@/components/common/Textarea';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Contract>) => void;
  initialData?: Contract;
  isLoading?: boolean;
  errors?: Record<string, string[]>;
}

export default function ContractModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  errors
}: ContractModalProps) {
  const { data: projectsData } = useProjects();
  const projects = (projectsData?.data || []) as Project[];
  
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<Partial<Contract>>({
    contract_number: '',
    contract_name: '',
    contract_description: '',
    contract_amount: '',
    contract_startdt: '',
    contract_enddt: '',
    project_id: undefined,
    contract_pic: '',
    contractstatus_id: 0,
    contract_progress: '',
    contract_payment: '',
    contract_payment_status: '',
    contract_payment_dt: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    } else {
      const currentDate = getCurrentDate();
      setFormData({
        contract_number: '',
        contract_name: '',
        contract_description: '',
        contract_amount: '',
        contract_startdt: currentDate,
        contract_enddt: currentDate,
        project_id: undefined,
        contract_pic: '',
        contractstatus_id: 0,
        contract_progress: '0',
        contract_payment: '0.00',
        contract_payment_status: 'Unpaid',
        contract_payment_dt: currentDate,
      });
    }
  }, [initialData, isOpen]);

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Contract' : 'New Contract'}
      size="lg"
    >
      <form id="contract-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contract Number *"
              name="contract_number"
              value={formData.contract_number}
              onChange={handleChange}
              required
              error={errors?.contract_number?.[0]}
            />
            <Input
              label="Contract Name *"
              name="contract_name"
              value={formData.contract_name || ''}
              onChange={handleChange}
              required
              error={errors?.contract_name?.[0]}
            />
        </div>
        
        <Textarea
          label="Description"
          name="contract_description"
          value={formData.contract_description || ''}
          onChange={handleChange}
          error={errors?.contract_description?.[0]}
          rows={3}
        />

        <SelectInput
            label="Project Name"
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
            label="Contract PIC"
            name="contract_pic"
            value={formData.contract_pic || ''}
            onChange={handleChange}
            error={errors?.contract_pic?.[0]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Amount"
              name="contract_amount"
              type="number"
              value={formData.contract_amount || ''}
              onChange={handleChange}
              error={errors?.contract_amount?.[0]}
            />
            <div>
              <label htmlFor="contractstatus_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                name="contractstatus_id"
                id="contractstatus_id"
                value={formData.contractstatus_id || 0}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value={0}>Open</option>
                <option value={1}>Approved</option>
                <option value={2}>Closed</option>
                <option value={3}>Canceled/Rejected</option>
                <option value={4}>Pending</option>
              </select>
              {errors?.contractstatus_id?.[0] && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contractstatus_id[0]}</p>
              )}
            </div>
        </div>

        <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Payment & Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Progress"
                  name="contract_progress"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.contract_progress || ''}
                  onChange={handleChange}
                  error={errors?.contract_progress?.[0]}
                />
                 <Input
                  label="Payment Amount"
                  name="contract_payment"
                  type="number"
                  value={formData.contract_payment || ''}
                  onChange={handleChange}
                  error={errors?.contract_payment?.[0]}
                />
                <Input
                  label="Payment Status"
                  name="contract_payment_status"
                  value={formData.contract_payment_status || ''}
                  onChange={handleChange}
                  error={errors?.contract_payment_status?.[0]}
                />
                 <Input
                  label="Payment Date"
                  name="contract_payment_dt"
                  type="date"
                  value={formData.contract_payment_dt ? formData.contract_payment_dt.split('T')[0] : ''}
                  onChange={handleChange}
                  error={errors?.contract_payment_dt?.[0]}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              name="contract_startdt"
              type="date"
              value={formData.contract_startdt ? formData.contract_startdt.split('T')[0] : ''}
              onChange={handleChange}
              error={errors?.contract_startdt?.[0]}
            />
            <Input
              label="End Date"
              name="contract_enddt"
              type="date"
              value={formData.contract_enddt ? formData.contract_enddt.split('T')[0] : ''}
              onChange={handleChange}
              error={errors?.contract_enddt?.[0]}
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
