'use client';

import { useEffect, useState } from 'react';
import { Workbox } from 'workbox-window';

export default function UpdateNotification() {
  const [show, setShow] = useState(false);
  const [wb, setWb] = useState<Workbox | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const workbox = new Workbox('/sw.js');

      const handleWaiting = () => {
        setShow(true);
      };

      workbox.addEventListener('waiting', handleWaiting);
      // Also check if there's already a waiting SW (e.g. reload before accepting)
      // This is sometimes handled by workbox automatic checks but good to be explicit if needed.
      workbox.register();
      setWb(workbox);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    if (wb) {
      wb.addEventListener('controlling', () => {
        window.location.reload();
      });
      wb.messageSkipWaiting();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-primary animate-fade-in flex items-center gap-4 max-w-sm">
        <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Update Available</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                A new version of Flexcoz is available.
            </p>
        </div>
        <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-primary-dark transition-colors shrink-0"
        >
            Refresh
        </button>
    </div>
  );
}
