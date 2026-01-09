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
            { 
              label: 'Active Contracts', 
              value: stats?.activeContractsValue 
                ? `$${stats.activeContractsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                : '$0.00', 
              color: 'bg-primary' 
            },
            { label: 'Orders', value: stats?.ordersCount || 0, color: 'bg-secondary' },
            { label: 'Projects', value: stats?.projectsCount || 0, color: 'bg-accent' },
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
    </div>
  );
}
