'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { name: 'Project Management', path: '/projects', icon: 'business_center' },
  { name: 'Vendor Management', path: '/vendors', icon: 'store' },
  { name: 'Reff Type Management', path: '/reff-types', icon: 'label' },
  { name: 'UOM Management', path: '/uoms', icon: 'square_foot' },
  { name: 'Sheet Group Management', path: '/sheet-groups', icon: 'view_module' },
  { name: 'Contract Management', path: '/contracts', icon: 'description' },
  { name: 'Order Management', path: '/orders', icon: 'shopping_cart' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useUIStore();

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-[100dvh] w-64 bg-sidebar border-r border-gray-200 transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static bg-white dark:bg-gray-900 dark:border-gray-800
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-800 px-6">
          <img src="/logo.png" alt="Flexcoz" className="h-8" />
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={closeSidebar}
              className={`
                flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                ${pathname.startsWith(item.path) 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'}
              `}
            >
              <span className="material-icons text-[20px]">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
