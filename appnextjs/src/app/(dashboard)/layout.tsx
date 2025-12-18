'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isAuthenticated) {
        router.push('/login');
    }
  }, [isAuthenticated, router, isClient]);


  if (!isClient) {
      return null;
  }

  if (!isAuthenticated) {
      return null; // Don't render protected content
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
         <Header />
         <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
            {children}
         </main>
      </div>
    </div>
  );
}
