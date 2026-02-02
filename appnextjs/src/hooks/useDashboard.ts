import { useQuery } from '@tanstack/react-query';
import { contractService, Contract } from '@/services/contractService';
import { orderService, Order } from '@/services/orderService';
import { projectService, Project } from '@/services/projectService';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const [contracts, orders, projects] = await Promise.all([
        contractService.getAll() as Promise<Contract[]>,
        orderService.getAll() as Promise<Order[]>,
        projectService.getAll() as Promise<Project[]>,
      ]);

      // Calculate Active Contract Value (sum of contract_amount for active contracts)
      // Note: contract_amount is string "100,000.00", need to parse.
      const totalActiveContractValue = contracts.reduce((acc: number, c: Contract) => {
        // contract_amount can be null/undefined in some cases? 
        // Interface says string, but let's be safe.
        const amountStr = c.contract_amount || '0'; 
        const amount = parseFloat(amountStr.replace(/,/g, ''));
        return acc + (isNaN(amount) ? 0 : amount);
      }, 0);

      return {
        activeContractsValue: totalActiveContractValue,
        ordersCount: Array.isArray(orders) ? orders.length : 0, 
        projectsCount: Array.isArray(projects) ? projects.filter((p: Project) => p.is_active === 1).length : 0,
      };
    },
  });
};
