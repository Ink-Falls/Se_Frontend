import { jsPDF } from 'jspdf';
import 'jspdf-autotable';  // Import this first

export const generateEnrollmentReport = async (enrollments) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header setup
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('UNIVERSITY OF SANTO TOMAS', pageWidth/2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('National Training Service - Literacy Training Service', pageWidth/2, 30, { align: 'center' });
    doc.text('AralKademy Learning Management System', pageWidth/2, 40, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('ENROLLMENT REPORT', pageWidth/2, 55, { align: 'center' });
    
    // Add date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 70);

    // Group enrollments by status
    const pending = enrollments.filter(e => e.status.toLowerCase() === 'pending');
    const approved = enrollments.filter(e => e.status.toLowerCase() === 'approved');
    const rejected = enrollments.filter(e => e.status.toLowerCase() === 'rejected');

    // Updated table configuration
    const tableConfig = {
      head: [['ID', 'Full Name', 'Status', 'Enrollment Date']],
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [33, 37, 41],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      theme: 'grid',
    };

    let yPosition = 85;

    // Function to add a section table
    const addSectionTable = (title, data) => {
      if (data.length === 0) return yPosition;

      // Add section title
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 15, yPosition);
      
      // Generate table data
      const tableData = data.map(item => [
        item.id,
        item.fullName,
        item.status,
        item.enrollmentDate
      ]);

      // Add table using autoTable with proper configuration
      doc.autoTable({
        ...tableConfig,
        startY: yPosition + 5,
        body: tableData,
        margin: { left: 15, right: 15 }
      });

      return doc.lastAutoTable.finalY + 15;
    };

    // Add sections
    if (pending.length > 0) {
      yPosition = addSectionTable('Pending Enrollments', pending);
    }
    if (approved.length > 0) {
      if (yPosition > doc.internal.pageSize.height - 100) {
        doc.addPage();
        yPosition = 20;
      }
      yPosition = addSectionTable('Approved Enrollments', approved);
    }
    if (rejected.length > 0) {
      if (yPosition > doc.internal.pageSize.height - 100) {
        doc.addPage();
        yPosition = 20;
      }
      yPosition = addSectionTable('Rejected Enrollments', rejected);
    }

    // Add summary page
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Summary', pageWidth/2, 30, { align: 'center' });

    const summaryData = [
      ['Status', 'Count'],
      ['Pending', pending.length],
      ['Approved', approved.length],
      ['Rejected', rejected.length],
      ['Total', enrollments.length]
    ];

    doc.autoTable({
      ...tableConfig,
      startY: 40,
      head: [summaryData[0]],
      body: summaryData.slice(1),
      margin: { left: 50, right: 50 }
    });

    return doc;
  } catch (error) {
    console.error('Error generating enrollment report:', error);
    throw new Error('Failed to generate enrollment report');
  }
};
