import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generateEnrollmentReport = async (enrollments) => {
  try {
    const doc = new jsPDF();

    // Set font styles
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);

    // Add headers
    doc.text('University of Santo Tomas', doc.internal.pageSize.width/2, 20, { align: 'center' });
    doc.text('National Training Service - Literacy Training Service', doc.internal.pageSize.width/2, 30, { align: 'center' });
    doc.text('AralKademy Learning Management System', doc.internal.pageSize.width/2, 40, { align: 'center' });

    doc.setFontSize(14);
    doc.text('Enrollment Report', doc.internal.pageSize.width/2, 60, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CURRENT ENROLLMENTS', doc.internal.pageSize.width/2, 80, { align: 'center' });

    // Group enrollments by status
    const pending = enrollments.filter(e => e.status.toLowerCase() === 'pending');
    const approved = enrollments.filter(e => e.status.toLowerCase() === 'approved');
    const rejected = enrollments.filter(e => e.status.toLowerCase() === 'rejected');

    // Common table headers
    const headers = [['ID', 'Full Name', 'Status', 'Enrollment Date']];

    // Format data for table
    const formatEnrollmentData = (enrollment) => [
      enrollment.id,
      enrollment.fullName,
      enrollment.status,
      enrollment.enrollmentDate
    ];

    // Add Pending Table
    if (pending.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Pending Enrollments', 14, 100);
      doc.autoTable({
        startY: 105,
        head: headers,
        body: pending.map(formatEnrollmentData),
        theme: 'grid'
      });
    }

    // Add Approved Table
    if (approved.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Approved Enrollments', 14, doc.lastAutoTable.finalY + 15);
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: headers,
        body: approved.map(formatEnrollmentData),
        theme: 'grid'
      });
    }

    // Add Rejected Table
    if (rejected.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Rejected Enrollments', 14, doc.lastAutoTable.finalY + 15);
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: headers,
        body: rejected.map(formatEnrollmentData),
        theme: 'grid'
      });
    }

    return doc;
  } catch (error) {
    console.error('Error generating enrollment report:', error);
    throw error;
  }
};
