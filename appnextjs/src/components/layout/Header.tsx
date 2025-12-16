'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function Header() {
  const router = useRouter();
  const { toggleSidebar } = useUIStore();
  const { user, clearAuth } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      clearAuth();
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
      router.push('/login');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-header px-4 shadow-sm lg:px-8 bg-white dark:bg-gray-900 dark:border-gray-800">
         <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="p-2 -ml-2 text-gray-600 rounded-md lg:hidden hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <span className="material-icons">menu</span>
            </button>
            <div className="hidden md:block">
              {/* Breadcrumbs or Page Title could go here */}
            </div>
         </div>
         
         <div className="flex items-center gap-4">
           <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full dark:text-gray-400 dark:hover:bg-gray-800">
             <span className="material-icons">notifications</span>
           </button>
           
           <div className="relative group">
             <button className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-800">
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                    <span className="material-icons text-sm">person</span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block dark:text-gray-300">
                  {user?.name || 'User'}
                </span>
                <span className="material-icons text-gray-400 text-sm">expand_more</span>
             </button>
             
             {/* Dropdown Menu */}
             <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 hidden group-hover:block border border-gray-100 dark:border-gray-700">
               <button 
                  onClick={() => setShowLogoutConfirm(true)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
               >
                 Sign out
               </button>
             </div>
           </div>
         </div>
      </header>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign out"
        message="Are you sure you want to sign out?"
        confirmLabel="Sign out"
        variant="danger"
        isLoading={isLoggingOut}
      />
    </>
  );
}
