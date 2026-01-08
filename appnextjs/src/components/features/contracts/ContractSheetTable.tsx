'use client';

import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import 'jsuites/dist/jsuites.css';
import { ContractSheet } from '@/services/contractSheetService';
import { UOM } from '@/services/uomService';
import wsStyle from '@/utils/wsStyle';

interface ContractSheetTableProps {
  data: ContractSheet[];
  uoms: UOM[];
  contractId: number | string;
  projectId: number;
  sheetgroupId?: number;
  onchange?: (instance: any, cell: any, x: any, y: any, value: any) => void;
}

const ContractSheetTable = forwardRef((props: ContractSheetTableProps, ref) => {
  const { data, uoms, contractId, projectId, sheetgroupId = 1, onchange } = props;
  const jRef = useRef<HTMLDivElement>(null);
  const jInstance = useRef<any>(null);


  const getJInstance = () => {
    const j = jInstance.current;
    if (!j) return null;
    
    // Safety check for worksheets
    try {
      if (j.worksheets && Array.isArray(j.worksheets) && j.worksheets.length > 0) {
        return j.worksheets[0];
      }
      if (Array.isArray(j) && j.length > 0) {
        return j[0];
      }
    } catch (e) {
      console.error('Error accessing jspreadsheet worksheets', e);
    }
    
    return j;
  };

  useImperativeHandle(ref, () => ({
    getJson: () => getJInstance()?.getJson(),
    getData: () => getJInstance()?.getData(),
    setData: (newData: any[]) => getJInstance()?.setData(newData),
    cleanData: () => {
      const instance = getJInstance();
      if (!instance || typeof instance.getData !== 'function') {
        console.warn('Jspreadsheet instance not found for cleaning');
        return 0;
      }
      
      const rawData = instance.getData();
      if (!Array.isArray(rawData)) return 0;
      
      // Filter rows:
      // A row is "empty" if it has no meaningful values in Code, Description, Vol, Sat, or Price.
      // The user wants to "delete remaining rows that is empty value".
      const cleanedData = rawData.filter((row: any) => {
        if (!Array.isArray(row)) return false;
        
        // row structure: [id, code, description, qty, uom_id, price, total]
        const code = row[1];
        const description = row[2];
        const qty = row[3];
        const uom_name = row[4];
        const price = row[5];
        
        const hasValue = (val: any) => {
          if (val === null || val === undefined) return false;
          const strVal = String(val).trim();
          return strVal !== '' && strVal !== 'null' && strVal !== 'undefined' && strVal !== '0' && strVal !== '0.00';
        };
        
        const isPartiallyEmpty = !hasValue(code) || !hasValue(description) || !hasValue(qty) || !hasValue(uom_name) || !hasValue(price);
        
        return !isPartiallyEmpty;
      });
      
      const removedCount = rawData.length - cleanedData.length;
      
      // For jspreadsheet-ce v5, to strictly shrink the table, we might need to reset dimensions
      // but setData usually works if we don't have minDimensions blocking it.
      instance.setData(cleanedData);
      
      return removedCount;
    },
    getSheetData: () => {
      // Transform jspreadsheet data back to ContractSheet format
      const rawData = getJInstance()?.getData();
      if (!Array.isArray(rawData)) return [];

      const hasValue = (val: any) => {
        if (val === null || val === undefined) return false;
        const strVal = String(val).trim();
        return strVal !== '' && strVal !== 'null' && strVal !== 'undefined' && strVal !== '0' && strVal !== '0.00';
      };

      return rawData
        .map((row: any, index: number) => {
          if (!Array.isArray(row)) return null;
          
          const [
            id,
            sheet_code,
            description,
            qty,
            uom_name,
            price,
            // total is calculated, not stored
          ] = row;

          // Skip empty rows - strictly check for content
          if (!hasValue(sheet_code) && !hasValue(description) && !hasValue(qty) && !hasValue(price)) {
            return null;
          }

          const qtyNum = parseFloat(qty) || 0;
          const priceNum = parseFloat(price) || 0;
          const grossAmt = qtyNum * priceNum;

          // Find UOM ID from name
          const uom = uoms.find((u) => u.uom_name === uom_name);

          const sheet: Partial<ContractSheet> = {
            id: id ? parseInt(id) : undefined,
            project_id: projectId,
            contract_id: typeof contractId === 'string' ? parseInt(contractId) : contractId,
            sheet_dt: new Date().toISOString(),
            sheet_type: 0,
            sheetgroup_type: 0,
            sheetgroup_id: sheetgroupId,
            sheetheader_id: null,
            sheet_code: sheet_code || '',
            sheet_name: description || '',
            sheet_description: description || '',
            sheet_notes: '',
            sheet_qty: qty?.toString() || '0',
            sheet_price: price?.toString() || '0',
            sheet_grossamt: grossAmt.toFixed(2),
            sheet_discountrate: '0.00',
            sheet_discountvalue: '0.00',
            sheet_taxrate: '11.00',
            sheet_taxvalue: (grossAmt * 0.11).toFixed(2),
            sheet_netamt: (grossAmt * 1.11).toFixed(2),
            uom_id: uom?.id || 1,
            uom_name: uom_name || '',
            sheetgroup_seqno: index + 1,
            sheet_seqno: index + 1,
          };

          return sheet;
        })
        .filter(Boolean);
    },
  }));

  // Transform ContractSheet data to jspreadsheet format
  const transformToSheetData = useCallback((sheets: ContractSheet[]) => {
    if (!Array.isArray(sheets)) return [];
    return sheets.map((sheet) => [
      sheet.id,
      sheet.sheet_code,
      sheet.sheet_description,
      parseFloat(sheet.sheet_qty),
      sheet.uom_name,
      parseFloat(sheet.sheet_price),
      parseFloat(sheet.sheet_grossamt), // Total (calculated)
    ]);
  }, []);

  useEffect(() => {
    const container = jRef.current;
    if (!container) return;
    
    // Completely clear the container to prevent duplicate tables
    container.innerHTML = '';
    jInstance.current = null;

    // Use Array.from to avoid shared references between rows
    const initialData = data && data.length > 0 
      ? transformToSheetData(data)
      : Array.from({ length: 100 }, () => [null, '', '', 0, 1, 0, 0]);

    const columns = [
      { type: 'hidden', name: 'id', title: 'ID', width: 0 },
      { type: 'text', name: 'sheet_code', title: 'Code', width: 150, align: 'left' },
      { type: 'text', name: 'description', title: 'Description', width: 650, align: 'left' },
      { type: 'numeric', name: 'qty', title: 'Vol', width: 120, mask: '#,##0.00', align: 'right' },
      { 
        type: 'text', 
        name: 'uom_name', 
        title: 'Sat', 
        width: 150,
        align: 'center'
      },
      { type: 'numeric', name: 'price', title: 'H.Satuan', width: 200, mask: '#,##0.00', align: 'right' },
      { 
        type: 'numeric', 
        name: 'total', 
        title: 'Total', 
        width: 200, 
        mask: '#,##0.00', 
        readOnly: true, 
        align: 'right',
        background: '#106bc5ff',
      },
    ];

    const handleChange = (instance: any, cell: any, x: any, y: any, value: any) => {
      console.log('JSS onchange triggered:', { x, y, value });
      if (!instance || y === undefined) return;
      
      const nx = parseInt(x);
      const ny = parseInt(y);
      const qtyCol = 3;
      const priceCol = 5;
      const totalCol = 6;

      if (nx === qtyCol || nx === priceCol) {
        try {
          const parseVal = (v: any) => {
            if (v === null || v === undefined || v === '') return 0;
            if (typeof v === 'string') {
              const cleaned = v.replace(/[^0-9.-]/g, '');
              return parseFloat(cleaned) || 0;
            }
            return parseFloat(v) || 0;
          };

          const vQty = (nx === qtyCol) ? value : instance.getValueFromCoords(qtyCol, ny);
          const vPrice = (nx === priceCol) ? value : instance.getValueFromCoords(priceCol, ny);
          
          const qty = parseVal(vQty);
          const price = parseVal(vPrice);
          const total = qty * price;

          if (typeof instance.setValueFromCoords === 'function') {
            // Updated to use triggerEvent = false (5th param) if supported, to avoid infinite loops
            // if setValueFromCoords triggers another onchange.
            instance.setValueFromCoords(totalCol, ny, total, true, false);
          }
        } catch (e) {
          console.warn('Calc error', e);
        }
      }
      if (onchange) onchange(instance, cell, x, y, value);
    };

    // jspreadsheet-ce v5 stable initialization
    const options = {
      // Event at top level is often preferred in JSS CE
      onchange: handleChange,
      worksheets: [{
        data: initialData,
        columns: columns,
        minDimensions: [6, 1000], 
        tableOverflow: true,
        tableWidth: '100%',
        tableHeight: '600px',
        // Also keep it here for specific worksheet handling if version requires it
        onchange: handleChange,
      }],
      allowComments: true,
      contextMenu: true,
      search: true,
      pagination: 50,
      copyCompatibility: true,
      defaultColWidth: 100,
      onselection: () => {},
    };

    try {
      // @ts-expect-error - jspreadsheet-ce types can be tricky
      const el = jspreadsheet(container, options);
      jInstance.current = el;
    } catch (err) {
      console.error('JSS Init error:', err);
    }
    return () => {
      try {
        if (container && typeof jspreadsheet.destroy === 'function') {
          jspreadsheet.destroy(container as any);
        }
      } catch (e) {
        console.warn('Cleanup error', e);
      } finally {
        if (container) container.innerHTML = '';
        jInstance.current = null;
      }
    };
  }, [onchange]); // Re-init only when critical options change

  // Watch for external data changes
  useEffect(() => {
    const instance = getJInstance();
    if (instance && typeof instance.getData === 'function' && data && data.length > 0) {
      const currentData = instance.getData();
      const newData = transformToSheetData(data);
      
      if (JSON.stringify(currentData) !== JSON.stringify(newData)) {
        instance.setData(newData);
      }
    }
  }, [data, transformToSheetData]);

  return (
    <>
      <style jsx global>{wsStyle}</style>
      <div className="w-full overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg bg-white dark:bg-gray-900 overflow-hidden">
        <div ref={jRef} />
      </div>
    </>
  );
});

ContractSheetTable.displayName = 'ContractSheetTable';

export default ContractSheetTable;
