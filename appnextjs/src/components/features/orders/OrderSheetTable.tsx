import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback, useState, useMemo } from 'react';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import 'jsuites/dist/jsuites.css';
import wsStyle from '@/utils/wsStyle';
import { useReffTypes } from '@/hooks/useReffTypes';
import VendorSearchModal from '@/components/features/vendors/VendorSearchModal';
import { Vendor } from '@/services/vendorService';
import { parseNumeric } from '@/utils/numberFormat';
import { useContractOrderSummary } from '@/hooks/useContractOrderSummary';
import { ContractOrderSummary } from '@/services/contractOrderSummaryService';
import ContractOrderSummarySearchModal from '@/components/features/contracts/ContractOrderSummarySearchModal';

const getColumnName = (x: number): string => {
  let name = '';
  let i = x;
  while (i >= 0) {
    name = String.fromCharCode((i % 26) + 65) + name;
    i = Math.floor(i / 26) - 1;
  }
  return name;
};

interface OrderSheetTableProps {
  data: any[];
  orderId: number | string;
  projectId: number;
  contractId: number;
  onchange?: (instance: any, cell: HTMLElement, x: string | number, y: string | number, value: any) => void;
  readOnly?: boolean;
}

const OrderSheetTable = forwardRef((props: OrderSheetTableProps, ref) => {
  const { data, orderId, projectId, contractId, onchange, readOnly = false } = props;
  const jRef = useRef<HTMLDivElement>(null);
  const jInstance = useRef<any>(null);
  
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [vendorTargetCoords, setVendorTargetCoords] = useState<{ x: number, y: number } | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemTargetCoords, setItemTargetCoords] = useState<{ x: number, y: number } | null>(null);

  const { data: reffTypes } = useReffTypes();
  const { data: summaryDataResponse } = useContractOrderSummary(contractId, orderId);
  
  const summaryData = useMemo(() => {
    const raw = summaryDataResponse?.data || summaryDataResponse;
    return Array.isArray(raw) ? raw : [];
  }, [summaryDataResponse]);

  // Use a ref to keep summaryData stable for the handleCellChange callback
  const summaryDataRef = useRef<ContractOrderSummary[]>([]);
  useEffect(() => {
    summaryDataRef.current = summaryData;
  }, [summaryData]);

  // Use a memo for reffOptions to keep it stable
  const reffOptions = useMemo(() => {
    const normalizedReffTypes = Array.isArray(reffTypes) ? reffTypes : (reffTypes as any)?.data || [];
    return normalizedReffTypes.map((t: any) => ({
      id: t.id,
      name: t.refftype_name
    }));
  }, [reffTypes]);

  const reffOptionsRef = useRef<any[]>([]);
  useEffect(() => {
    reffOptionsRef.current = reffOptions;
  }, [reffOptions]);

  const getJInstance = () => {
    const j = jInstance.current;
    if (!j) return null;
    
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
    getSheetData: () => {
      const rawData = getJInstance()?.getData();
      if (!Array.isArray(rawData)) return [];

      const hasValue = (val: any) => {
        if (val === null || val === undefined) return false;
        const strVal = String(val).trim();
        return strVal !== '' && strVal !== 'null' && strVal !== 'undefined';
      };

      const isEditMode = orderId !== 'new' && !!orderId;

      return rawData
        .map((row: any[]) => {
          if (!Array.isArray(row)) return null;
          
          const [
            id,
            sheet_code,
            sheet_refftypeid,
            sheet_reffno,
            sheet_reffnodate,
            vendor_name,
            sheet_description,
            _available_amount, // 7
            sheet_qty,        // 8
            uom_code,         // 9
            sheet_price,      // 10
            ,                 // 11 (total - unused)
            vendor_id,        // 12
            contractsheets_id, // 13
            contract_amount,   // 14
            order_amount,      // 15
            sheetgroup_id,     // 16
            sheetgroup_type    // 17
          ] = row;

          if (!hasValue(sheet_code)) {
            return null;
          }

          const qtyNum = parseNumeric(sheet_qty);
          const priceNum = parseNumeric(sheet_price);
          const totalVal = qtyNum * priceNum;

          return {
            id: id ? parseInt(id) : undefined,
            order_id: isEditMode ? (typeof orderId === 'string' ? parseInt(orderId) : orderId as number) : undefined,
            sheet_code: String(sheet_code || '').trim(),
            sheet_refftypeid: sheet_refftypeid ? parseInt(sheet_refftypeid) : undefined,
            sheet_reffno: sheet_reffno ? String(sheet_reffno) : '',
            sheet_reffnodate: sheet_reffnodate ? String(sheet_reffnodate) : null,
            vendor_id: vendor_id ? parseInt(vendor_id) : undefined,
            vendor_name: vendor_name ? String(vendor_name) : '',
            sheet_description: sheet_description ? String(sheet_description) : '',
            sheet_qty: qtyNum,
            uom_code: uom_code ? String(uom_code) : '',
            sheet_price: priceNum,
            sheet_grossamt: totalVal,
            sheet_netamt: totalVal,
            project_id: projectId,
            contract_id: contractId,
            contractsheets_id: contractsheets_id ? parseInt(contractsheets_id) : undefined,
            sheetgroup_id: sheetgroup_id ? parseInt(sheetgroup_id) : undefined,
            sheetgroup_type: sheetgroup_type ? parseInt(sheetgroup_type) : undefined,
            contract_amount: parseNumeric(contract_amount),
            order_amount: parseNumeric(order_amount),
            available_amount: parseNumeric(_available_amount),
          };
        })
        .filter(Boolean);
    },
  }));

  const transformToSheetData = useCallback((items: any[]) => {
    if (!Array.isArray(items)) return [];
    
    return items.map((item) => {
      // Find matching summary item to get latest available_amount if not provided in item
      const match = summaryDataRef.current.find(s => s.sheet_code === item.sheet_code);
      const availableAmt = item.available_amount !== undefined && item.available_amount !== null 
        ? item.available_amount 
        : (match ? match.available_amount : null);

      return [
        item.id || null,
        item.sheet_code || '',
        item.sheet_refftypeid || '',
        item.sheet_reffno || '',
        item.sheet_reffnodate ? item.sheet_reffnodate.split('T')[0] : '',
        item.vendor_name || (item.vendor?.vendor_name) || '',
        item.sheet_description || (match?.sheet_name) || '',
        availableAmt, // Index 7
        item.sheet_qty || null,        // Index 8
        item.uom_code || (item.uom?.uom_code) || (match?.uom_code) || '',
        item.sheet_price || null,
        (item.sheet_qty && item.sheet_price) ? (item.sheet_qty * item.sheet_price) : null,
        item.vendor_id || (item.vendor?.id) || null,
        item.contractsheets_id || (match?.contractsheet_id) || null,
        item.contract_amount || (match?.contract_amount) || null,
        item.order_amount || (match?.order_amount) || null,
        item.sheetgroup_id || (match?.sheetgroup_id) || null,
        item.sheetgroup_type || (match?.sheetgroup_type) || null,
      ];
    });
  }, []); // summaryDataRef is used to keep it stable


  const handleCellChange = useCallback((instance: any, cell: any, x: any, y: any, value: any) => {
    if (!instance || y === undefined) return;
    
    const nx = parseInt(x as string);
    const ny = parseInt(y as string);
    const qtyCol = 8;
    const priceCol = 10;
    const totalCol = 11;

    // 0. Fix for HTML Corruptions & Paste: Strip HTML from any string values
    if (typeof value === 'string' && (value.includes('<') || value.includes('&lt;'))) {
      const stripped = value.replace(/<button[^>]*>[\s\S]*?<\/button>/gi, '') // Remove buttons specifically
                            .replace(/<[^>]+>/g, '') // Remove all other tags
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&amp;/g, '&')
                            .trim();
      
      if (stripped !== value) {
        instance.setValueFromCoords(nx, ny, stripped, true, false);
        return; 
      }
    }

    // Handle Total Calculation
    if (nx === qtyCol || nx === priceCol) {
      try {
        const vQty = (nx === qtyCol) ? value : instance.getValueFromCoords(qtyCol, ny);
        const vPrice = (nx === priceCol) ? value : instance.getValueFromCoords(priceCol, ny);
        
        const qty = parseNumeric(vQty);
        const price = parseNumeric(vPrice);
        const total = qty * price;

        if (typeof instance.setValueFromCoords === 'function') {
          instance.setValueFromCoords(totalCol, ny, total, true, false);
          
          // Reset styling to default
          const targetColName = getColumnName(totalCol);
          instance.setStyle(`${targetColName}${ny + 1}`, 'background-color', '#f3f4f6');
          instance.setStyle(`${targetColName}${ny + 1}`, 'color', 'inherit');
        }
      } catch (e) {
        console.warn('Calc error', e);
      }
    }

    // Auto-fill workflow & Validation: Sheet Code Change
    if (nx === 1 && instance && typeof instance.setValueFromCoords === 'function') { // sheet_code column
      const rawValue = String(value || '');
      const trimmedValue = rawValue.trim();
      
      // 1. Force Trim: If entered/pasted with spaces, update cell with trimmed version
      if (rawValue !== trimmedValue) {
        instance.setValueFromCoords(nx, ny, trimmedValue, true, false); // true to suppress trigger, false to not update history immediately? 
        // Actually for paste, we want it to trigger. JSS CE behavior: setValueFromCoords(x,y,val,force,saveHistory)
        // Let's use true for 'force' to trigger onchange again if needed, or just silent it.
        // Usually, recursive guard is needed or just check if value is already trimmed.
        return; // handleCellChange will be called again with trimmed value
      }

      const currentSummaryData = summaryDataRef.current || [];
      const match = currentSummaryData.find((s: ContractOrderSummary) => s.sheet_code === (trimmedValue || 'n/a'));
      
      const cellName = `${getColumnName(nx)}${ny + 1}`;
      
      // Clear any prior styling
      instance.setStyle(cellName, 'background-color', '');
      instance.setStyle(cellName, 'color', '');
      if (typeof instance.setComments === 'function') {
        instance.setComments(cellName, '');
      }

      if (match) {
        instance.setValueFromCoords(6, ny, match.sheet_name, true); // Description/Name
        instance.setValueFromCoords(7, ny, match.available_amount, true); // Available Amt (7)
        instance.setValueFromCoords(9, ny, match.uom_code, true); // UOM (Sat) (9)
        instance.setValueFromCoords(13, ny, match.contractsheet_id, true); // Hidden contractsheets_id (13)
        instance.setValueFromCoords(14, ny, match.contract_amount || 0, true); // Contract Amt
        instance.setValueFromCoords(15, ny, match.order_amount, true); // Order Amt
        instance.setValueFromCoords(16, ny, match.sheetgroup_id, true); // SheetGroup ID
        instance.setValueFromCoords(17, ny, match.sheetgroup_type, true); // SheetGroup Type

        // 2. Set default Reff Type to "Work Order" if currently empty
        const currentReffType = instance.getValueFromCoords(2, ny);
        if (!currentReffType || String(currentReffType).trim() === '') {
          const workOrderType = reffOptionsRef.current.find(opt => 
            String(opt.name).toLowerCase().includes('work order')
          );
          if (workOrderType) {
            instance.setValueFromCoords(2, ny, workOrderType.id, true);
          }
        }
      } else if (trimmedValue === '') {
        // CLEANUP: If code is deleted, clear the row
        instance.setValueFromCoords(2, ny, '', true); // Reff Type
        instance.setValueFromCoords(3, ny, '', true); // Reff No
        instance.setValueFromCoords(4, ny, '', true); // Reff No Date
        instance.setValueFromCoords(5, ny, '', true); // Vendor Name
        instance.setValueFromCoords(6, ny, '', true); // Description
        instance.setValueFromCoords(7, ny, null, true); // Available Amt
        instance.setValueFromCoords(8, ny, null, true); // Vol
        instance.setValueFromCoords(9, ny, '', true); // UOM
        instance.setValueFromCoords(10, ny, null, true); // H.Satuan
        instance.setValueFromCoords(11, ny, null, true); // Total
        instance.setValueFromCoords(12, ny, null, true); // Vendor ID
        instance.setValueFromCoords(13, ny, null, true); // ContractSheet ID
        instance.setValueFromCoords(14, ny, null, true); // Contract Amt
        instance.setValueFromCoords(15, ny, null, true); // Order Amt

        // Reset visual state
        instance.setStyle(cellName, 'background-color', '');
        instance.setStyle(cellName, 'color', '');
        if (typeof instance.setComments === 'function') {
          instance.setComments(cellName, '');
        }
      } else {
        // If code not found in summaryData, treat as validation error or clear auto-fills
        instance.setValueFromCoords(6, ny, '', true); 
        instance.setValueFromCoords(7, ny, null, true);
        instance.setValueFromCoords(9, ny, '', true);
        instance.setValueFromCoords(13, ny, null, true);
        instance.setValueFromCoords(14, ny, null, true);
        instance.setValueFromCoords(15, ny, null, true);

        // Visual feedback for invalid code
        instance.setStyle(cellName, 'background-color', '#fee2e2'); // red-100
        instance.setStyle(cellName, 'color', '#b91c1c'); // red-700
        if (typeof instance.setComments === 'function') {
          instance.setComments(cellName, 'Invalid code: Not found in contract summary or not a low-level item.');
        }
      }
    }

    if (onchange && instance) onchange(instance, cell, x, y, value);
    
    // Re-validate all codes if any code changed to ensure duplicate status is updated for all rows
    if (nx === 1) {
      validateAllCodes(instance);
    }
  }, [onchange]); // Removed summaryData from dependencies

  const validateAllCodes = (instance: any) => {
    if (!instance || typeof instance.getData !== 'function') return;
    const data = instance.getData();
    const codeCounts: Record<string, number[]> = {};
    
    // Pass 1: Count occurrences and record indices
    data.forEach((row: any[], index: number) => {
      const code = String(row[1] || '').trim();
      if (code !== '') {
        if (!codeCounts[code]) codeCounts[code] = [];
        codeCounts[code].push(index);
      }
    });

    // Pass 2: Apply styling based on counts
    data.forEach((row: any[], index: number) => {
      const code = String(row[1] || '').trim();
      const cellName = `${getColumnName(1)}${index + 1}`;
      
      const currentSummaryData = summaryDataRef.current || [];
      const isInvalid = code !== '' && !currentSummaryData.some(s => s.sheet_code === code);
      const isDuplicate = code !== '' && codeCounts[code] && codeCounts[code].length > 1;

      if (isDuplicate) {
        instance.setStyle(cellName, 'background-color', '#fee2e2');
        instance.setStyle(cellName, 'color', '#b91c1c');
        if (typeof instance.setComments === 'function') {
          instance.setComments(cellName, `Duplicate code detected: ${code}`);
        }
      } else if (isInvalid) {
        // Keep invalid styling if it's already there from handleCellChange or re-apply it
        instance.setStyle(cellName, 'background-color', '#fee2e2');
        instance.setStyle(cellName, 'color', '#b91c1c');
        if (typeof instance.setComments === 'function') {
           // Only update comment if it doesn't already have one or if it was a duplicate
           const currentComment = instance.getComments(cellName);
           if (!currentComment || currentComment.includes('Duplicate')) {
             instance.setComments(cellName, 'Invalid code: Not found in contract summary.');
           }
        }
      } else {
        // Clear error styling if neither duplicate nor invalid
        instance.setStyle(cellName, 'background-color', '');
        instance.setStyle(cellName, 'color', '');
        if (typeof instance.setComments === 'function') {
          instance.setComments(cellName, '');
        }
      }
    });
  };

  const handleVendorSelect = (vendor: Vendor) => {
    if (vendorTargetCoords && jInstance.current) {
      const { x, y } = vendorTargetCoords;
      const sheet = getJInstance();
      if (sheet) {
        sheet.setValueFromCoords(x, y, vendor.vendor_name, true);
        sheet.setValueFromCoords(12, y, vendor.id, true); // Hidden vendor_id (12)
      }
    }
    setIsVendorModalOpen(false);
    setVendorTargetCoords(null);
  };

  const handleItemSelect = (item: ContractOrderSummary) => {
    if (itemTargetCoords && jInstance.current) {
      const { x, y } = itemTargetCoords;
      const sheet = getJInstance();
      if (sheet) {
        sheet.setValueFromCoords(x, y, item.sheet_code, true);
        // Trigger handleCellChange explicitly or let it trigger naturally from setValueFromCoords(..., true)
        // setValueFromCoords with true should trigger onchange.
      }
    }
    setIsItemModalOpen(false);
    setItemTargetCoords(null);
  };

  useEffect(() => {
    const container = jRef.current;
    if (!container) return;
    
    container.innerHTML = '';
    jInstance.current = null;
    const currentData = Array.isArray(data) ? data : [];
    
    const initialData = currentData.length > 0
      ? transformToSheetData(currentData)
      : Array.from({ length: 5 }, () => [null, '', '', '', '', '', '', null, '', null, null, null, null, null, null, null]);

    const normalizedReffTypes = Array.isArray(reffTypes) ? reffTypes : (reffTypes as any)?.data || [];
    const reffOptions = normalizedReffTypes.map((t: any) => ({
      id: t.id,
      name: t.refftype_name
    }));

    const columns = [
      { type: 'hidden', name: 'id', title: 'ID' },
      { 
        type: 'text', 
        name: 'sheet_code', 
        title: 'Code', 
        width: 120, 
        align: 'left',
        render: (cell: HTMLElement, value: string | number, x: string | number, y: string | number) => {
          const wrapper = document.createElement('div');
          wrapper.className = 'flex items-center justify-between w-full h-full';
          
          const text = document.createElement('span');
          text.innerText = String(value || '');
          text.className = 'truncate pr-2';
          
          const btn = document.createElement('button');
          btn.innerHTML = '<span class="material-icons text-sm" style="font-size: 16px;">search</span>';
          btn.className = 'p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors flex items-center justify-center';
          btn.onclick = (e) => {
            e.stopPropagation();
            setItemTargetCoords({ x: parseInt(x as string), y: parseInt(y as string) });
            setIsItemModalOpen(true);
          };
          
          wrapper.appendChild(text);
          wrapper.appendChild(btn);
          cell.innerHTML = '';
          cell.appendChild(wrapper);
          return cell;
        }
      },
      { 
        type: 'dropdown', 
        name: 'sheet_refftypeid', 
        title: 'Reff Type', 
        width: 120, 
        source: reffOptions,
        align: 'left'
      },
      { type: 'text', name: 'sheet_reffno', title: 'Reff No', width: 120 },
      { type: 'calendar', name: 'sheet_reffnodate', title: 'Reff No Date', width: 120, options: { format: 'DD/MM/YYYY' } },
      { 
        type: 'text', 
        name: 'vendor_name', 
        title: 'S/SM', 
        width: 180,
        readOnly: true,
        align: 'left',
        render: (cell: HTMLElement, value: string | number, x: string | number, y: string | number) => {
          const wrapper = document.createElement('div');
          wrapper.className = 'flex items-center justify-between w-full h-full';
          
          const text = document.createElement('span');
          text.innerText = String(value || '');
          text.className = 'truncate pr-2';
          
          const btn = document.createElement('button');
          btn.innerHTML = '<span class="material-icons text-sm" style="font-size: 16px;">search</span>';
          btn.className = 'p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors flex items-center justify-center';
          btn.onclick = (e) => {
            e.stopPropagation();
            setVendorTargetCoords({ x: parseInt(x as string), y: parseInt(y as string) });
            setIsVendorModalOpen(true);
          };
          
          wrapper.appendChild(text);
          wrapper.appendChild(btn);
          cell.innerHTML = '';
          cell.appendChild(wrapper);
          return cell;
        }
      },
      { type: 'text', name: 'sheet_description', title: 'Description', width: 300, wordWrap: true, align: 'left', readOnly: readOnly || false }, // Added readOnly
      { type: 'numeric', name: 'available_amount', title: 'Available Amt', width: 120, mask: '#,##0.00', readOnly: true, align: 'right', background: '#fef3c7' }, // Always read-only
      { type: 'numeric', name: 'sheet_qty', title: 'Vol', width: 80, mask: '#,##0.00', align: 'right', readOnly: readOnly || false }, // Added readOnly
      { type: 'text', name: 'uom_code', title: 'Sat', width: 60, align: 'center', readOnly: true }, // Always read-only
      { type: 'numeric', name: 'sheet_price', title: 'H.Satuan', width: 120, mask: '#,##0.00', align: 'right', readOnly: readOnly || false }, // Added readOnly
      { 
        type: 'numeric', 
        name: 'total', 
        title: 'Total', 
        width: 130, 
        mask: '#,##0.00', 
        readOnly: true, // Always read-only
        align: 'right',
        background: '#f3f4f6', 
      },
      { type: 'hidden', name: 'vendor_id' },
      { type: 'hidden', name: 'contractsheets_id' },
      { type: 'hidden', name: 'contract_amount' },
      { type: 'hidden', name: 'order_amount' },
      { type: 'hidden', name: 'sheetgroup_id' },
      { type: 'hidden', name: 'sheetgroup_type' },
    ];

    const options: any = {
      onchange: handleCellChange,
      oncopy: (instance: any, data: string) => {
        const selection = instance.getSelection(true); // true to get sorted/normalized coords
        if (!selection || selection.length < 4) return data;
        
        const [x1, y1, x2, y2] = selection;
        const rows: string[] = [];
        
        for (let j = y1; j <= y2; j++) {
          const rowData: any[] = [];
          for (let i = x1; i <= x2; i++) {
            let val = instance.getValueFromCoords(i, j);
            
            // Still check for HTML in case it somehow leaked into our raw data
            if (typeof val === 'string' && (val.includes('<') || val.includes('&lt;'))) {
               val = val.replace(/<button[^>]*>[\s\S]*?<\/button>/gi, '')
                        .replace(/<[^>]+>/g, '')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&amp;/g, '&')
                        .trim();
            }
            rowData.push(val === null || val === undefined ? '' : val);
          }
          rows.push(rowData.join('\t'));
        }
        
        return rows.join('\n');
      },
      worksheets: [{
        data: initialData,
        columns: columns,
        minDimensions: [15, 20], 
        tableOverflow: true,
        tableWidth: '100%',
        tableHeight: '450px',
        allowInsertRow: !readOnly, // Added
        allowDeleteRow: !readOnly, // Added
        onchange: handleCellChange,
      }],
      ondeleterow: (instance: any) => {
        validateAllCodes(getJInstance());
      },
      allowComments: true,
      contextMenu: readOnly ? () => false : true, // Modified
      search: true,
      pagination: 20,
      copyCompatibility: false, 
    };

    try {
      const el = jspreadsheet(container, options);
      jInstance.current = el;
      
      // Setup defaults
      getJInstance();
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
  }, [handleCellChange, transformToSheetData, reffOptions]); // reffOptions added back to ensure dropdown updates correctly if they change

  // Effect to update data without re-initializing the whole sheet
  useEffect(() => {
    const instance = getJInstance();
    if (instance && typeof instance.setData === 'function' && Array.isArray(data) && data.length > 0) {
      const currentData = instance.getData();
      const newData = transformToSheetData(data);
      
      if (JSON.stringify(currentData) !== JSON.stringify(newData)) {
        instance.setData(newData);
      }
    }
  }, [data, summaryData, transformToSheetData]);

  return (
    <>
      <style jsx global>{`
        ${wsStyle}
        .jexcel > tbody > tr > td.readonly {
          background-color: transparent !important;
        }
        .dark .jexcel > tbody > tr > td[data-x="10"] {
           background-color: #374151 !important;
           color: #f3f4f6 !important;
        }
      `}</style>
      <div className="w-full overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg bg-white dark:bg-gray-900 overflow-hidden">
        <div ref={jRef} />
      </div>

      <VendorSearchModal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        onSelect={handleVendorSelect}
      />

      <ContractOrderSummarySearchModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSelect={handleItemSelect}
        contractId={contractId}
      />
    </>
  );
});

OrderSheetTable.displayName = 'OrderSheetTable';

export default OrderSheetTable;
