import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { CrmTask, CrmTaskStatus } from '../data/crmData';
import { COMPANY_INFO } from '../data/solarData';

/**
 * Format status for human-readable display
 */
export function getStatusLabel(status: CrmTaskStatus | 'all'): string {
  switch (status) {
    case 'not started':
      return 'Not Started';
    case 'in progress':
      return 'In Progress';
    case 'pending':
      return 'Pending';
    case 'on hold':
      return 'On Hold';
    case 'compleated':
      return 'Compleated';
    case 'all':
    default:
      return 'All Statuses';
  }
}

/**
 * Export filtered tasks to an Excel (.xlsx) file
 */
export function exportTasksToExcel(
  tasks: CrmTask[],
  filterStatus: CrmTaskStatus | 'all',
  customTitle?: string
): void {
  const statusLabel = getStatusLabel(filterStatus);
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // 1. Prepare data rows for SheetJS
  const rows = tasks.map((task, index) => {
    const latestRemark =
      task.remarksHistory && task.remarksHistory.length > 0
        ? task.remarksHistory[task.remarksHistory.length - 1]
        : null;

    return {
      'S.No.': index + 1,
      'Project Code': task.taskCode,
      'Customer Name': task.customerName,
      'Contact Mobile': task.customerPhone,
      'Site Address / Location': task.customerAddress,
      'Plant Capacity (kW)': `${task.capacityKw} kW`,
      'System Type': task.systemType,
      'Current Status': getStatusLabel(task.status),
      'Priority Level': task.priority,
      'Assigned Staff / Engineer': task.assignedToUserName,
      'Assigned Date': new Date(task.assignedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      'Owner Special Instructions': task.ownerInstructions || 'None',
      'UPPCL Account / Consumer No': task.uppclAccountNo || 'N/A',
      'Roof Structure Type': task.roofType || 'RCC Flat Roof',
      'Monthly Electricity Bill': task.monthlyBillRs ? `Rs. ${task.monthlyBillRs}` : 'N/A',
      'Last Updated By': task.lastUpdatedBy || 'N/A',
      'Last Updated Time': task.lastUpdatedAt
        ? new Date(task.lastUpdatedAt).toLocaleString('en-IN')
        : 'N/A',
      'Latest Progress Remark': latestRemark
        ? `[${latestRemark.authorName}] ${latestRemark.message || ''} (Status: ${latestRemark.statusChangedTo || task.status})`
        : 'No remarks submitted yet',
    };
  });

  // 2. Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths for optimal reading
  worksheet['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 14 }, // Project Code
    { wch: 22 }, // Customer Name
    { wch: 15 }, // Phone
    { wch: 30 }, // Address
    { wch: 18 }, // Capacity
    { wch: 18 }, // System Type
    { wch: 16 }, // Status
    { wch: 12 }, // Priority
    { wch: 22 }, // Assigned User
    { wch: 15 }, // Assigned Date
    { wch: 32 }, // Owner Instructions
    { wch: 22 }, // UPPCL No
    { wch: 18 }, // Roof Type
    { wch: 18 }, // Monthly Bill
    { wch: 20 }, // Last Updated By
    { wch: 22 }, // Last Updated Time
    { wch: 45 }, // Latest Remark
  ];

  const workbook = XLSX.utils.book_new();
  const safeSheetName = `${statusLabel.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 28)} Projects`;
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

  // 3. Download the .xlsx file
  const fileName = `Dilip_Enterprises_${statusLabel.replace(/\s+/g, '_')}_Projects_${dateStr}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Export filtered tasks to a beautifully styled PDF document
 */
export function exportTasksToPDF(
  tasks: CrmTask[],
  filterStatus: CrmTaskStatus | 'all',
  customTitle?: string
): void {
  const statusLabel = getStatusLabel(filterStatus);
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // A4 Landscape orientation for tabular project reports: 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;
  let currentY = 0;

  // Header background
  doc.setFillColor(26, 56, 130); // #1a3882
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Amber accent bar
  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(0, 26, pageWidth, 2, 'F');

  // Title & Company Info
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('DILIP ENTERPRISES - SOLAR CRM PROJECTS REPORT', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(251, 191, 36); // amber-400
  doc.text('UPNEDA Approved Solar Vendor • PM Surya Ghar Muft Bijli Yojana Channel Partner', 14, 17);

  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text(`Contact: ${COMPANY_INFO.phone} | Prayagraj, UP`, 14, 22);

  // Right-aligned status and count badge in header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(pageWidth - 95, 4, 85, 18, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`STATUS: ${statusLabel.toUpperCase()}`, pageWidth - 90, 11);

  doc.setFontSize(8);
  doc.setTextColor(251, 191, 36);
  doc.text(`Total Records: ${tasks.length} | Generated: ${dateStr}`, pageWidth - 90, 17);

  currentY = 34;

  // Table header setup
  const headers = [
    { label: '#', width: 8 },
    { label: 'Code', width: 22 },
    { label: 'Customer Name', width: 38 },
    { label: 'Mobile No.', width: 24 },
    { label: 'Location / Address', width: 44 },
    { label: 'System', width: 22 },
    { label: 'Status', width: 25 },
    { label: 'Assigned To', width: 32 },
    { label: 'Priority', width: 16 },
    { label: 'Assigned Date', width: 22 },
    { label: 'Latest Remark / Note', width: 44 },
  ];

  const drawTableHeader = (y: number) => {
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(10, y, pageWidth - 20, 8, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.line(10, y + 8, pageWidth - 10, y + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);

    let startX = 12;
    headers.forEach((h) => {
      doc.text(h.label, startX, y + 5.5);
      startX += h.width;
    });
  };

  drawTableHeader(currentY);
  currentY += 10;

  // Draw rows
  tasks.forEach((task, idx) => {
    // Check if new page is needed
    if (currentY > pageHeight - 20) {
      doc.addPage('a4', 'landscape');

      // Top mini header on next page
      doc.setFillColor(26, 56, 130);
      doc.rect(0, 0, pageWidth, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`DILIP ENTERPRISES - ${statusLabel.toUpperCase()} PROJECTS REPORT (Contd.)`, 14, 8);

      currentY = 16;
      drawTableHeader(currentY);
      currentY += 10;
    }

    // Row alternating background
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(10, currentY - 2, pageWidth - 20, 9, 'F');
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(10, currentY + 7, pageWidth - 10, currentY + 7);

    let startX = 12;

    // S.No
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(String(idx + 1), startX, currentY + 3.5);
    startX += headers[0].width;

    // Code
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 56, 130);
    doc.text(task.taskCode, startX, currentY + 3.5);
    startX += headers[1].width;

    // Customer Name
    doc.setTextColor(15, 23, 42);
    const safeCust = doc.splitTextToSize(task.customerName, headers[2].width - 2);
    doc.text(safeCust[0] || task.customerName, startX, currentY + 3.5);
    startX += headers[2].width;

    // Phone
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(task.customerPhone, startX, currentY + 3.5);
    startX += headers[3].width;

    // Address
    const safeAddr = doc.splitTextToSize(task.customerAddress, headers[4].width - 2);
    doc.text(safeAddr[0] || task.customerAddress, startX, currentY + 3.5);
    startX += headers[4].width;

    // Capacity & Type
    doc.setFont('helvetica', 'bold');
    doc.text(`${task.capacityKw}kW`, startX, currentY + 3.5);
    startX += headers[5].width;

    // Status (styled)
    doc.setFont('helvetica', 'bold');
    if (task.status === 'compleated') {
      doc.setTextColor(16, 185, 129); // emerald-500
    } else if (task.status === 'in progress') {
      doc.setTextColor(37, 99, 235); // blue-600
    } else if (task.status === 'pending') {
      doc.setTextColor(217, 119, 6); // amber-600
    } else if (task.status === 'on hold') {
      doc.setTextColor(225, 29, 72); // rose-600
    } else {
      doc.setTextColor(100, 116, 139); // slate-500
    }
    doc.text(getStatusLabel(task.status), startX, currentY + 3.5);
    startX += headers[6].width;

    // Assigned To
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    const safeAssigned = doc.splitTextToSize(task.assignedToUserName, headers[7].width - 2);
    doc.text(safeAssigned[0] || task.assignedToUserName, startX, currentY + 3.5);
    startX += headers[7].width;

    // Priority
    doc.setFont('helvetica', task.priority === 'Urgent' ? 'bold' : 'normal');
    doc.setTextColor(task.priority === 'Urgent' ? 225 : 71, task.priority === 'Urgent' ? 29 : 85, task.priority === 'Urgent' ? 72 : 105);
    doc.text(task.priority, startX, currentY + 3.5);
    startX += headers[8].width;

    // Assigned Date
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    const assDate = new Date(task.assignedAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
    doc.text(assDate, startX, currentY + 3.5);
    startX += headers[9].width;

    // Latest Remark
    const lastRemark =
      task.remarksHistory && task.remarksHistory.length > 0
        ? task.remarksHistory[task.remarksHistory.length - 1].message || 'Updated'
        : task.ownerInstructions || '-';
    const safeRemark = doc.splitTextToSize(lastRemark, headers[10].width - 2);
    doc.text(safeRemark[0] || '-', startX, currentY + 3.5);

    currentY += 9;
  });

  // Footer on last page
  currentY += 6;
  if (currentY > pageHeight - 12) {
    doc.addPage('a4', 'landscape');
    currentY = 16;
  }

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Confidential Internal Report • Dilip Enterprises Solar CRM • Exported on ${dateStr} at ${timeStr} • Total ${tasks.length} projects matching status "${statusLabel}"`,
    14,
    pageHeight - 8
  );

  // Download PDF
  const pdfFileName = `Dilip_Enterprises_${statusLabel.replace(/\s+/g, '_')}_Projects_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(pdfFileName);
}
