import { useQuery } from '@tanstack/react-query';
import { contractService } from '@/services/contractService';
import { orderService } from '@/services/orderService';
import { projectService } from '@/services/projectService';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const [contracts, orders, projects] = await Promise.all([
        contractService.getAll(),
        orderService.getAll(),
        projectService.getAll(),
      ]);

      return {
        activeContracts: contracts.length,
        pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
        openProjects: projects.filter((p: any) => p.status === 'active').length,
        totalContractsValue: contracts.reduce((acc: number, c: any) => acc + (c.amount || 0), 0),
      };
    },
  });
};
