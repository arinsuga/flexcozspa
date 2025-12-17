'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Project } from '@/services/projectService';
import SelectInput from '@/components/common/SelectInput';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Project>) => void;
  initialData?: Project;
  isLoading?: boolean;
  errors?: Record<string, string[]>;
}

export default function ProjectModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  errors
}: ProjectModalProps) {
  const [formData, setFormData] = useState<Partial<Project>>({
    project_name: '',
    project_description: '',
    project_number: '',
    is_active: 1,
    project_startdt: '',
    project_enddt: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    } else {
      setFormData({
        project_name: '',
        project_description: '',
        project_number: '',
        is_active: 1,
        project_startdt: '',
        project_enddt: '',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
        ...formData,
        project_startdt: formData.project_startdt || null,
        project_enddt: formData.project_enddt || null,
        project_description: formData.project_description || null,
        project_number: formData.project_number || null,
    };
    onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Project' : 'New Project'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          name="project_name"
          value={formData.project_name || ''}
          onChange={handleChange}
          required
          error={errors?.project_name?.[0]}
        />
        
        <Input
          label="Project Number"
          name="project_number"
          value={formData.project_number || ''}
          onChange={handleChange}
          error={errors?.project_number?.[0]}
        />
        
        <Input
          label="Description"
          name="project_description"
          value={formData.project_description || ''}
          onChange={handleChange}
          error={errors?.project_description?.[0]}
        />

        <SelectInput
            label="Status"
            name="is_active"
            options={[
              { value: 1, label: 'Active' },
              { value: 0, label: 'Inactive' }
            ]}
            value={formData.is_active}
            onChange={(value) => setFormData(prev => ({ ...prev, is_active: value as number }))}
        />

        <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              name="project_startdt"
              type="date"
              value={formData.project_startdt ? formData.project_startdt.split('T')[0] : ''}
              onChange={handleChange}
              error={errors?.project_startdt?.[0]}
            />
            <Input
              label="End Date"
              name="project_enddt"
              type="date"
              value={formData.project_enddt ? formData.project_enddt.split('T')[0] : ''}
              onChange={handleChange}
              error={errors?.project_enddt?.[0]}
            />
        </div>

        <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              {initialData ? 'Update Project' : 'Create Project'}
            </Button>
        </div>
      </form>
    </Modal>
  );
}
