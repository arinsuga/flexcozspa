"use client";

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { projectService, Project } from '@/services/projectService';
import { contractService, Contract } from '@/services/contractService';
import { reportService, OrderRecapResponse } from '@/services/reportService';
import SelectInput, { SelectOption } from '@/components/common/SelectInput';

export default function OrderRecapReportPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [reportData, setReportData] = useState<OrderRecapResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadContracts(selectedProjectId);
    } else {
      setContracts([]);
      setSelectedContractId('');
      setReportData(null);
    }
  }, [selectedProjectId]);

  const loadProjects = async () => {
    try {
      const response = await projectService.getAll({ per_page: 100 });
      const data = (response.data && Array.isArray(response.data)) ? response.data : 
                   (Array.isArray(response) ? response : []);
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects", error);
    }
  };

  const loadContracts = async (projectId: string) => {
    try {
      const response = await contractService.getAll({ per_page: 100 });
      const allContracts = (response.data && Array.isArray(response.data)) ? response.data : 
                           (Array.isArray(response) ? response : []);
                           
      const filtered = allContracts.filter((c: Contract) => c.project_id === Number(projectId));
      setContracts(filtered);
    } catch (error) {
      console.error("Failed to load contracts", error);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedProjectId || !selectedContractId) return;
    setLoading(true);
    try {
      const data = await reportService.getOrderRecap(Number(selectedProjectId), Number(selectedContractId));
      setReportData(data);
    } catch (error) {
      console.error("Failed to load report", error);
    } finally {
      setLoading(false);
    }
  };
  
  const projectOptions: SelectOption[] = projects.map(p => ({
    value: p.id,
    label: p.project_number ? `${p.project_number} - ${p.project_name}` : p.project_name
  }));

  const contractOptions: SelectOption[] = contracts.map(c => ({
    value: c.id,
    label: c.contract_number ? `${c.contract_number} - ${c.contract_name}` : c.contract_name
  }));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
  };

  const formatPercent = (val: number) => {
    return val.toFixed(2) + '%';
  };

  const handleExportExcel = () => {
    if (!reportData) return;

    const data = [
      ['Laporan Rekapitulasi Pekerjaan'],
      ['Rekapitulasi Pengeluaran Proyek'],
      [''],
      ['Nama Proyek', `: ${reportData.header.project_name}`],
      ['Alamat Proyek', `: ${reportData.header.project_address}`],
      ['Nomor Proyek', `: ${reportData.header.project_number}`],
      ['Jadwal Pekerjaan', `: ${reportData.header.schedule || '-'}`],
      ['Periode s/d', `: ${reportData.header.period}`],
      [''],
      ['No.', 'Uraian Pekerjaan', 'RAP', 'Pengeluaran Proyek', '', 'Saldo Proyek RAP', ''],
      ['', '', '', 'Bobot (%)', 'Nilai', 'Bobot (%)', 'Nilai'],
      ...reportData.rows.map(row => [
        row.code,
        row.name,
        row.rap_amount,
        row.expense_weight / 100,
        row.expense_amount,
        row.balance_weight / 100,
        row.balance_amount
      ]),
      ['Total', '', reportData.totals.rap, 
        reportData.totals.rap !== 0 ? (reportData.totals.expense / reportData.totals.rap) : 0,
        reportData.totals.expense,
        reportData.totals.rap !== 0 ? (reportData.totals.balance / reportData.totals.rap) : 0,
        reportData.totals.balance
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Basic column width estimation
    const colWidths = [
      { wch: 5 },  // No.
      { wch: 40 }, // Uraian
      { wch: 20 }, // RAP
      { wch: 12 }, // Bobot Exp
      { wch: 20 }, // Nilai Exp
      { wch: 12 }, // Bobot Bal
      { wch: 20 }  // Nilai Bal
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Order Recap");
    XLSX.writeFile(wb, `Order_Recap_${reportData.header.project_number}.xlsx`);
  };

  const handleExportPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF('l', 'mm', 'a4');
    const title = "REKAPITULASI PENGELUARAN PROYEK";
    
    doc.setFontSize(16);
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Nama Proyek    : ${reportData.header.project_name}`, 14, 25);
    doc.text(`Alamat Proyek  : ${reportData.header.project_address}`, 14, 30);
    doc.text(`Nomor Proyek   : ${reportData.header.project_number}`, 14, 35);
    doc.text(`Jadwal          : ${reportData.header.schedule || '-'}`, 14, 40);
    doc.text(`Periode         : ${reportData.header.period}`, 14, 45);

    autoTable(doc, {
      startY: 55,
      head: [
        [
          { content: 'No.', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'Uraian Pekerjaan', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'RAP', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'Pengeluaran Proyek', colSpan: 2, styles: { halign: 'center' } },
          { content: 'Saldo Proyek RAP', colSpan: 2, styles: { halign: 'center' } },
        ],
        [
          { content: 'Bobot (%)', styles: { halign: 'center' } },
          { content: 'Nilai', styles: { halign: 'center' } },
          { content: 'Bobot (%)', styles: { halign: 'center' } },
          { content: 'Nilai', styles: { halign: 'center' } },
        ]
      ],
      body: [
        ...reportData.rows.map(row => [
          row.code,
          row.name,
          formatCurrency(row.rap_amount),
          formatPercent(row.expense_weight),
          formatCurrency(row.expense_amount),
          formatPercent(row.balance_weight),
          formatCurrency(row.balance_amount)
        ]),
        [
          { content: 'Total', colSpan: 2, styles: { halign: 'center', fontStyle: 'bold' } },
          { content: formatCurrency(reportData.totals.rap), styles: { fontStyle: 'bold', halign: 'right' } },
          { content: reportData.totals.rap !== 0 ? formatPercent((reportData.totals.expense / reportData.totals.rap) * 100) : '0.00%', styles: { fontStyle: 'bold', halign: 'right' } },
          { content: formatCurrency(reportData.totals.expense), styles: { fontStyle: 'bold', halign: 'right' } },
          { content: reportData.totals.rap !== 0 ? formatPercent((reportData.totals.balance / reportData.totals.rap) * 100) : '0.00%', styles: { fontStyle: 'bold', halign: 'right' } },
          { content: formatCurrency(reportData.totals.balance), styles: { fontStyle: 'bold', halign: 'right' } },
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], lineWidth: 0.1 },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' },
      }
    });

    doc.save(`Order_Recap_${reportData.header.project_number}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 dark:text-gray-100">
      <style jsx global>{`
        @media print {
          aside, nav, header, button, .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          table {
            border-color: #000 !important;
          }
          th, td {
            border-color: #000 !important;
            color: #000 !important;
          }
        }
      `}</style>

      <h1 className="text-2xl font-bold mb-6 dark:text-white no-print">Laporan Rekapitulasi Pekerjaan</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded shadow no-print">
        <div>
          <SelectInput
            label="Project"
            options={projectOptions}
            value={selectedProjectId}
            onChange={(val) => {
              setSelectedProjectId(val as string);
              setSelectedContractId('');
            }}
            placeholder="Select Project"
            isClearable
          />
        </div>
        <div>
          <SelectInput
             label="Contract"
             options={contractOptions}
             value={selectedContractId}
             onChange={(val) => setSelectedContractId(val as string)}
             placeholder="Select Contract"
             isDisabled={!selectedProjectId}
             isClearable
          />
        </div>
        <div className="md:col-span-2 pt-2">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 transition-colors"
            onClick={handleGenerateReport}
            disabled={!selectedProjectId || !selectedContractId || loading}
          >
            {loading ? 'Generating...' : 'Display Report'}
          </button>
        </div>
      </div>

      {reportData && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow overflow-x-auto text-gray-900 dark:text-gray-100 print-area">
          <div className="flex justify-between items-center mb-6 no-print">
            <h2 className="text-xl font-bold underline decoration-2 underline-offset-8">Rekapitulasi Pengeluaran Proyek</h2>
            <div className="flex gap-2">
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1.5 rounded transition-colors text-sm"
              >
                <span className="material-icons text-[18px]">print</span>
                Print
              </button>
              <button 
                onClick={handleExportPDF}
                className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40 px-3 py-1.5 rounded transition-colors text-sm"
              >
                <span className="material-icons text-[18px]">picture_as_pdf</span>
                PDF
              </button>
              <button 
                onClick={handleExportExcel}
                className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/40 px-3 py-1.5 rounded transition-colors text-sm"
              >
                <span className="material-icons text-[18px]">table_view</span>
                Excel
              </button>
            </div>
          </div>

          <div className="hidden no-print lg:block print:block mb-6 text-center lg:hidden">
             <h2 className="text-xl font-bold underline decoration-2 underline-offset-8">Rekapitulasi Pengeluaran Proyek</h2>
          </div>
          
          {/* Header Report */}
          <div className="mb-6 grid grid-cols-[max-content_auto] gap-x-4 gap-y-2 text-sm">
            <div className="font-bold">Nama Proyek</div>
            <div>: {reportData.header.project_name}</div>
            
            <div className="font-bold">Alamat Proyek</div>
            <div>: {reportData.header.project_address}</div>
            
            <div className="font-bold">Nomor Proyek</div>
            <div>: {reportData.header.project_number}</div>
            
            <div className="font-bold">Jadwal Pekerjaan</div>
            <div>: {reportData.header.schedule || '-'}</div>
            
            <div className="font-bold">Periode s/d</div>
            <div>: {reportData.header.period}</div>
          </div>

          {/* Table Report */}
          <table className="w-full border-collapse border border-gray-400 dark:border-gray-600 text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th rowSpan={2} className="border border-gray-400 dark:border-gray-600 p-2 text-center">No.</th>
                <th rowSpan={2} className="border border-gray-400 dark:border-gray-600 p-2 text-center">Uraian Pekerjaan</th>
                <th rowSpan={2} className="border border-gray-400 dark:border-gray-600 p-2 text-center">RAP</th>
                <th colSpan={2} className="border border-gray-400 dark:border-gray-600 p-2 text-center">Pengeluaran Proyek</th>
                <th colSpan={2} className="border border-gray-400 dark:border-gray-600 p-2 text-center">Saldo Proyek RAP</th>
              </tr>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border border-gray-400 dark:border-gray-600 p-2 text-center">Bobot</th>
                <th className="border border-gray-400 dark:border-gray-600 p-2 text-center">Nilai</th>
                <th className="border border-gray-400 dark:border-gray-600 p-2 text-center">Bobot</th>
                <th className="border border-gray-400 dark:border-gray-600 p-2 text-center">Nilai</th>
              </tr>
            </thead>
            <tbody>
              {reportData.rows.map((row) => (
                <tr key={row.sheetgroup_id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="border border-gray-400 dark:border-gray-600 p-2 text-center">{row.code}</td>
                  <td className="border border-gray-400 dark:border-gray-600 p-2">{row.name}</td>
                  <td className="border border-gray-400 dark:border-gray-600 p-2 text-right">{formatCurrency(row.rap_amount)}</td>
                  <td className="border border-gray-400 dark:border-gray-600 p-2 text-right">{formatPercent(row.expense_weight)}</td>
                  <td className="border border-gray-400 dark:border-gray-600 p-2 text-right">{formatCurrency(row.expense_amount)}</td>
                  <td className="border border-gray-400 dark:border-gray-600 p-2 text-right">{formatPercent(row.balance_weight)}</td>
                  <td className="border border-gray-400 dark:border-gray-600 p-2 text-right">{formatCurrency(row.balance_amount)}</td>
                </tr>
              ))}
              <tr className="font-bold bg-gray-50 dark:bg-gray-700">
                <td colSpan={2} className="border border-gray-400 dark:border-gray-600 p-2 text-center">Total</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2 text-right">{formatCurrency(reportData.totals.rap)}</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2 text-right">
                    {reportData.totals.rap !== 0 ? formatPercent((reportData.totals.expense / reportData.totals.rap) * 100) : '0.00%'}
                </td>
                <td className="border border-gray-400 dark:border-gray-600 p-2 text-right">{formatCurrency(reportData.totals.expense)}</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2 text-right">
                    {reportData.totals.rap !== 0 ? formatPercent((reportData.totals.balance / reportData.totals.rap) * 100) : '0.00%'}
                </td>
                <td className="border border-gray-400 dark:border-gray-600 p-2 text-right">{formatCurrency(reportData.totals.balance)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
