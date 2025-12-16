'use client';

import { useDashboardStats } from '@/hooks/useDashboard';

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
         {[
            { label: 'Active Contracts', value: stats?.activeContracts || 0, color: 'bg-primary' },
            { label: 'Pending Orders', value: stats?.pendingOrders || 0, color: 'bg-secondary' },
            { label: 'Open Projects', value: stats?.openProjects || 0, color: 'bg-accent' },
            { label: 'Total Value', value: stats?.totalContractsValue ? `$${stats.totalContractsValue.toLocaleString()}` : '$0', color: 'bg-green-500' },
         ].map((stat) => (
             <div key={stat.label} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                 <div className="p-5">
                     <div className="flex items-center">
                         <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-md ${stat.color} bg-opacity-20`}>
                             <span className="material-icons text-white text-opacity-80">analytics</span>
                         </div>
                         <div className="ml-5 w-0 flex-1">
                             <dl>
                                 <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">{stat.label}</dt>
                                 <dd className="text-lg font-medium text-gray-900 dark:text-white">{stat.value}</dd>
                             </dl>
                         </div>
                     </div>
                 </div>
             </div>
         ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
             <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Recent Activity</h3>
             <div className="h-48 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded dark:border-gray-700">
                 Chart Placeholder
             </div>
         </div>
         <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Quick Actions</h3>
             <div className="grid grid-cols-2 gap-4">
                 <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition lg:p-6">
                     <span className="material-icons text-primary text-3xl mb-2">add_circle</span>
                     <span className="text-sm font-medium">New Contract</span>
                 </button>
                 <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition lg:p-6">
                     <span className="material-icons text-secondary text-3xl mb-2">shopping_basket</span>
                     <span className="text-sm font-medium">New Order</span>
                 </button>
             </div>
         </div>
      </div>
    </div>
  );
}
