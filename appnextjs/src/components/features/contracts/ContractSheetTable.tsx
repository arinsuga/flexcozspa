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
  sheetgroupType?: number;
  onchange?: (instance: any, cell: any, x: any, y: any, value: any) => void;
  readOnly?: boolean;
}

const ContractSheetTable = forwardRef((props: ContractSheetTableProps, ref) => {
  const { data, contractId, projectId, sheetgroupId = 1, sheetgroupType = 0, onchange, readOnly = false } = props;
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
            id: id ? parseInt(id) : `temp_${sheet_code}_${index}`,
            project_id: parseInt(projectId as unknown as string),
            contract_id: isEditMode ? (typeof contractId === 'string' ? parseInt(contractId) : contractId as number) : undefined,
            sheet_dt: originalSheet?.sheet_dt || null,
            sheet_type: sheetType,
            sheetgroup_type: sheetgroupType,
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
            sheet_seqno: index + 1,
            is_active: row[8] !== undefined ? parseInt(row[8]) : 1,
            ordersheets_count: row[9] !== undefined ? parseInt(row[9]) : 0,
          };

          return sheet;
        })
        .filter(Boolean);
    },
  }));

  // Recursive calculation for PENGELUARAN column (Index 7)
  const calculateRecursiveExpenses = useCallback((dataArr: any[]) => {
    if (!Array.isArray(dataArr)) return dataArr;
    
    // 1. Reset all header expenses (Index 7) to 0
    dataArr.forEach(row => {
      if (Array.isArray(row)) {
        const sheetType = row[10];
        if (sheetType === 0) row[7] = 0;
      }
    });

    // 2. Aggregate leaf expenses to parents
    dataArr.forEach(row => {
      if (!Array.isArray(row)) return;
      const code = String(row[1] || '').trim();
      const sheetType = row[10];
      const amount = parseFloat(row[7]) || 0;

      if (sheetType === 1 && code !== '' && amount > 0) {
        let currentCode = code;
        while (currentCode.includes('.')) {
          const lastDot = currentCode.lastIndexOf('.');
          const parentCode = currentCode.substring(0, lastDot);
          
          const parentRow = dataArr.find(r => Array.isArray(r) && String(r[1]).trim() === parentCode && r[10] === 0);
          if (parentRow) {
            parentRow[7] = (parseFloat(parentRow[7]) || 0) + amount;
          }
          currentCode = parentCode;
        }
      }
    });
    return dataArr;
  }, []);

  // Transform ContractSheet data to jspreadsheet format
  const transformToSheetData = useCallback((sheets: ContractSheet[]) => {
    if (!Array.isArray(sheets)) return [];
    return sheets.map((sheet) => [
      sheet.id,
      sheet.sheet_code,
      sheet.sheet_description,
      sheet.sheet_type === 0 ? null : sheet.sheet_qty,
      sheet.uom_code,
      sheet.sheet_type === 0 ? null : sheet.sheet_price,
      sheet.sheet_grossamt, // Total (calculated)
      sheet.order_summary?.order_amount || 0, // PENGELUARAN (Index 7)
      sheet.is_active, // Index 8
      sheet.ordersheets_count || 0, // Index 9
      sheet.sheet_type || 0 // Index 10
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
    const allVisibleCols = [1, 2, 3, 4, 5, 6]; 

    rawData.forEach((row: any, y: number) => {
      const hasRealId = row[0] && typeof row[0] === 'number';
      const isInactive = row[8] === 0 && hasRealId;
      const inUse = (row[9] || 0) > 0;
      
      allVisibleCols.forEach((x) => {
        const value = row[x];
        const isRequired = requiredCols.includes(x);
        const isValid = !isRequired || hasValue(value);
        
        let color = isValid ? '' : 'red';
        
        // If inactive, use gray color
        if (isInactive) color = '#9ca3af';

        if (typeof instance.setStyle === 'function') {
          const cellName = String.fromCharCode(65 + x) + (y + 1);
          instance.setStyle(cellName, 'color', color);
          
          // Background for in-use: Amber
          if (inUse) {
             instance.setStyle(cellName, 'background-color', '#fffbeb'); // Amber 50
          } else {
             instance.setStyle(cellName, 'background-color', '');
          }
          
          // Strikethrough for inactive - REMOVED per requirement
          // Skip columns 1 (Code) and 2 (Description) as they handle it in their custom renderers
          instance.setStyle(cellName, 'text-decoration', 'none');
          
          // Set Code column (x=1) as read-only if item is in use
          if (x === 1 && inUse) {
            instance.setReadOnly(cellName, true);
          } else if (x === 1 && !inUse) {
            instance.setReadOnly(cellName, false);
          }
          
         // Set all visible columns read-only for header rows
          const sheetType = (row[10] !== undefined && row[10] !== null) ? row[10] : 1;
          const isHeaderRow = sheetType === 0;
          if (isHeaderRow && x >= 1 && x <= 7) {
            instance.setReadOnly(cellName, true);
          }
        }
      });
    });
  }, []);

  const handleCellChange = useCallback((instance: any, cell: any, x: any, y: any, value: any) => {
    if (!instance || y === undefined) return;
    
    const nx = parseInt(x);
    const ny = parseInt(y);
    const codeCol = 1;
    const descCol = 2;
    const qtyCol = 3;
    const satCol = 4;
    const priceCol = 5;
    const totalCol = 6;
    const requiredCols = [codeCol, descCol, satCol];

    // Requirement: When Code is cleared, clear all other columns in the row
    if (nx === codeCol && (!value || String(value).trim() === '')) {
      instance.setValueFromCoords(descCol, ny, '', true);
      instance.setValueFromCoords(qtyCol, ny, '', true);
      instance.setValueFromCoords(satCol, ny, '', true);
      instance.setValueFromCoords(priceCol, ny, '', true);
      instance.setValueFromCoords(totalCol, ny, 0, true);
      
      // Refresh styling for the cleared row
      setTimeout(() => validateTable(instance), 50);
    }

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

    // UOM Normalization (Column 5: Sat)
    if (nx === satCol && value && normalizerRef.current) {
      const normalized = normalizerRef.current.normalize(value);
      if (normalized !== value) {
        instance.setValueFromCoords(satCol, ny, normalized, true);
        
        // Visual feedback
        const cellName = String.fromCharCode(65 + satCol) + (ny + 1);
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
  }, [onchange, validateTable]);

  useEffect(() => {
    const container = jRef.current;
    if (!container) return;
    
    // Completely clear the container to prevent duplicate tables
    container.innerHTML = '';
    jInstance.current = null;

    // Use Array.from to avoid shared references between rows
    const initialDataTemplate = Array.isArray(data) && data.length > 0 
      ? transformToSheetData(data)
      : Array.from({ length: 100 }, () => [null, '', '', null, '', null, null, 0, 1, 0, 1]);

    const initialData = calculateRecursiveExpenses(initialDataTemplate);

    const columns = [
      { type: 'hidden', name: 'id', title: 'ID', width: 0 },
      { 
        type: 'text', 
        name: 'sheet_code', 
        title: 'Code', 
        width: 150, 
        align: 'left',
        render: (cell: HTMLElement, value: string | number, x: string | number, y: string | number) => {
          const instance = getJInstance();
          if (!instance) return cell;
          
          const row = instance.getRowData(parseInt(y as string));
          const hasRealId = row[0] && typeof row[0] === 'number';
          const isInactive = row[8] === 0 && hasRealId;
          const inUse = (row[9] || 0) > 0;
          const sheetType = (row[10] !== undefined && row[10] !== null) ? row[10] : 1;
          const isHeader = sheetType === 0;
          
          const wrapper = document.createElement('div');
          wrapper.className = 'flex items-center justify-between w-full h-full';
          wrapper.style.display = 'flex';
          wrapper.style.justifyContent = 'space-between';
          wrapper.style.alignItems = 'center';
          
          const text = document.createElement('span');
          text.innerText = String(value || '');
          text.className = 'truncate pr-2';
          if (isInactive) {
            // text.style.textDecoration = 'line-through';
          }
          // Bold text for header rows
          if (isHeader) {
            text.style.fontWeight = 'bold';
          }
          
          const btnContainer = document.createElement('div');
          btnContainer.style.display = 'flex';
          btnContainer.style.gap = '4px';
          
          const hasData = value && String(value).trim() !== '';
          if (hasData) {
            if (isHeader) {
              // --- HEADER ROW LOGIC ---
              const currentDataArr = instance.getData();
              const currentCode = String(value || '').trim();
              
              // Check if any other row has this code as a parent
              const hasChildren = currentCode !== '' && currentDataArr.some((r: any[]) => {
                if (!r || !r[1]) return false;
                const otherCode = String(r[1]).trim();
                return otherCode !== '' && otherCode !== currentCode && otherCode.startsWith(currentCode + '.');
              });
              
              if (!hasChildren) {
                // Empty Header -> Can be deleted
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<span class="material-icons-outlined" style="font-size: 18px; color: #dc2626;">delete</span>';
                deleteBtn.style.padding = '3px';
                deleteBtn.style.borderRadius = '4px';
                deleteBtn.style.display = 'flex';
                deleteBtn.style.alignItems = 'center';
                deleteBtn.style.justifyContent = 'center';
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.style.border = '1px solid #dc2626';
                deleteBtn.style.backgroundColor = 'transparent';
                deleteBtn.style.transition = 'all 0.2s';
                deleteBtn.title = 'Delete Header (No children)';
                deleteBtn.onclick = (e) => {
                  e.stopPropagation();
                  const currentDataNow = instance.getData();
                  const nonEmptyRows = currentDataNow.filter((r: any[]) => r && r[1] && String(r[1]).trim() !== '');
                  if (nonEmptyRows.length <= 1) {
                    alert('Cannot delete the last item. At least one row must remain.');
                    return;
                  }
                  instance.deleteRow(parseInt(y as string));
                };
                btnContainer.appendChild(deleteBtn);
              } else {
                // Protected Header -> Disabled delete
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<span class="material-icons-outlined" style="font-size: 18px; color: #9ca3af;">delete_outline</span>';
                deleteBtn.style.padding = '3px';
                deleteBtn.style.borderRadius = '4px';
                deleteBtn.style.display = 'flex';
                deleteBtn.style.alignItems = 'center';
                deleteBtn.style.justifyContent = 'center';
                deleteBtn.style.cursor = 'not-allowed';
                deleteBtn.style.opacity = '0.5';
                deleteBtn.style.border = '1px solid #d1d5db';
                deleteBtn.style.backgroundColor = 'transparent';
                deleteBtn.title = 'Cannot delete: Header still has children items';
                btnContainer.appendChild(deleteBtn);
              }
            } else {
              // --- NORMAL ITEM LOGIC ---
              if (inUse) {
                // In-use item -> Toggle only
                const toggleBtn = document.createElement('button');
                const toggleIcon = isInactive ? 'toggle_off' : 'toggle_on';
                const toggleColor = '#f59e0b';
                
                toggleBtn.innerHTML = `<span class="material-icons-outlined" style="font-size: 18px; color: ${toggleColor};">${toggleIcon}</span>`;
                toggleBtn.style.padding = '3px';
                toggleBtn.style.borderRadius = '4px';
                toggleBtn.style.display = 'flex';
                toggleBtn.style.alignItems = 'center';
                toggleBtn.style.justifyContent = 'center';
                toggleBtn.style.cursor = 'pointer';
                toggleBtn.style.border = '1px solid #f59e0b';
                toggleBtn.style.backgroundColor = 'transparent';
                toggleBtn.style.transition = 'all 0.2s';
                toggleBtn.title = isInactive ? 'Inactive - Click to Activate' : 'Active - Click to Deactivate';
                toggleBtn.onclick = (e) => {
                  e.stopPropagation();
                  const newValue = isInactive ? 1 : 0;
                  instance.setValueFromCoords(8, parseInt(y as string), newValue, true);
                  setTimeout(() => {
                    validateTable(instance);
                    const rowIdx = parseInt(y as string);
                    
                    const colOptions = instance.options.columns;
                    // Re-render Code cell
                    const codeRender = colOptions[1].render;
                    if (codeRender && cell) codeRender(cell, instance.getValueFromCoords(1, rowIdx), 1, y);
                    
                    // Re-render Description cell
                    const descRender = colOptions[2].render;
                    const descCell = instance.getCell(2, rowIdx);
                    if (descRender && descCell) descRender(descCell, instance.getValueFromCoords(2, rowIdx), 2, y);
                    
                    // Re-render Total cell
                    const totalRender = colOptions[6].render;
                    const totalCell = instance.getCell(6, rowIdx);
                    if (totalRender && totalCell) totalRender(totalCell, instance.getValueFromCoords(6, rowIdx), 6, y);

                    // Re-render Pengeluaran cell
                    const expRender = colOptions[7].render;
                    const expCell = instance.getCell(7, rowIdx);
                    if (expRender && expCell) expRender(expCell, instance.getValueFromCoords(7, rowIdx), 7, y);
                  }, 50);
                };
                btnContainer.appendChild(toggleBtn);
                
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<span class="material-icons-outlined" style="font-size: 18px; color: #9ca3af;">delete_forever</span>';
                deleteBtn.style.padding = '3px';
                deleteBtn.style.borderRadius = '4px';
                deleteBtn.style.display = 'flex';
                deleteBtn.style.alignItems = 'center';
                deleteBtn.style.justifyContent = 'center';
                deleteBtn.style.cursor = 'not-allowed';
                deleteBtn.style.opacity = '0.6';
                deleteBtn.style.border = '1px solid #d1d5db';
                deleteBtn.style.backgroundColor = 'transparent';
                deleteBtn.title = 'Cannot delete: Item is used in orders';
                btnContainer.appendChild(deleteBtn);
              } else {
                // Unused item -> Standard delete
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<span class="material-icons-outlined" style="font-size: 18px; color: #dc2626;">delete</span>';
                deleteBtn.style.padding = '3px';
                deleteBtn.style.borderRadius = '4px';
                deleteBtn.style.display = 'flex';
                deleteBtn.style.alignItems = 'center';
                deleteBtn.style.justifyContent = 'center';
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.style.border = '1px solid #dc2626';
                deleteBtn.style.backgroundColor = 'transparent';
                deleteBtn.style.transition = 'all 0.2s';
                deleteBtn.title = 'Click to Delete Row';
                deleteBtn.onclick = (e) => {
                  e.stopPropagation();
                  const currentDataNow = instance.getData();
                  const nonEmptyRows = currentDataNow.filter((r: any[]) => r && r[1] && String(r[1]).trim() !== '');
                  if (nonEmptyRows.length <= 1) {
                    alert('Cannot delete the last item. At least one row must remain.');
                    return;
                  }
                  instance.deleteRow(parseInt(y as string));
                };
                btnContainer.appendChild(deleteBtn);
              }
            }
          }
          
          wrapper.appendChild(text);
          wrapper.appendChild(btnContainer);
          cell.innerHTML = '';
          cell.appendChild(wrapper);
          return cell;
        }
      },
      { 
        type: 'text', 
        name: 'description', 
        title: 'Description', 
        width: 540, 
        align: 'left', 
        wordWrap: true,
        render: (cell: HTMLElement, value: string | number, x: string | number, y: string | number) => {
          const instance = getJInstance();
          if (!instance) return cell;
          
          const row = instance.getRowData(parseInt(y as string));
          const hasRealId = row[0] && typeof row[0] === 'number';
          const isInactive = row[8] === 0 && hasRealId;
          const sheetType = (row[10] !== undefined && row[10] !== null) ? row[10] : 1;
          const isHeader = sheetType === 0;
          
          const wrapper = document.createElement('div');
          wrapper.style.display = 'flex';
          wrapper.style.alignItems = 'center';
          wrapper.style.gap = '8px';
          wrapper.style.width = '100%';
          
          const text = document.createElement('span');
          text.innerText = String(value || '');
          text.style.flex = '1';
          if (isInactive) {
            // text.style.textDecoration = 'line-through';
          }
          // Bold text for header rows
          if (isHeader) {
            text.style.fontWeight = 'bold';
          }
          wrapper.appendChild(text);
          
          // Add HEADER badge for header rows
          if (isHeader) {
            const headerBadge = document.createElement('span');
            headerBadge.style.fontSize = '9px';
            headerBadge.style.fontWeight = '900';
            headerBadge.style.padding = '2px 6px';
            headerBadge.style.borderRadius = '4px';
            headerBadge.style.whiteSpace = 'nowrap';
            headerBadge.style.flexShrink = '0';
            headerBadge.style.textTransform = 'uppercase';
            headerBadge.style.letterSpacing = '-0.05em';
            headerBadge.innerText = 'Header';
            headerBadge.style.backgroundColor = 'rgba(73, 110, 146, 0.1)'; 
            headerBadge.style.setProperty('color', '#496E92', 'important'); 
            headerBadge.style.border = '1px solid rgba(73, 110, 146, 0.2)'; 
            wrapper.appendChild(headerBadge);
          }
          
          // Add status badge
          if (isInactive) {
            const badge = document.createElement('span');
            badge.style.fontSize = '11px';
            badge.style.fontWeight = '500';
            badge.style.padding = '3px 8px';
            badge.style.borderRadius = '6px';
            badge.style.whiteSpace = 'nowrap';
            badge.style.flexShrink = '0';
            
            // Inactive badge - Toggle color (Amber) - OUTLINE STYLE
            badge.innerText = 'INACTIVE';
            badge.style.backgroundColor = 'transparent';
            badge.style.color = '#f59e0b'; // Amber-500
            badge.style.border = '1px solid #f59e0b'; // Amber border
            badge.style.textDecoration = 'none'; // Ensure badge text doesn't have strikethrough
            
            wrapper.appendChild(badge);
          }
          
          cell.innerHTML = '';
          cell.appendChild(wrapper);
          return cell;
        }
      },
      { type: 'numeric', name: 'qty', title: 'Vol', width: 80, mask: '#,##0.00', align: 'right' },
      { 
        type: 'text', 
        name: 'uom_code', 
        title: 'Sat', 
        width: 100,
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
        render: (cell: HTMLElement, value: any, x: any, y: any) => {
          const instance = getJInstance();
          if (!instance) return cell;
          
          const row = instance.getRowData(parseInt(y as string));
          const hasRealId = row[0] && typeof row[0] === 'number';
          const isInactive = row[8] === 0 && hasRealId;
          const sheetType = (row[10] !== undefined && row[10] !== null) ? row[10] : 1;
          const isHeader = sheetType === 0;
          
          // Formatting to match #,##0.00
          const numValue = parseFloat(value) || 0;
          const formatted = new Intl.NumberFormat('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          }).format(numValue);
          
          const wrapper = document.createElement('div');
          wrapper.style.textAlign = 'right';
          wrapper.style.width = '100%';
          wrapper.style.color = 'inherit'; // Inherit color from cell (usually white on blue)
          
          const text = document.createElement('span');
          text.innerText = formatted;
          if (isInactive) {
            // text.style.textDecoration = 'line-through';
          }
          // Bold text for header rows
          if (isHeader) {
            text.style.fontWeight = 'bold';
          }
          
          wrapper.appendChild(text);
          cell.innerHTML = '';
          cell.appendChild(wrapper);
          return cell;
        }
      },
      { 
        type: 'numeric', 
        name: 'pengeluaran', 
        title: 'PENGELUARAN', 
        width: 200, 
        mask: '#,##0.00', 
        readOnly: true, 
        align: 'right',
        render: (cell: HTMLElement, value: any, x: any, y: any) => {
          const instance = getJInstance();
          if (!instance) return cell;
          
          const row = instance.getRowData(parseInt(y as string));
          const hasRealId = row[0] && typeof row[0] === 'number';
          const isInactive = row[8] === 0 && hasRealId;
          const sheetType = (row[10] !== undefined && row[10] !== null) ? row[10] : 1;
          const isHeader = sheetType === 0;
          
          const numValue = parseFloat(value) || 0;
          const formatted = new Intl.NumberFormat('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          }).format(numValue);
          
          const wrapper = document.createElement('div');
          wrapper.style.textAlign = 'right';
          wrapper.style.width = '100%';
          wrapper.innerText = formatted;
          
          if (isInactive) {
            // wrapper.style.textDecoration = 'line-through';
            wrapper.style.color = '#9ca3af';
          }
          if (isHeader) {
            wrapper.style.fontWeight = 'bold';
          }
          
          cell.innerHTML = '';
          cell.appendChild(wrapper);
          return cell;
        }
      },
      { type: 'hidden', name: 'is_active', title: 'Active', width: 0 },
      { type: 'hidden', name: 'ordersheets_count', title: 'Orders_Count', width: 0 },
      { type: 'hidden', name: 'sheet_type', title: 'Sheet_Type', width: 0 },
    ];

    if (readOnly) {
      columns.forEach(col => {
        if (col.name !== 'id') {
           (col as any).readOnly = true;
        }
      });
    }

    // jspreadsheet-ce v5 stable initialization
    const options = {
      onchange: handleCellChange,
      worksheets: [{
        data: initialData,
        columns: columns,
        minDimensions: [9, 1000], 
        tableOverflow: true,
        tableWidth: '100%',
        tableHeight: '600px',
        onchange: handleCellChange,
        onbeforechange: (instance: any, cell: any, x: any, y: any, value: any) => {
          const nx = parseInt(x);
          const ny = parseInt(y);
          if (nx === 1) { // Code column
            const row = instance.getRowData(ny);
            const inUse = (row[9] || 0) > 0;
            if (inUse) {
              return false; // Prevent change if in use
            }
          }
          return value;
        },
        onbeforeedition: (instance: any, cell: any, x: any, y: any) => {
          const nx = parseInt(x);
          const ny = parseInt(y);
          
          // Block editing for header rows (sheet_type = 0)
          const row = instance.getRowData(ny);
          const sheetType = (row[10] !== undefined && row[10] !== null) ? row[10] : 1;
          const isHeader = sheetType === 0;
          if (isHeader) {
            return false; // Block all editing for header rows
          }
          
          // Block editing Code column for in-use items
          if (nx === 1) {
            const inUse = (row[9] || 0) > 0;
            if (inUse) {
              return false;
            }
          }
          return true;
        },
        updateTable: (instance: any, cell: any, x: any, y: any, value: any) => {
          const nx = parseInt(x);
          const ny = parseInt(y);
          const row = instance.getRowData(ny);
          const isActive = row[8] === 0;
          const inUse = (row[9] || 0) > 0;
          
          // Style visible data columns (1-7)
          if (nx >= 1 && nx <= 7) {
             const requiredCols = [1, 2, 4];
             const isRequired = requiredCols.includes(nx);
             const hasVal = (val: any) => {
               if (val === null || val === undefined) return false;
               const strVal = String(val).trim();
               return strVal !== '' && strVal !== 'null' && strVal !== 'undefined' && strVal !== '0' && strVal !== '0.00';
             };
             const isValid = !isRequired || hasVal(value);
             
             // Color
             if (isActive) {
               cell.style.color = '#6b7280'; // Gray-500 for inactive
             } else if (!isValid) {
               cell.style.color = 'red';
             } else {
               cell.style.color = '#000000'; // Black for active and valid
             }

             // Background: Amber for in-use, Light gray for inactive
             if (isActive) {
               // Inactive row - light gray background
               cell.style.backgroundColor = '#f3f4f6'; // Gray-100
             } else if (inUse) {
               // Active and in-use - amber background
               cell.style.backgroundColor = '#fef3c7'; // Amber-100
             } else {
               // Active and not in-use - white/default
               cell.style.backgroundColor = '#ffffff';
             }

             // Text decoration: Strikethrough for inactive
             // Columns 1, 2, and 6 handle it in custom renderers, 3-5 handled here
             if (isActive && nx >= 3 && nx <= 5) {
               cell.style.textDecoration = 'line-through';
             } else {
               cell.style.textDecoration = 'none';
             }

             // Visual feedback for read-only Code column
             if (nx === 1) {
               if (inUse) {
                 cell.style.cursor = 'not-allowed';
                 cell.title = 'Code cannot be changed as it is already in use by orders';
               } else {
                 cell.style.cursor = '';
                 cell.title = '';
               }
             }
          }
        },
        contextMenu: (obj: any, x: any, y: any, e: any) => {
          if (readOnly) return false;
          
          const items = [];
          const rowData = obj.getRowData(y);
          const inUse = (rowData[9] || 0) > 0;
          const isActiveValue = rowData[8]; // 1 for active, 0 for inactive
          const isActive = isActiveValue !== 0;
          const sheetType = (rowData[10] !== undefined && rowData[10] !== null) ? rowData[10] : 1;
          const isHeader = sheetType === 0;
          
          // Context menu logic for header rows
          if (isHeader) {
            const allData = obj.getData();
            const code = String(rowData[1] || '').trim();
            const hasChildren = code !== '' && allData.some((r: any[]) => {
              const otherCode = String(r[1] || '').trim();
              return otherCode !== code && otherCode.startsWith(code + '.');
            });
            
            if (hasChildren) {
              // Block deletion menu if has children
              return false;
            }
          }

          // Standard JSS items
          items.push({
              title: obj.options.text.insertANewRowBefore,
              onclick: () => obj.insertRow(1, parseInt(y), 1)
          });
          items.push({
              title: obj.options.text.insertANewRowAfter,
              onclick: () => obj.insertRow(1, parseInt(y), 0)
          });
          
          items.push({ type: 'line' });

          if (inUse) {
              // In-use rows cannot be deleted, only inactivated
              items.push({
                  title: isActive ? 'Mark as Inactive' : 'Mark as Active',
                  onclick: () => {
                      const newValue = isActive ? 0 : 1;
                      obj.setValueFromCoords(8, y, newValue, true);
                  }
              });
              items.push({
                  title: 'Delete Row (Item in use)',
                  disabled: true
              });
          } else {
              // Not in use -> can be physically deleted
              items.push({
                  title: obj.options.text.deleteSelectedRows,
                  onclick: () => obj.deleteRow(parseInt(y))
              });
          }

          return items;
        },
      }],
      allowComments: true,
      search: true,
      pagination: 50,
      copyCompatibility: true,
      defaultColWidth: 100,
      onselection: () => {},
      ondeleterow: (instance: any) => {
        // When a row is deleted, parent headers might become empty.
        // We MUST force a re-render of the Code column to update the hierarchical delete button.
        setTimeout(() => {
          if (instance) {
             // Refresh read-only states
             validateTable(instance);

             // RE-CALCULATE RECURSIVE EXPENSES
             const dataNow = instance.getData();
             calculateRecursiveExpenses(dataNow);
             instance.setData(dataNow);
             
             // Refresh Code column (index 1) for all rows
             const numRows = instance.getData().length;
             const codeColIdx = 1;
             const colOptions = instance.options.columns;
             if (colOptions && colOptions[codeColIdx] && colOptions[codeColIdx].render) {
               const codeRenderFn = colOptions[codeColIdx].render;
               for (let yIdx = 0; yIdx < numRows; yIdx++) {
                 // Force re-render of the action cell and its children
                 const cell = instance.getCell(codeColIdx, yIdx);
                 if (cell) {
                   const cellVal = instance.getValueFromCoords(codeColIdx, yIdx);
                   codeRenderFn(cell as HTMLElement, cellVal, codeColIdx, yIdx);
                 }
               }
             }

             if (typeof instance.refresh === 'function') {
               instance.refresh();
             }
          }
        }, 300); // 300ms delay to ensure JSS internal data and DOM are fully settled
      },
      oninsertrow: (instance: any) => {
        // Similarly for insertion, we might create something that blocks a header
        setTimeout(() => {
          if (instance) {
            validateTable(instance);
            
            // RE-CALCULATE RECURSIVE EXPENSES
            const dataNow = instance.getData();
            calculateRecursiveExpenses(dataNow);
            instance.setData(dataNow);

            // Refresh Code column (index 1) for all rows
            const numRows = instance.getData().length;
            const codeColIdx = 1;
            const colOptions = instance.options.columns;
            if (colOptions && colOptions[codeColIdx] && colOptions[codeColIdx].render) {
              const codeRenderFn = colOptions[codeColIdx].render;
              for (let yIdx = 0; yIdx < numRows; yIdx++) {
                const cell = instance.getCell(codeColIdx, yIdx);
                if (cell) {
                  const cellVal = instance.getValueFromCoords(codeColIdx, yIdx);
                  codeRenderFn(cell as HTMLElement, cellVal, codeColIdx, yIdx);
                }
              }
            }

            if (typeof instance.refresh === 'function') {
              instance.refresh();
            }
          }
        }, 300);
      },
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
  }, [onchange, validateTable, handleCellChange, transformToSheetData, calculateRecursiveExpenses, readOnly]); // Removed 'data' to prevent re-init

  // Watch for external data changes - SURGICAL ZERO-FLICKER UPDATE
  useEffect(() => {
    const instance = getJInstance();
    if (!instance || typeof instance.getData !== 'function' || !Array.isArray(data) || data.length === 0) return;

    // Get current UI data
    const currentData = instance.getData();
    
    // Iterate through server data and update ONLY specific columns surgically
    // Column 7: Pengeluaran, Column 8: is_active, Column 9: ordersheets_count, Column 10: sheet_type
    let hasChanges = false;
    
    data.forEach((serverSheet) => {
      // Find the row index in the spreadsheet by ID (Column 0)
      const rowIndex = currentData.findIndex((row: any) => row[0] === serverSheet.id);
      
      if (rowIndex !== -1) {
        const row = currentData[rowIndex];
        const serverExpense = serverSheet.order_summary?.order_amount || 0;
        const serverActive = serverSheet.is_active;
        const serverOrderCount = serverSheet.ordersheets_count || 0;
        
        // Surgically update if values changed
        if (parseFloat(row[7]) !== serverExpense) {
          instance.setValueFromCoords(7, rowIndex, serverExpense, true);
          hasChanges = true;
        }
        if (row[8] !== serverActive) {
          instance.setValueFromCoords(8, rowIndex, serverActive, true);
          hasChanges = true;
        }
        if (row[9] !== serverOrderCount) {
          instance.setValueFromCoords(9, rowIndex, serverOrderCount, true);
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
       // Re-calculate headers based on surgical updates
       const dataNow = instance.getData();
       calculateRecursiveExpenses(dataNow);
       // We use setData(dataNow, true) to update the table data without triggering a full re-render if possible,
       // or just rely on the setValueFromCoords calls above. 
       // For headers, we might need to update them too:
       dataNow.forEach((row: any, idx: number) => {
         if (row[10] === 0) { // Header
           instance.setValueFromCoords(7, idx, row[7], true);
         }
       });
       
       validateTable(instance);
    }
  }, [data, calculateRecursiveExpenses, validateTable]);

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
