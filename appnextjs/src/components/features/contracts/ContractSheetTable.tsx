'use client';

import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import 'jsuites/dist/jsuites.css';
import { ContractSheet } from '@/services/contractSheetService';
import wsStyle from '@/utils/wsStyle';
import { useUomNormalizations } from '@/hooks/useUomNormalizations';
import { createUomNormalizer } from '@/utils/uomNormalizer';
import { parseNumeric } from '@/utils/numberFormat';

interface ContractSheetTableProps {
  data: ContractSheet[];
  contractId: number | string;
  projectId: number;
  sheetgroupId?: number;
  onchange?: (instance: any, cell: any, x: any, y: any, value: any) => void;
}

const ContractSheetTable = forwardRef((props: ContractSheetTableProps, ref) => {
  const { data, contractId, projectId, sheetgroupId = 1, onchange } = props;
  const jRef = useRef<HTMLDivElement>(null);
  const jInstance = useRef<any>(null);

  // Load UOM normalization config ONCE
  const { data: normalizationConfig = [] } = useUomNormalizations();
  const normalizerRef = useRef<any>(null);

  // Build normalizer when config loads
  useEffect(() => {
    if (Array.isArray(normalizationConfig) && normalizationConfig.length > 0) {
      normalizerRef.current = createUomNormalizer(normalizationConfig);
    }
  }, [normalizationConfig]);


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
        
        const hasValue = (val: any) => {
          if (val === null || val === undefined) return false;
          const strVal = String(val).trim();
          return strVal !== '' && strVal !== 'null' && strVal !== 'undefined';
        };
        
        return hasValue(code);
      });
      
      const removedCount = (rawData?.length || 0) - (cleanedData?.length || 0);
      
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

      const isEditMode = contractId !== 'new' && !!contractId;

      return rawData
        .map((row: any, index: number) => {
          if (!Array.isArray(row)) return null;
          
          const [
            id,
            sheet_code,
            description,
            qty,
            uom_code,
            price,
            // total is calculated, not stored
          ] = row;

          // Requirement 2: Include rows with at least a code
          if (!projectId || !hasValue(sheet_code)) {
            return null;
          }
          if (isEditMode && !contractId) {
             return null;
          }

          const qtyNum = parseNumeric(qty);
          const priceNum = parseNumeric(price);
          const grossAmt = qtyNum * priceNum;

          // Requirement 2: sheet_type logic
          const hasMetrics = hasValue(qty) || hasValue(price) || grossAmt > 0;
          const sheetType = hasMetrics ? 1 : 0;

          // Find original sheet to preserve some fields
          const originalSheet = data.find(s => s.id === (id ? parseInt(id) : null));

          const sheet: Partial<ContractSheet> = {
            id: id ? parseInt(id) : sheet_code,
            project_id: parseInt(projectId as unknown as string),
            contract_id: isEditMode ? (typeof contractId === 'string' ? parseInt(contractId) : contractId as number) : undefined,
            sheet_dt: originalSheet?.sheet_dt || null,
            sheet_type: sheetType,
            sheetgroup_type: 0,
            sheetgroup_id: parseInt(sheetgroupId as unknown as string),
            sheetheader_id: originalSheet?.sheetheader_id ? parseInt(originalSheet.sheetheader_id as unknown as string) : null,
            sheet_code: sheet_code ? String(sheet_code) : '',
            sheet_name: description ? String(description) : '',
            sheet_description: description ? String(description) : '',
            sheet_notes: originalSheet?.sheet_notes ? String(originalSheet.sheet_notes) : '',
            sheet_qty: qtyNum,
            sheet_price: priceNum,
            sheet_grossamt: parseFloat(grossAmt.toFixed(2)),
            sheet_grossamt2: parseFloat(grossAmt.toFixed(2)),
            sheet_discountrate: 0.00,
            sheet_discountvalue: 0.00,
            sheet_taxrate: 0.00,
            sheet_taxvalue: 0.00,
            sheet_netamt: parseFloat(grossAmt.toFixed(2)),
            sheet_netamt2: parseFloat(grossAmt.toFixed(2)),
            sheet_realamt: parseFloat(grossAmt.toFixed(2)),
            uom_id: originalSheet?.uom_id ? parseInt(originalSheet.uom_id as unknown as string) : 1,
            uom_code: uom_code ? String(uom_code) : (originalSheet?.uom_code || ''),
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
      sheet.sheet_qty,
      sheet.uom_code,
      sheet.sheet_price,
      sheet.sheet_grossamt, // Total (calculated)
    ]);
  }, []);

  const validateTable = useCallback((instance: any) => {
    if (!instance || typeof instance.getData !== 'function') return;
    const rawData = instance.getData();
    if (!Array.isArray(rawData)) return;

    const hasValue = (val: any) => {
      if (val === null || val === undefined) return false;
      const strVal = String(val).trim();
      return strVal !== '' && strVal !== 'null' && strVal !== 'undefined' && strVal !== '0' && strVal !== '0.00';
    };

    const requiredCols = [1, 2, 4]; // Code, Description, Sat

    rawData.forEach((row: any, y: number) => {
      requiredCols.forEach((x) => {
        const value = row[x];
        const isValid = hasValue(value);
        const color = isValid ? '' : 'red';
        
        if (typeof instance.setStyle === 'function') {
          // JSS CE Style: setStyle(cell_name, property, value)
          const cellName = String.fromCharCode(65 + x) + (y + 1);
          instance.setStyle(cellName, 'color', color);
        }
      });
    });
  }, []);

  const handleCellChange = useCallback((instance: any, cell: any, x: any, y: any, value: any) => {
    if (!instance || y === undefined) return;
    
    const nx = parseInt(x);
    const ny = parseInt(y);
    const qtyCol = 3;
    const priceCol = 5;
    const totalCol = 6;
    const requiredCols = [1, 2, 4]; // Code, Description, Sat

    // Visual Validation Feedback
    if (requiredCols.includes(nx)) {
      const hasValue = (val: any) => {
        if (val === null || val === undefined) return false;
        const strVal = String(val).trim();
        return strVal !== '' && strVal !== 'null' && strVal !== 'undefined' && strVal !== '0' && strVal !== '0.00';
      };
      const isValid = hasValue(value);
      const color = isValid ? '' : 'red';
      if (typeof instance.setStyle === 'function') {
        const cellName = String.fromCharCode(65 + nx) + (ny + 1);
        instance.setStyle(cellName, 'color', color);
      } else if (cell) {
        cell.style.color = color;
      }
    }

    // UOM Normalization (Column 4: Sat)
    if (nx === 4 && value && normalizerRef.current) {
      const normalized = normalizerRef.current.normalize(value);
      if (normalized !== value) {
        // Use a small timeout or check to prevent recursive loops if necessary
        // but normalized === value check should handle it.
        instance.setValueFromCoords(4, ny, normalized, true);
        
        // Visual feedback
        const cellName = String.fromCharCode(65 + 4) + (ny + 1);
        instance.setStyle(cellName, 'background-color', '#fef3c7');
        setTimeout(() => {
          instance.setStyle(cellName, 'background-color', '');
        }, 1500);
      }
    }

    if (nx === qtyCol || nx === priceCol) {
      try {
        const vQty = (nx === qtyCol) ? value : instance.getValueFromCoords(qtyCol, ny);
        const vPrice = (nx === priceCol) ? value : instance.getValueFromCoords(priceCol, ny);
        
        const qty = parseNumeric(vQty);
        const price = parseNumeric(vPrice);
        const total = qty * price;

        if (typeof instance.setValueFromCoords === 'function') {
          instance.setValueFromCoords(totalCol, ny, total, true, false);
        }
      } catch (e) {
        console.warn('Calc error', e);
      }
    }
    if (onchange) onchange(instance, cell, x, y, value);
  }, [onchange]);

  useEffect(() => {
    const container = jRef.current;
    if (!container) return;
    
    // Completely clear the container to prevent duplicate tables
    container.innerHTML = '';
    jInstance.current = null;

    // Use Array.from to avoid shared references between rows
    const initialData = Array.isArray(data) && data.length > 0 
      ? transformToSheetData(data)
      : Array.from({ length: 100 }, () => [null, '', '', null, '', null, null]);

    const columns = [
      { type: 'hidden', name: 'id', title: 'ID', width: 0 },
      { type: 'text', name: 'sheet_code', title: 'Code', width: 150, align: 'left' },
      { type: 'text', name: 'description', title: 'Description', width: 650, align: 'left', wordWrap: true },
      { type: 'numeric', name: 'qty', title: 'Vol', width: 120, mask: '#,##0.00', align: 'right' },
      { 
        type: 'text', 
        name: 'uom_code', 
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

    // jspreadsheet-ce v5 stable initialization
    const options = {
      // Event at top level is often preferred in JSS CE
      onchange: handleCellChange,
      worksheets: [{
        data: initialData,
        columns: columns,
        minDimensions: [6, 1000], 
        tableOverflow: true,
        tableWidth: '100%',
        tableHeight: '600px',
        // Also keep it here for specific worksheet handling if version requires it
        onchange: handleCellChange,
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
      // Initial validation
      validateTable(getJInstance());
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
  }, [onchange, validateTable, handleCellChange, transformToSheetData]); // Re-init only when critical options change

  // Watch for external data changes
  useEffect(() => {
    const instance = getJInstance();
    if (instance && typeof instance.getData === 'function' && Array.isArray(data) && data.length > 0) {
      const currentData = instance.getData();
      const newData = transformToSheetData(data);
      
      if (JSON.stringify(currentData) !== JSON.stringify(newData)) {
        instance.setData(newData);
        validateTable(instance);
      }
    }
  }, [data, transformToSheetData, validateTable]);

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
