'use client';

import React, { useState } from 'react';
import { Contract } from '@/services/contractService';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/services/projectService';
import Link from 'next/link';
import SelectInput from '@/components/common/SelectInput';
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';
// import { useContractStatuses } from '@/hooks/useContractStatuses';
// import { ContractStatus } from '@/services/contractStatusService';
import { formatNumeric, parseNumeric } from '@/utils/numberFormat';

interface ContractFormProps {
  initialData?: Partial<Contract>;
  onSubmit: (data: Partial<Contract>) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export default function ContractForm({ initialData, onSubmit, isLoading, submitLabel }: ContractFormProps) {
  const { data: projectsData } = useProjects();
  const projects = (projectsData?.data || []) as Project[];
  


  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Initialize form state
  const [formData, setFormData] = useState({
    contract_number: initialData?.contract_number || '',
    contract_name: initialData?.contract_name || '',
    contract_description: initialData?.contract_description || '',
    contract_startdt: initialData?.contract_startdt || getCurrentDate(),
    contract_enddt: initialData?.contract_enddt || getCurrentDate(),
    contract_amount: initialData?.contract_amount || '',
    contract_pic: initialData?.contract_pic || '',
    project_id: initialData?.project_id || undefined,
    contractstatus_id: initialData?.contractstatus_id ?? 1,
    contract_progress: initialData?.contract_progress || '0',
    contract_payment: initialData?.contract_payment || '',
    contract_payment_status: initialData?.contract_payment_status || '',
    contract_payment_dt: initialData?.contract_payment_dt || getCurrentDate(),
    contract_dt: initialData?.contract_dt || getCurrentDate(),
  });

  // Accurate initialization tracking: if initialData has properties, we're likely initialized
  const [isInitialized, setIsInitialized] = useState(!!(initialData && Object.keys(initialData).length > 2));

  // Sync formData when initialData changes (essential for async fetches)
  React.useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0 && !isInitialized) {
      setFormData({
        contract_number: initialData.contract_number || '',
        contract_name: initialData.contract_name || '',
        contract_description: initialData.contract_description || '',
        contract_startdt: initialData.contract_startdt || getCurrentDate(),
        contract_enddt: initialData.contract_enddt || getCurrentDate(),
        contract_amount: initialData.contract_amount || '',
        contract_pic: initialData.contract_pic || '',
        project_id: initialData.project_id || undefined,
        contractstatus_id: initialData.contractstatus_id ?? 1,
        contract_progress: initialData.contract_progress || '0',
        contract_payment: initialData.contract_payment || '',
        contract_payment_status: initialData.contract_payment_status || '',
        contract_payment_dt: initialData.contract_payment_dt || getCurrentDate(),
        contract_dt: initialData.contract_dt || getCurrentDate(),
      });
      setIsInitialized(true);
    }
  }, [initialData, isInitialized]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Parse numeric fields back to numbers (or clean strings) before submission
    const submissionData = {
      ...formData,
      contract_amount: parseNumeric(formData.contract_amount?.toString() || '').toString(),
      contract_payment: parseNumeric(formData.contract_payment?.toString() || '').toString(),
      contract_progress: formData.contract_progress || '0',
    };
    onSubmit(submissionData);
  };

  const handleNumericBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: formatNumeric(value) }));
  };

  const handlePaymentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Only allow numbers, commas, and periods
    const cleanValue = value.replace(/[^0-9,.]/g, '');
    setFormData(prev => ({ ...prev, contract_payment: cleanValue }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 shadow sm:rounded-lg">
      <div className="flex justify-end gap-3">
        <Link
          href="/contracts"
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : (submitLabel || 'Save')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <Input
            label="Contract Number *"
            name="contract_number"
            id="contract_number"
            required
            maxLength={30}
            value={formData.contract_number || ''}
            onChange={handleChange}
            helperText="Max 30 characters"
          />
        </div>

        <div className="sm:col-span-3">
          <Input
            label="Contract Name *"
            name="contract_name"
            id="contract_name"
            required
            maxLength={50}
            value={formData.contract_name || ''}
            onChange={handleChange}
            helperText="Max 50 characters"
          />
        </div>

        <div className="sm:col-span-3">
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
           />
        </div>



        <div className="sm:col-span-3">
          <Input
            type="date"
            label="Contract Date *"
            name="contract_dt"
            id="contract_dt"
            required
            value={formData.contract_dt ? formData.contract_dt.split(/[ T]/)[0] : ''}
            onChange={handleChange}
          />
        </div>

        <div className="sm:col-span-4 row-span-2">
          <label htmlFor="contract_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <div className="mt-1">
            <Textarea
              id="contract_description"
              name="contract_description"
              rows={5}
              maxLength={255}
              value={formData.contract_description || ''}
              onChange={handleChange}
              helperText="Max 255 characters"
            />
          </div>
        </div>
        
        <div className="sm:col-span-2">
          <Input
            label="PIC"
            name="contract_pic"
            id="contract_pic"
            maxLength={30}
            value={formData.contract_pic || ''}
            onChange={handleChange}
            helperText="Max 30 characters"
          />
        </div>
        
        <div className="sm:col-span-2">
          <Input
            label="Amount"
            name="contract_amount"
            id="contract_amount"
            value={formData.contract_amount || ''}
            onChange={handleChange}
            onBlur={handleNumericBlur}
            className="text-right"
          />
        </div>

        <div className="sm:col-span-6 border-t pt-4 mt-4">
             <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Contract Details</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="sm:col-span-1">
                    <Input
                      type="date"
                      label="Payment Date"
                      name="contract_payment_dt"
                      id="contract_payment_dt"
                      value={formData.contract_payment_dt ? formData.contract_payment_dt.split(/[ T]/)[0] : ''}
                      onChange={handleChange}
                    />
                 </div>
                 <div className="sm:col-span-1">
                    <Input
                      label="Payment Amount"
                      name="contract_payment"
                      id="contract_payment"
                      value={formData.contract_payment || ''}
                      onChange={handlePaymentAmountChange}
                      onBlur={handleNumericBlur}
                      className="text-right"
                    />
                 </div>
                 <div className="sm:col-span-1">
                    <Input
                      type="date"
                      label="Start Date"
                      name="contract_startdt"
                      id="contract_startdt"
                      value={formData.contract_startdt ? formData.contract_startdt.split(/[ T]/)[0] : ''}
                      onChange={handleChange}
                    />
                 </div>
                 <div className="sm:col-span-1">
                    <Input
                      type="date"
                      label="End Date"
                      name="contract_enddt"
                      id="contract_enddt"
                      value={formData.contract_enddt ? formData.contract_enddt.split(/[ T]/)[0] : ''}
                      onChange={handleChange}
                    />
                 </div>
                 <div className="sm:col-span-2">
                    <label htmlFor="contract_progress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progress ({formData.contract_progress || 0}%)
                    </label>
                    <input 
                      type="range" 
                      name="contract_progress" 
                      id="contract_progress" 
                      min="0" 
                      max="100" 
                      value={formData.contract_progress || '0'} 
                      onChange={handleChange} 
                      className="mt-1 block w-full" 
                    />
                 </div>
             </div>
        </div>
      </div>


    </form>
  );
}
