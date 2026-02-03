'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';
import Button from '@/components/common/Button';
import { Project } from '@/services/projectService';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('ProjectModal handleSubmit triggered');
    const payload = {
        ...formData,
        project_startdt: formData.project_startdt || null,
        project_enddt: formData.project_enddt || null,
        project_description: formData.project_description || null,
        project_number: formData.project_number || null,
        projectstatus_id: formData.projectstatus_id || 1, // Default to 1 (Approved)
    };
    console.log('ProjectModal payload:', payload);
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
          required
          error={errors?.project_number?.[0]}
        />
        
        <Textarea
          label="Description"
          name="project_description"
          value={formData.project_description || ''}
          onChange={handleChange}
          rows={3}
          error={errors?.project_description?.[0]}
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

        {errors?.projectstatus_id && (
          <p className="text-sm text-error">{errors.projectstatus_id[0]}</p>
        )}

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
