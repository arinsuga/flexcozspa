'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { useState, useEffect } from 'react';

interface MenuItem {
  name: string;
  path?: string;
  icon: string;
  subItems?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { name: 'Project Management', path: '/projects', icon: 'business_center' },
  { name: 'Vendor Management', path: '/vendors', icon: 'store' },
  { name: 'Contract Management', path: '/contracts', icon: 'description' },
  { name: 'Order Management', path: '/orders', icon: 'shopping_cart' },
  { 
    name: 'System Data', 
    icon: 'storage',
    subItems: [
      { name: 'Vendor Type Management', path: '/vendor-types', icon: 'category' },
      { name: 'Reff Type Management', path: '/reff-types', icon: 'label' },
      { name: 'Sheet Group Management', path: '/sheet-groups', icon: 'view_module' },
    ]
  },
  {
    name: 'Reports',
    icon: 'assessment',
    subItems: [
      { name: 'Order Recap', path: '/reports/order-recap', icon: 'summarize' },
    ]
  },
];


export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar, isDesktopSidebarOpen } = useUIStore();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // Automatically open sub-menus if a child item is active
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.subItems?.some(subItem => subItem.path && pathname.startsWith(subItem.path))) {
        if (!openMenus.includes(item.name)) {
          setOpenMenus(prev => [...prev, item.name]);
        }
      }
    });
  }, [pathname]);

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => 
      prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
    );
  };

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
        fixed top-0 left-0 z-50 h-[100dvh] bg-sidebar border-r border-gray-200 transition-all duration-300 ease-in-out
        w-64
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:static lg:translate-x-0 dark:bg-gray-900 dark:border-gray-800
        ${isDesktopSidebarOpen ? 'lg:w-64' : 'lg:w-0 lg:overflow-hidden lg:border-none lg:opacity-0'}
      `}>
        <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-800 px-6">
          <img src="/logo.png" alt="Flexcoz" className="h-8" />
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {menuItems.map((item) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isOpen = openMenus.includes(item.name);
            const isParentActive = item.subItems?.some(sub => sub.path && pathname.startsWith(sub.path));

            if (hasSubItems) {
              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors
                      ${isParentActive 
                        ? 'bg-white/10 text-white dark:bg-primary/5 dark:text-primary' 
                        : 'text-white/80 hover:bg-white/10 dark:text-gray-400 dark:hover:bg-gray-800'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-icons text-[20px]">{item.icon}</span>
                      {item.name}
                    </div>
                    <span className={`material-icons text-[18px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  
                  <div className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                  `}>
                    <div className="pl-4 py-1 space-y-1">
                      {item.subItems!.map((subItem) => (
                        <Link
                          key={subItem.path}
                          href={subItem.path!}
                          onClick={closeSidebar}
                          className={`
                            flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors
                            ${pathname.startsWith(subItem.path!) 
                              ? 'bg-white/20 text-white dark:bg-primary/10 dark:text-primary' 
                              : 'text-white/60 hover:bg-white/10 dark:text-gray-500 dark:hover:bg-gray-800'}
                          `}
                        >
                          <span className="material-icons text-[18px]">{subItem.icon}</span>
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                href={item.path!}
                onClick={closeSidebar}
                className={`
                  flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${pathname.startsWith(item.path!) 
                    ? 'bg-white/20 text-white dark:bg-primary/10 dark:text-primary' 
                    : 'text-white/80 hover:bg-white/10 dark:text-gray-400 dark:hover:bg-gray-800'}
                `}
              >
                <span className="material-icons text-[20px]">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
