'use client';

import { useProjects, useProjectMutations } from '@/hooks/useProjects';
import { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import ProjectModal from '@/components/features/projects/ProjectModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Project } from '@/services/projectService';

export default function ProjectsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when status filter changes
  const handleStatusfilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setStatusFilter(e.target.value);
      setPage(1);
  }

  const { data: projectsData, isLoading, error } = useProjects({
    page,
    search: debouncedSearch,
    status: statusFilter,
  });
  
  const { createProject, updateProject, deleteProject } = useProjectMutations();
  
  // Extract the projects array from the API response
  const projects = projectsData?.data || [];
  const meta = projectsData?.meta;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const handleCreate = () => {
    setEditingProject(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (data: Partial<Project>) => {
    if (editingProject) {
      await updateProject.mutateAsync({ id: editingProject.id, data });
    } else {
      await createProject.mutateAsync(data);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      await deleteProject.mutateAsync(projectToDelete.id);
      setIsDeleteOpen(false);
      setProjectToDelete(null);
    }
  };

  if (error) return <div className="p-4 text-error">Error loading projects</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
        <Button onClick={handleCreate} leftIcon="add">
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex-1">
            <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2 border"
            />
        </div>
        <div className="w-full sm:w-48">
            <select
                value={statusFilter}
                onChange={handleStatusfilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2 border"
            >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
            </select>
        </div>
      </div>

      {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading projects...</div>
      ) : (
      <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project: Project) => (
              <div key={project.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col h-full">
                 <div className="flex justify-between items-start mb-2">
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                     <span className={`px-2 py-1 text-xs rounded-full 
                        ${project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                          project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                         {(project.status || 'unknown').replace('_', ' ')}
                     </span>
                 </div>
                 <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                     {project.description || 'No description'}
                 </p>
                 <div className="text-xs text-gray-500 mb-4 space-y-1">
                     <div className="flex justify-between"><span>Start:</span> <span>{project.start_date || 'N/A'}</span></div>
                     <div className="flex justify-between"><span>End:</span> <span>{project.end_date || 'N/A'}</span></div>
                 </div>
                 <div className="flex justify-end gap-2 border-t pt-4 dark:border-gray-700 mt-auto">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-error hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteClick(project)}>Delete</Button>
                 </div>
              </div>
            ))}
             {projects?.length === 0 && (
                 <div className="col-span-full text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-lg">
                     No projects found.
                 </div>
             )}
          </div>

          {/* Pagination */}
          {meta && (
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {meta.from} to {meta.to} of {meta.total} results
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={meta.current_page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                        Previous
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={meta.current_page === meta.last_page}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
          )}
      </>
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingProject}
        isLoading={createProject.isPending || updateProject.isPending}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete ${projectToDelete?.name}?`}
        variant="danger"
        isLoading={deleteProject.isPending}
      />
    </div>
  );
}
