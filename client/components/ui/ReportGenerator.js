import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
  CalendarIcon,
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

export default function ReportGenerator({ 
  title = "Rapor Oluştur", 
  onGenerate, 
  reportTypes = [],
  dateRange = true,
  filters = [],
  loading = false 
}) {
  const [selectedType, setSelectedType] = useState(reportTypes[0]?.value || '');
  const [selectedDateRange, setSelectedDateRange] = useState('last30days');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [format, setFormat] = useState('pdf');

  const handleFilterChange = (filterKey, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const handleGenerate = () => {
    const reportData = {
      type: selectedType,
      dateRange: selectedDateRange,
      filters: selectedFilters,
      format
    };
    onGenerate(reportData);
  };

  const getReportIcon = (type) => {
    switch (type) {
      case 'student':
        return <UserGroupIcon className="h-5 w-5" />;
      case 'class':
        return <AcademicCapIcon className="h-5 w-5" />;
      case 'assignment':
        return <DocumentArrowDownIcon className="h-5 w-5" />;
      case 'exam':
        return <ChartBarIcon className="h-5 w-5" />;
      default:
        return <DocumentArrowDownIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="btn btn-outline btn-sm"
            title="Yazdır"
          >
            <PrinterIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => {/* Share functionality */}}
            className="btn btn-outline btn-sm"
            title="Paylaş"
          >
            <ShareIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Report Type Selection */}
        {reportTypes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rapor Türü
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {reportTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedType === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getReportIcon(type.value)}
                    <div className="text-left">
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-gray-500">{type.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date Range Selection */}
        {dateRange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tarih Aralığı
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'last7days', label: 'Son 7 Gün' },
                { value: 'last30days', label: 'Son 30 Gün' },
                { value: 'last90days', label: 'Son 3 Ay' },
                { value: 'custom', label: 'Özel Aralık' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setSelectedDateRange(range.value)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedDateRange === range.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">{range.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Filters */}
        {filters.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Filtreler
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filters.map((filter) => (
                <div key={filter.key}>
                  <label className="block text-sm text-gray-600 mb-1">
                    {filter.label}
                  </label>
                  {filter.type === 'select' ? (
                    <select
                      value={selectedFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="input w-full"
                    >
                      <option value="">Tümü</option>
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : filter.type === 'multiselect' ? (
                    <div className="space-y-2">
                      {filter.options.map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedFilters[filter.key]?.includes(option.value) || false}
                            onChange={(e) => {
                              const currentValues = selectedFilters[filter.key] || [];
                              const newValues = e.target.checked
                                ? [...currentValues, option.value]
                                : currentValues.filter(v => v !== option.value);
                              handleFilterChange(filter.key, newValues);
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type={filter.type}
                      value={selectedFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="input w-full"
                      placeholder={filter.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Dosya Formatı
          </label>
          <div className="flex space-x-4">
            {[
              { value: 'pdf', label: 'PDF', icon: '📄' },
              { value: 'excel', label: 'Excel', icon: '📊' },
              { value: 'csv', label: 'CSV', icon: '📋' }
            ].map((formatOption) => (
              <button
                key={formatOption.value}
                onClick={() => setFormat(formatOption.value)}
                className={`flex items-center space-x-2 p-3 rounded-lg border transition-all ${
                  format === formatOption.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="text-lg">{formatOption.icon}</span>
                <span className="text-sm font-medium">{formatOption.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleGenerate}
            disabled={loading || !selectedType}
            className="btn btn-primary"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Oluşturuluyor...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span>Rapor Oluştur</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

