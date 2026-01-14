'use client';

import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback, useState } from 'react';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import 'jsuites/dist/jsuites.css';
import wsStyle from '@/utils/wsStyle';
import { useReffTypes } from '@/hooks/useReffTypes';
import VendorSearchModal from '@/components/features/vendors/VendorSearchModal';
import { Vendor } from '@/services/vendorService';

interface OrderSheetTableProps {
  data: any[];
  orderId: number | string;
  projectId: number;
  onchange?: (instance: any, cell: any, x: any, y: any, value: any) => void;
}

const OrderSheetTable = forwardRef((props: OrderSheetTableProps, ref) => {
  const { data, orderId, projectId, onchange } = props;
  const jRef = useRef<HTMLDivElement>(null);
  const jInstance = useRef<any>(null);
  
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [vendorTargetCoords, setVendorTargetCoords] = useState<{ x: number, y: number } | null>(null);

  const { data: reffTypes } = useReffTypes();

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
          
          // New mapping:
          // 0: id (hidden)
          // 1: sheet_code
          // 2: sheet_refftypeid
          // 3: sheet_reffno
          // 4: sheet_reffnodate
          // 5: vendor_name
          // 6: sheet_description
          // 7: sheet_qty
          // 8: uom_name
          // 9: sheet_price
          // 10: total (calc)
          // 11: vendor_id (hidden)
          
          const [
            id,
            sheet_code,
            sheet_refftypeid,
            sheet_reffno,
            sheet_reffnodate,
            vendor_name,
            sheet_description,
            sheet_qty,
            uom_name,
            sheet_price,
            total,
            vendor_id
          ] = row;

          if (!hasValue(sheet_code)) {
            return null;
          }

          const qtyNum = hasValue(sheet_qty) ? parseFloat(sheet_qty) : 0;
          const priceNum = hasValue(sheet_price) ? parseFloat(sheet_price) : 0;
          const totalVal = qtyNum * priceNum;

          return {
            id: id ? parseInt(id) : undefined,
            order_id: isEditMode ? (typeof orderId === 'string' ? parseInt(orderId) : orderId as number) : undefined,
            sheet_code: String(sheet_code),
            sheet_refftypeid: sheet_refftypeid ? parseInt(sheet_refftypeid) : undefined,
            sheet_reffno: sheet_reffno ? String(sheet_reffno) : '',
            sheet_reffnodate: sheet_reffnodate ? String(sheet_reffnodate) : null,
            vendor_id: vendor_id ? parseInt(vendor_id) : undefined,
            vendor_name: vendor_name ? String(vendor_name) : '',
            sheet_description: sheet_description ? String(sheet_description) : '',
            sheet_qty: qtyNum,
            uom_name: uom_name ? String(uom_name) : '',
            sheet_price: priceNum,
            sheet_grossamt: totalVal,
            sheet_netamt: totalVal,
            project_id: projectId
          };
        })
        .filter(Boolean);
    },
  }));

  const transformToSheetData = useCallback((items: any[]) => {
    if (!Array.isArray(items)) return [];
    return items.map((item) => [
      item.id || null,
      item.sheet_code || '',
      item.sheet_refftypeid || '',
      item.sheet_reffno || '',
      item.sheet_reffnodate ? item.sheet_reffnodate.split('T')[0] : '',
      item.vendor_name || (item.vendor?.vendor_name) || '',
      item.sheet_description || '',
      item.sheet_qty || null,
      item.uom_name || (item.uom?.uom_name) || '',
      item.sheet_price || null,
      (item.sheet_qty && item.sheet_price) ? (item.sheet_qty * item.sheet_price) : null,
      item.vendor_id || (item.vendor?.id) || null,
    ]);
  }, []);

  const handleCellChange = useCallback((instance: any, cell: any, x: any, y: any, value: any) => {
    if (!instance || y === undefined) return;
    
    const nx = parseInt(x);
    const ny = parseInt(y);
    const qtyCol = 7;
    const priceCol = 9;
    const totalCol = 10;

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
          // If total is 0 and inputs are missing/0, we might want to show 0.00
          // But strict request: "default value to blank". 
          // Use standard handling for now (0.00). If dynamic blank needed, logic would be here.
          instance.setValueFromCoords(totalCol, ny, total, true, false);
        }
      } catch (e) {
        console.warn('Calc error', e);
      }
    }
    if (onchange) onchange(instance, cell, x, y, value);
  }, [onchange]);

  const handleVendorSelect = (vendor: Vendor) => {
    if (vendorTargetCoords && jInstance.current) {
      const { x, y } = vendorTargetCoords;
      const sheet = getJInstance();
      if (sheet) {
        sheet.setValueFromCoords(x, y, vendor.vendor_name, true);
        sheet.setValueFromCoords(11, y, vendor.id, true);
      }
    }
    setIsVendorModalOpen(false);
    setVendorTargetCoords(null);
  };

  useEffect(() => {
    const container = jRef.current;
    if (!container) return;
    
    container.innerHTML = '';
    jInstance.current = null;

    const initialData = data && data.length > 0 
      ? transformToSheetData(data)
      : Array.from({ length: 5 }, () => [null, '', '', '', '', '', '', null, '', null, null, null]);

    const normalizedReffTypes = Array.isArray(reffTypes) ? reffTypes : (reffTypes as any)?.data || [];
    const reffOptions = normalizedReffTypes.map((t: any) => ({
      id: t.id,
      name: t.refftype_name
    }));

    const columns = [
      { type: 'hidden', name: 'id', title: 'ID' },
      { type: 'text', name: 'sheet_code', title: 'Code', width: 100, align: 'left' },
      { 
        type: 'dropdown', 
        name: 'sheet_refftypeid', 
        title: 'Reff Type', 
        width: 120, 
        source: reffOptions 
      },
      { type: 'text', name: 'sheet_reffno', title: 'Reff No', width: 120 },
      { type: 'calendar', name: 'sheet_reffnodate', title: 'Reff No Date', width: 120, options: { format: 'DD/MM/YYYY' } },
      { 
        type: 'text', 
        name: 'vendor_name', 
        title: 'S/SM', 
        width: 180,
        readOnly: true,
        render: (cell: any, value: any, x: any, y: any, instance: any) => {
          const wrapper = document.createElement('div');
          wrapper.className = 'flex items-center justify-between w-full h-full';
          
          const text = document.createElement('span');
          text.innerText = value || '';
          text.className = 'truncate pr-2';
          
          const btn = document.createElement('button');
          btn.innerHTML = '<span class="material-icons text-sm" style="font-size: 16px;">search</span>';
          btn.className = 'p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors flex items-center justify-center';
          btn.onclick = (e) => {
            e.stopPropagation();
            setVendorTargetCoords({ x: parseInt(x), y: parseInt(y) });
            setIsVendorModalOpen(true);
          };
          
          wrapper.appendChild(text);
          wrapper.appendChild(btn);
          cell.innerHTML = '';
          cell.appendChild(wrapper);
          return cell;
        }
      },
      { type: 'text', name: 'sheet_description', title: 'Description', width: 300, wordWrap: true },
      { type: 'numeric', name: 'sheet_qty', title: 'Vol', width: 80, mask: '#,##0.00', align: 'right' },
      { type: 'text', name: 'uom_name', title: 'Sat', width: 60, align: 'center' },
      { type: 'numeric', name: 'sheet_price', title: 'H.Satuan', width: 120, mask: '#,##0.00', align: 'right' },
      { 
        type: 'numeric', 
        name: 'total', 
        title: 'Total', 
        width: 130, 
        mask: '#,##0.00', 
        readOnly: true, 
        align: 'right',
        background: '#f3f4f6', 
      },
      { type: 'hidden', name: 'vendor_id' },
    ];

    const options: any = {
      onchange: handleCellChange,
      worksheets: [{
        data: initialData,
        columns: columns,
        minDimensions: [11, 20], 
        tableOverflow: true,
        tableWidth: '100%',
        tableHeight: '450px',
        onchange: handleCellChange,
      }],
      allowComments: true,
      contextMenu: true,
      search: true,
      pagination: 20,
      copyCompatibility: true,
    };

    try {
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
  }, [onchange, handleCellChange, transformToSheetData, data, reffTypes]);

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
    </>
  );
});

OrderSheetTable.displayName = 'OrderSheetTable';

export default OrderSheetTable;
