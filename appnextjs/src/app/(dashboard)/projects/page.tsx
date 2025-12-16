'use client';

import { useProjects, useProjectMutations } from '@/hooks/useProjects';
import { useState } from 'react';
import Button from '@/components/common/Button';
import ProjectModal from '@/components/features/projects/ProjectModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Project } from '@/services/projectService';

export default function ProjectsPage() {
  const { data: projectsData, isLoading, error } = useProjects();
  const { createProject, updateProject, deleteProject } = useProjectMutations();
  
  // Extract the projects array from the API response
  const projects = projectsData?.data || [];

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

  if (isLoading) return <div className="p-4">Loading projects...</div>;
  if (error) return <div className="p-4 text-error">Error loading projects</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
        <Button onClick={handleCreate} leftIcon="add">
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((project: Project) => (
          <div key={project.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-2">
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                 <span className={`px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`}>
                     {project.status}
                 </span>
             </div>
             <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                 {project.description || 'No description'}
             </p>
             <div className="text-xs text-gray-500 mb-4">
                 <div>Start: {project.start_date || 'N/A'}</div>
                 <div>End: {project.end_date || 'N/A'}</div>
             </div>
             <div className="flex justify-end gap-2 border-t pt-4 dark:border-gray-700">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>Edit</Button>
                  <Button variant="ghost" size="sm" className="text-error hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteClick(project)}>Delete</Button>
             </div>
          </div>
        ))}
         {projects?.length === 0 && (
             <div className="col-span-full text-center py-12 text-gray-500">
                 No projects found.
             </div>
         )}
      </div>

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
