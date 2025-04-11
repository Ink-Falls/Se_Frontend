import React from 'react';
import { X, Printer, Trash2, AlertCircle } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';

const ReportViewerModal = ({ isOpen, onClose, pdfUrl, onPrint, onDelete, error, title = "Report" }) => {
  const { isDarkMode } = useTheme();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-[95%] md:w-[90%] max-w-4xl h-[90vh] flex flex-col relative transition-colors">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
          <div className="flex items-center gap-2">
            {!error && (
              <>
                <button
                  onClick={onPrint}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300 transition-colors"
                  title="Print Report"
                >
                  <Printer size={20} />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-red-500 transition-colors"
                  title="Delete Report"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-hidden transition-colors">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <AlertCircle size={40} className="text-red-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Generating Report</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">{error}</p>
            </div>
          ) : (
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title="PDF Report"
              style={{ display: 'block', border: 'none' }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportViewerModal;
