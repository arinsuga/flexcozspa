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
  const [appError, setAppError] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingProject(undefined);
    setFormErrors({});
    setAppError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormErrors({});
    setAppError(null);
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
    } catch (error: any) {
        if (error.response?.status === 422) {
            setFormErrors(error.response.data.errors);
        } else {
            console.error('App Error:', error);
            setAppError("An application error occurred. Please try again later.");
            setIsModalOpen(false);
        }
    }
  };

  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      await deleteProject.mutateAsync(projectToDelete.id);
      setIsDeleteOpen(false);
      setProjectToDelete(null);
    }
  };

  if (isLoading) return <div className="p-4 text-center">Loading projects...</div>;
  if (error) return <div className="p-4 text-error">Error loading projects</div>;

  return (
    <div className="space-y-6">
      {appError && (
        <div className="bg-red-50 border-l-4 border-error p-4 relative dark:bg-red-900/20 dark:border-red-500">
            <div className="flex">
                <div className="flex-shrink-0">
                    <span className="text-error">⚠️</span>
                </div>
                <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-200">
                        {appError}
                    </p>
                </div>
                <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                        <button
                            type="button"
                            onClick={() => setAppError(null)}
                            className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50 dark:bg-transparent dark:hover:bg-red-900/40"
                        >
                            <span className="sr-only">Dismiss</span>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

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
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
                    <span className={`px-2 py-1 text-xs rounded-full 
                        ${project.is_active === 1 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                         {project.is_active === 1 ? 'Active' : 'Inactive'}
                    </span>
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
    </div>
  );
}
