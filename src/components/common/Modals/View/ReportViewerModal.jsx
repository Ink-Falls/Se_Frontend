import React from 'react';
import { X, Printer, Trash2, AlertCircle } from 'lucide-react';

const ReportViewerModal = ({ isOpen, onClose, pdfUrl, onPrint, onDelete, error, title = "Report" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="flex items-center gap-4">
            {!error && (
              <>
                <button
                  onClick={onPrint}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  title="Print Report"
                >
                  <Printer size={20} />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 hover:bg-gray-100 rounded-full text-red-500"
                  title="Delete Report"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Generating Report</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : (
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title="PDF Report"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportViewerModal;
