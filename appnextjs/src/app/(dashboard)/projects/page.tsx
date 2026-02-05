'use client';

import { useProjects, useProjectMutations } from '@/hooks/useProjects';
import React, { useState } from 'react';
import Button from '@/components/common/Button';
import ProjectModal from '@/components/features/projects/ProjectModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Project } from '@/services/projectService';
import SelectInput from '@/components/common/SelectInput';
import Input from '@/components/common/Input';
import Pagination from '@/components/common/Pagination';
import InfoDialog from '@/components/common/InfoDialog';


export default function ProjectsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState('');

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const { data: projectsResponse, isLoading, error } = useProjects({
    page,
    per_page: 10,
    search_query: searchQuery,
    search_column: searchColumn,
    sort_by: 'id',
    sort_order: 'desc'
  });
  
  const { createProject, updateProject, deleteProject } = useProjectMutations();
  
  // Handle both direct array and paginated response formats
  // Note: projectsResponse structure might depend on how useProjects is implemented, assuming standard API response
  const projects = Array.isArray(projectsResponse) 
    ? projectsResponse 
    : projectsResponse?.data || [];
    
  const meta = projectsResponse && !Array.isArray(projectsResponse) ? projectsResponse : { current_page: 1, last_page: 1 };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  
  // Modal states for notifications
  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info'
  });

  const [inUseModal, setInUseModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    item: Project | null;
  }>({
    isOpen: false,
    title: '',
    message: '',
    item: null
  });

  const showInfo = (title: string, message: string, variant: 'success' | 'error' | 'info' = 'info') => {
    setInfoModal({ isOpen: true, title, message, variant });
  };


  const handleCreate = () => {
    setEditingProject(undefined);
    setFormErrors({});
    setIsModalOpen(true);
  };


  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormErrors({});
    setIsModalOpen(true);
  };


  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (data: Partial<Project>) => {
    try {
      if (editingProject) {
        await updateProject.mutateAsync({ id: editingProject.id, data });
      } else {
        await createProject.mutateAsync(data);
      }
      setIsModalOpen(false);
      showInfo('Success', `Project ${editingProject ? 'updated' : 'created'} successfully!`, 'success');
    } catch (error: unknown) {
      if (error != null && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number; data: { errors: Record<string, string[]> } } };
        if (axiosError.response.status === 422) {
          setFormErrors(axiosError.response.data.errors);
        } else {
          console.error('App Error:', error);
          setIsModalOpen(false);
          showInfo('Error', 'An application error occurred. Please try again later.', 'error');
        }
      } else {
        console.error('App Error:', error);
        setIsModalOpen(false);
        showInfo('Error', 'An application error occurred. Please try again later.', 'error');
      }
    }
  };



  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      try {
        await deleteProject.mutateAsync(projectToDelete.id);
        setIsDeleteOpen(false);
        setProjectToDelete(null);
        showInfo('Success', 'Project deleted successfully!', 'success');
      } catch (error: any) {
        if (error?.response?.status === 409) {
          setIsDeleteOpen(false);
          setInUseModal({
            isOpen: true,
            title: 'Project In Use',
            message: error?.response?.data?.message || 'This project is in use and cannot be physically deleted. Would you like to mark it as inactive instead?',
            item: projectToDelete
          });
        } else {
          setIsDeleteOpen(false);
          showInfo('Error', 'Failed to delete project.', 'error');
        }
      }
    }
  };

  const handleMarkInactive = async () => {
    if (inUseModal.item) {
      try {
        await updateProject.mutateAsync({ 
          id: inUseModal.item.id, 
          data: { is_active: 0 } 
        });
        setInUseModal(prev => ({ ...prev, isOpen: false, item: null }));
        showInfo('Success', 'Project marked as inactive!', 'success');
      } catch {
        showInfo('Error', 'Failed to mark project as inactive.', 'error');
      }
    }
  };

  if (isLoading) return <div className="p-4 text-center">Loading projects...</div>;
  if (error) return <div className="p-4 text-error">Error loading projects</div>;

  return (
    <div className="space-y-6">


      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
        <Button onClick={handleCreate} leftIcon="add">
          New Project
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-48">
                <SelectInput
                    options={[
                        {value: '', label: 'All Columns'},
                        {value: 'project_name', label: 'Project Name'},
                        {value: 'project_number', label: 'Project No'},
                    ]}
                    value={searchColumn}
                    onChange={(val) => setSearchColumn(val as string)}
                    placeholder="Search By"
                    className="z-30" 
                />
            </div>
            <div className="flex-1 flex gap-2">
                <Input
                    placeholder="Search projects..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <Button onClick={handleSearch} iconOnly={false} leftIcon="search">
                    Search
                </Button>
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden flex flex-col h-[600px]">
        <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Project No</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Project Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dates</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {projects?.map((project: Project) => (
              <tr 
                key={project.id} 
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!project.is_active ? 'opacity-60' : ''}`}
                onClick={() => handleEdit(project)}
              >
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {project.project_number}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {project.project_name}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                   {project.project_startdt || 'N/A'} - {project.project_enddt || 'N/A'}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 text-xs rounded-full w-fit
                            ${project.project_status?.id === 1 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                            {project.project_status?.name || 'Unknown'}
                        </span>
                        {project.is_active == 0 && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 w-fit uppercase tracking-wider">
                                Inactive
                            </span>
                        )}
                    </div>
                </td>
                 <td className="px-3 py-4 whitespace-nowrap text-center text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => handleEdit(project)}
                      className="text-primary hover:text-indigo-900"
                      title="Edit"
                    >
                      <span className="material-icons">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(project)}
                      className="text-error hover:text-red-900"
                      title="Delete"
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {projects?.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No projects found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      <div className="mt-4">
         <Pagination
            currentPage={meta.current_page || 1}
            lastPage={meta.last_page || 1}
            onPageChange={setPage}
         />
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingProject}
        isLoading={createProject.isPending || updateProject.isPending}
        errors={formErrors}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete ${projectToDelete?.project_name}?`}
        variant="danger"
        isLoading={deleteProject.isPending}
      />

      <ConfirmDialog
        isOpen={inUseModal.isOpen}
        onClose={() => setInUseModal(prev => ({ ...prev, isOpen: false, item: null }))}
        onConfirm={handleMarkInactive}
        title={inUseModal.title}
        message={inUseModal.message}
        confirmLabel="Mark Inactive"
        variant="warning"
        isLoading={updateProject.isPending}
      />

      <InfoDialog
        isOpen={infoModal.isOpen}
        onClose={() => setInfoModal(prev => ({ ...prev, isOpen: false }))}
        title={infoModal.title}
        message={infoModal.message}
        variant={infoModal.variant}
      />
    </div>

  );
}
