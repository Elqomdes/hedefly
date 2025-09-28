import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export default function ReportViewer({ 
  reportData, 
  onClose, 
  title = "Rapor Görüntüleyici",
  showControls = true 
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  const totalPages = reportData?.pages || 1;

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDownload = () => {
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${title}.pdf`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: 'Raporu paylaş',
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const resetZoom = () => {
    setZoom(100);
  };

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <DocumentArrowDownIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Rapor verisi yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          {showControls && (
            <>
              <button
                onClick={zoomOut}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Küçült"
              >
                <span className="text-lg">-</span>
              </button>
              <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <button
                onClick={zoomIn}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Büyüt"
              >
                <span className="text-lg">+</span>
              </button>
              <button
                onClick={resetZoom}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Sıfırla"
              >
                <span className="text-sm">100%</span>
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
            </>
          )}
          
          <button
            onClick={handleDownload}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title="İndir"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={handlePrint}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title="Yazdır"
          >
            <PrinterIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title="Paylaş"
          >
            <ShareIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran"}
          >
            {isFullscreen ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Kapat"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Report Content */}
      <div className="p-6 overflow-auto" style={{ maxHeight: isFullscreen ? 'calc(100vh - 120px)' : '600px' }}>
        <div 
          className="mx-auto bg-white shadow-lg"
          style={{ 
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            width: `${100 / (zoom / 100)}%`
          }}
        >
          {/* Sample Report Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {reportData.title || 'Rapor'}
              </h1>
              <p className="text-gray-600">
                {reportData.subtitle || 'Rapor detayları'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Oluşturulma Tarihi: {new Date().toLocaleDateString('tr-TR')}
              </p>
            </div>

            {/* Report Summary */}
            {reportData.summary && (
              <div className="mb-8 bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Özet</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {reportData.summary.map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{item.value}</div>
                      <div className="text-sm text-gray-600">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Report Charts/Data */}
            {reportData.charts && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Grafikler</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reportData.charts.map((chart, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-md font-medium text-gray-900 mb-3">{chart.title}</h3>
                      <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-500">Grafik: {chart.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Report Tables */}
            {reportData.tables && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tablo Verileri</h2>
                {reportData.tables.map((table, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="text-md font-medium text-gray-900 mb-3">{table.title}</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {table.headers.map((header, headerIndex) => (
                              <th
                                key={headerIndex}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {table.rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Report Text Content */}
            {reportData.content && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Detaylar</h2>
                <div className="prose max-w-none">
                  {reportData.content}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600">
              Sayfa {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

