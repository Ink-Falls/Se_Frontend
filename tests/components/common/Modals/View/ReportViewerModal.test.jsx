import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReportViewerModal from 'Se_Frontend/src/components/common/Modals/View/ReportViewerModal.jsx';

describe('ReportViewerModal', () => {
  const onClose = vi.fn();
  const onPrint = vi.fn();
  const onDelete = vi.fn();
  const pdfUrl = 'http://example.com/report.pdf';

  beforeEach(() => {
    onClose.mockClear();
    onPrint.mockClear();
    onDelete.mockClear();
  });

  it('renders the modal when isOpen is true', () => {
    render(<ReportViewerModal isOpen={true} onClose={onClose} pdfUrl={pdfUrl} onPrint={onPrint} onDelete={onDelete} error={null} />);
    expect(screen.getByText('Users Report')).toBeInTheDocument();
  });

  it('does not render the modal when isOpen is false', () => {
    render(<ReportViewerModal isOpen={false} onClose={onClose} pdfUrl={pdfUrl} onPrint={onPrint} onDelete={onDelete} error={null} />);
    expect(screen.queryByText('Users Report')).not.toBeInTheDocument();
  });

  it('handles close button click', () => {
    render(<ReportViewerModal isOpen={true} onClose={onClose} pdfUrl={pdfUrl} onPrint={onPrint} onDelete={onDelete} error={null} />);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('handles print button click', () => {
    render(<ReportViewerModal isOpen={true} onClose={onClose} pdfUrl={pdfUrl} onPrint={onPrint} onDelete={onDelete} error={null} />);
    fireEvent.click(screen.getByRole('button', { name: /print report/i }));
    expect(onPrint).toHaveBeenCalled();
  });

  it('handles delete button click', () => {
    render(<ReportViewerModal isOpen={true} onClose={onClose} pdfUrl={pdfUrl} onPrint={onPrint} onDelete={onDelete} error={null} />);
    fireEvent.click(screen.getByRole('button', { name: /delete report/i }));
    expect(onDelete).toHaveBeenCalled();
  });

  it('displays error message when error is present', () => {
    const errorMessage = 'Failed to generate report';
    render(<ReportViewerModal isOpen={true} onClose={onClose} pdfUrl={pdfUrl} onPrint={onPrint} onDelete={onDelete} error={errorMessage} />);
    expect(screen.getByText('Error Generating Report')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays PDF iframe when no error is present', () => {
    render(<ReportViewerModal isOpen={true} onClose={onClose} pdfUrl={pdfUrl} onPrint={onPrint} onDelete={onDelete} error={null} />);
    expect(screen.getByTitle('PDF Report')).toBeInTheDocument();
  });
});