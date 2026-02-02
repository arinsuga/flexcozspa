'use client';

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';

interface SheetComponentProps {
  data: any[];
  columns: any[];
  onchange?: (instance: any, cell: any, x: any, y: any, value: any) => void;
  oninsertrow?: (instance: any) => void;
  ondeleterow?: (instance: any) => void;
  license?: string;
}

const SheetComponent = forwardRef((props: SheetComponentProps, ref) => {
  const { data, columns, onchange, oninsertrow, ondeleterow } = props;
  const jRef = useRef<HTMLDivElement>(null);
  const jInstance = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    getJson: () => jInstance.current?.[0]?.getJson(),
    getData: () => jInstance.current?.[0]?.getData(),
    setData: (newData: any[]) => jInstance.current?.[0]?.setData(newData),
  }));

  useEffect(() => {
    if (!jRef.current) return;
    
    // Check if instance already exists
    if (jInstance.current) {
        return;
    }

    // @ts-ignore - jspreadsheet-ce v5 configuration
    const options = {
      worksheets: [{
        data: data,
        columns: columns,
        minDimensions: [(columns?.length || 0) || 5, 10], 
        tableOverflow: true,
        tableWidth: '100%',
        tableHeight: '500px',
        onchange: onchange,
        oninsertrow: oninsertrow,
        ondeleterow: ondeleterow,
        allowComments: true,
        contextMenu: true,
        search: true,
        pagination: 20,
      }],
    };

    // @ts-ignore
    jInstance.current = jspreadsheet(jRef.current, options);

    return () => {
        try {
            if (jInstance.current) {
                // jspreadsheet v5 cleanup
                if (typeof jspreadsheet.destroy === 'function' && jRef.current) {
                     // eslint-disable-next-line @typescript-eslint/no-explicit-any
                     jspreadsheet.destroy(jRef.current as any);
                } else if (jInstance.current && typeof jInstance.current.destroy === 'function') {
                     jInstance.current.destroy();
                }
            }
        } catch (e) {
            console.warn('Jspreadsheet cleanup error', e);
            if (jRef.current) {
                jRef.current.innerHTML = '';
            }
        } finally {
             jInstance.current = null;
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]); // Re-init if columns change

  // Watch for data changes
  useEffect(() => {
     if (jInstance.current && jInstance.current[0] && Array.isArray(data) && data.length > 0) {
         const currentData = jInstance.current[0].getJson();
         if (JSON.stringify(currentData) !== JSON.stringify(data)) {
            jInstance.current[0].setData(data);
         }
     }
  }, [data]);

  return (
    <div className="w-full overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <div ref={jRef} />
    </div>
  );
});

SheetComponent.displayName = 'SheetComponent';

export default SheetComponent;
