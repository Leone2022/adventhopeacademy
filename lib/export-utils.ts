import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Table, TableRow, TableCell, Paragraph, TextRun, AlignmentType, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

interface Student {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: string;
  curriculum: string;
  status: string;
  email?: string;
  phone?: string;
  isBoarding: boolean;
  currentClass?: {
    id: string;
    name: string;
  };
  account?: {
    balance: number;
  };
  parents?: Array<{
    parent: {
      user: {
        name: string;
        email: string;
        phone: string;
      };
    };
    relationship: string;
    isPrimary: boolean;
  }>;
}

/**
 * Export students to Excel with proper formatting
 * Handles all students (no truncation)
 */
export async function exportToExcel(
  students: Student[],
  filename: string = `students-${new Date().toISOString().split('T')[0]}.xlsx`
) {
  if (!students || students.length === 0) {
    alert('No students to export');
    return;
  }

  const data = students.map(student => ({
    'Student Number': student.studentNumber,
    'First Name': student.firstName,
    'Last Name': student.lastName,
    'Middle Name': student.middleName || '-',
    'Gender': student.gender,
    'Date of Birth': new Date(student.dateOfBirth).toLocaleDateString(),
    'Email': student.email || '-',
    'Phone': student.phone || '-',
    'Curriculum': student.curriculum,
    'Class': student.currentClass?.name || '-',
    'Status': student.status,
    'Boarding': student.isBoarding ? 'Yes' : 'No',
    'Account Balance': student.account?.balance || 0,
    'Primary Parent': 
      student.parents?.find(p => p.isPrimary)?.parent?.user?.name || '-',
  }));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const columnWidths = [
    { wch: 12 }, // Student Number
    { wch: 12 }, // First Name
    { wch: 12 }, // Last Name
    { wch: 12 }, // Middle Name
    { wch: 10 }, // Gender
    { wch: 12 }, // Date of Birth
    { wch: 20 }, // Email
    { wch: 12 }, // Phone
    { wch: 12 }, // Curriculum
    { wch: 15 }, // Class
    { wch: 12 }, // Status
    { wch: 10 }, // Boarding
    { wch: 15 }, // Account Balance
    { wch: 18 }, // Primary Parent
  ];

  worksheet['!cols'] = columnWidths;

  // Format header row (bold)
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + '1';
    if (!worksheet[address]) continue;
    worksheet[address].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'FF3B82F6' } },
      alignment: { horizontal: 'center' },
    };
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

  // Add summary sheet
  const summaryData = [
    ['Export Summary'],
    [],
    ['Total Students', students.length],
    ['Export Date', new Date().toLocaleDateString()],
    ['Export Time', new Date().toLocaleTimeString()],
    [],
    ['Curriculum Breakdown'],
    ...Array.from(
      new Map(
        students.map(s => [s.curriculum, students.filter(st => st.curriculum === s.curriculum).length])
      ),
      ([curriculum, count]) => [curriculum, count]
    ),
    [],
    ['Status Breakdown'],
    ...Array.from(
      new Map(
        students.map(s => [s.status, students.filter(st => st.status === s.status).length])
      ),
      ([status, count]) => [status, count]
    ),
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  XLSX.writeFile(workbook, filename);
}

/**
 * Export students to PDF with pagination
 * Handles large datasets properly
 */
export async function exportToPDF(
  students: Student[],
  filename: string = `students-${new Date().toISOString().split('T')[0]}.pdf`
) {
  if (!students || students.length === 0) {
    alert('No students to export');
    return;
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const footerY = pageHeight - margin;
  let currentY = margin + 15;

  // Add header
  doc.setFontSize(18);
  doc.text('Student List Report', margin, margin + 5);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, margin + 12);

  // Summary stats
  doc.setFontSize(9);
  const zimsecCount = students.filter(s => s.curriculum === 'ZIMSEC').length;
  const cambridgeCount = students.filter(s => s.curriculum === 'CAMBRIDGE').length;

  doc.text(`Total Students: ${students.length} | ZIMSEC: ${zimsecCount} | Cambridge: ${cambridgeCount}`, margin, margin + 18);

  // Prepare table data
  const tableData = students.map((student) => [
    student.studentNumber,
    `${student.firstName} ${student.lastName}`,
    student.curriculum,
    student.currentClass?.name || 'N/A',
    student.status,
    student.email || 'N/A',
  ]);

  // Add table with pagination support
  autoTable(doc, {
    head: [['Student #', 'Name', 'Curriculum', 'Class', 'Status', 'Email']],
    body: tableData,
    startY: currentY + 3,
    margin: margin,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    didDrawPage: (data) => {
      // Add page numbers
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.getHeight();
      const pageCount = (doc as any).internal.pages.length - 1;
      doc.setFontSize(8);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageSize.getWidth() - margin - 10,
        pageHeight - margin / 2,
        { align: 'right' }
      );
    },
  });

  doc.save(filename);
}

/**
 * Export students to Word document
 * Handles large datasets with proper formatting
 */
export async function exportToWord(
  students: Student[],
  filename: string = `students-${new Date().toISOString().split('T')[0]}.docx`
) {
  if (!students || students.length === 0) {
    alert('No students to export');
    return;
  }

  const rows = students.map(
    student =>
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph(student.studentNumber)],
            width: { size: 12, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph(`${student.firstName} ${student.lastName}`)],
            width: { size: 18, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph(student.curriculum)],
            width: { size: 12, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph(student.currentClass?.name || '-')],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph(student.status)],
            width: { size: 12, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph(student.email || '-')],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph(student.phone || '-')],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
        ],
      })
  );

  const zimsecCount = students.filter(s => s.curriculum === 'ZIMSEC').length;
  const cambridgeCount = students.filter(s => s.curriculum === 'CAMBRIDGE').length;

  const doc = new Document({
    sections: [
      {
        children: [
          // Title
          new Paragraph({
            text: 'Student List Report',
            heading: 'Heading1' as any,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          // Metadata
          new Paragraph({
            text: `Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),

          // Summary
          new Paragraph({
            children: [
              new TextRun({
                text: `Total Students: ${students.length} | ZIMSEC: ${zimsecCount} | Cambridge: ${cambridgeCount}`,
                bold: true,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header row
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Student #', bold: true })] })],
                    shading: { fill: 'E0E7FF' },
                    width: { size: 12, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Name', bold: true })] })],
                    shading: { fill: 'E0E7FF' },
                    width: { size: 18, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Curriculum', bold: true })] })],
                    shading: { fill: 'E0E7FF' },
                    width: { size: 12, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Class', bold: true })] })],
                    shading: { fill: 'E0E7FF' },
                    width: { size: 15, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Status', bold: true })] })],
                    shading: { fill: 'E0E7FF' },
                    width: { size: 12, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Email', bold: true })] })],
                    shading: { fill: 'E0E7FF' },
                    width: { size: 20, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Phone', bold: true })] })],
                    shading: { fill: 'E0E7FF' },
                    width: { size: 15, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              ...rows,
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

/**
 * Helper function to fetch all students for export
 * with optional filtering
 */
export async function fetchStudentsForExport(filters: {
  search?: string;
  status?: string;
  curriculum?: string;
  classId?: string;
}): Promise<Student[]> {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.curriculum) params.append('curriculum', filters.curriculum);
  if (filters.classId) params.append('classId', filters.classId);

  const response = await fetch(`/api/students/export?${params}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch students for export');
  }

  const data = await response.json();
  return data.students;
}
