'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Project } from '@/services/projectService';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Project>) => void;
  initialData?: Project;
  isLoading?: boolean;
}

export default function ProjectModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}: ProjectModalProps) {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    status: 'active',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'active',
        start_date: '',
        end_date: '',
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
    onSubmit(formData);
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
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        
        <Input
          label="Description"
          name="description"
          value={formData.description || ''}
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
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
            </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              name="start_date"
              type="date"
              value={formData.start_date ? formData.start_date.split('T')[0] : ''}
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
              {initialData ? 'Update Project' : 'Create Project'}
            </Button>
        </div>
      </form>
    </Modal>
  );
}
