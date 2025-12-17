import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';

export const useProjects = (params?: any) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectService.getAll(params),
  });
};

export const useProject = (id: string | number) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getById(id),
    enabled: !!id,
  });
};

export const useProjectMutations = () => {
  const queryClient = useQueryClient();

  const createProject = useMutation({
    mutationFn: projectService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      if (error.response?.status !== 422) {
        console.error('Create Project Error:', JSON.stringify(error.response?.data || error.message, null, 2));
      }
    }
  });

  const updateProject = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) => projectService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
    },
  });

  const deleteProject = useMutation({
    mutationFn: projectService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return { createProject, updateProject, deleteProject };
};
