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
    getJson: () => jInstance.current?.getJson(),
    getData: () => jInstance.current?.getData(),
    setData: (newData: any[]) => jInstance.current?.setData(newData),
  }));

  useEffect(() => {
    if (!jRef.current) return;
    
    // Check if instance already exists to prevent double initialization in React Strict Mode
    if (jInstance.current) {
        // If columns change, we might need to destroy and recreate or use generic update
        // simple update for now
        // jInstance.current.setData(data); // Be careful with loop
        return;
    }

    // @ts-ignore - jspreadsheet-ce types might differ from actual usage or pro version
    const options = {
      data: data,
      columns: columns,
      minDimensions: [columns.length || 5, 10], 
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
    };

    // @ts-ignore
    jInstance.current = jspreadsheet(jRef.current, options);

    return () => {
        if (jInstance.current) {
            jInstance.current.destroy();
            jInstance.current = null;
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]); // Re-init if columns change

  // Watch for data changes
  useEffect(() => {
     if (jInstance.current && data && data.length > 0) {
         // Only update if data actually differs significantly or on initial load?
         // jspreadsheet setData wipes undo history usually.
         // For now, we assume initial load is the main use case.
         const currentData = jInstance.current.getJson();
         if (JSON.stringify(currentData) !== JSON.stringify(data)) {
            jInstance.current.setData(data);
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
