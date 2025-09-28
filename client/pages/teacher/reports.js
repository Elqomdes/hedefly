import { useState, useEffect } from 'react';
import Head from 'next/head';
import TeacherLayout from '../../components/layout/TeacherLayout';
import { motion } from 'framer-motion';
import {
  DocumentArrowDownIcon,
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CalendarIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import ReportGenerator from '../../components/ui/ReportGenerator';
import ReportViewer from '../../components/ui/ReportViewer';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function TeacherReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);

  const reportTypes = [
    {
      value: 'student-progress',
      label: 'Öğrenci İlerleme Raporu',
      description: 'Öğrencilerin genel ilerleme durumu'
    },
    {
      value: 'assignment-analysis',
      label: 'Ödev Analiz Raporu',
      description: 'Ödevlerin performans analizi'
    },
    {
      value: 'exam-results',
      label: 'Sınav Sonuçları Raporu',
      description: 'Sınav sonuçları ve istatistikler'
    },
    {
      value: 'class-performance',
      label: 'Sınıf Performans Raporu',
      description: 'Sınıf geneli performans analizi'
    },
    {
      value: 'goal-tracking',
      label: 'Hedef Takip Raporu',
      description: 'Öğrenci hedeflerinin takibi'
    },
    {
      value: 'attendance',
      label: 'Devam Durumu Raporu',
      description: 'Öğrenci devam durumu analizi'
    }
  ];

  const filters = [
    {
      key: 'students',
      label: 'Öğrenciler',
      type: 'multiselect',
      options: [
        { value: 'student1', label: 'Ahmet Yılmaz' },
        { value: 'student2', label: 'Ayşe Demir' },
        { value: 'student3', label: 'Mehmet Kaya' }
      ]
    },
    {
      key: 'subjects',
      label: 'Dersler',
      type: 'multiselect',
      options: [
        { value: 'math', label: 'Matematik' },
        { value: 'science', label: 'Fen Bilimleri' },
        { value: 'turkish', label: 'Türkçe' }
      ]
    },
    {
      key: 'class',
      label: 'Sınıf',
      type: 'select',
      options: [
        { value: '5a', label: '5-A' },
        { value: '5b', label: '5-B' },
        { value: '6a', label: '6-A' }
      ]
    }
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample reports data
      const sampleReports = [
        {
          id: 1,
          title: 'Öğrenci İlerleme Raporu',
          type: 'student-progress',
          createdAt: new Date('2024-01-15'),
          status: 'completed',
          fileSize: '2.3 MB',
          pages: 15
        },
        {
          id: 2,
          title: 'Sınav Sonuçları Raporu',
          type: 'exam-results',
          createdAt: new Date('2024-01-14'),
          status: 'completed',
          fileSize: '1.8 MB',
          pages: 8
        },
        {
          id: 3,
          title: 'Sınıf Performans Raporu',
          type: 'class-performance',
          createdAt: new Date('2024-01-13'),
          status: 'generating',
          fileSize: null,
          pages: null
        }
      ];
      
      setReports(sampleReports);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (reportData) => {
    try {
      setGenerating(true);
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create new report
      const newReport = {
        id: Date.now(),
        title: reportTypes.find(t => t.value === reportData.type)?.label || 'Rapor',
        type: reportData.type,
        createdAt: new Date(),
        status: 'completed',
        fileSize: '2.1 MB',
        pages: 12
      };
      
      setReports(prev => [newReport, ...prev]);
      setShowGenerator(false);
      
      // Show success message
      alert('Rapor başarıyla oluşturuldu!');
      
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Rapor oluşturulurken bir hata oluştu');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewReport = (report) => {
    // Generate sample report data for viewer
    const sampleReportData = {
      title: report.title,
      subtitle: `${report.createdAt.toLocaleDateString('tr-TR')} tarihli rapor`,
      pages: report.pages || 1,
      summary: [
        { label: 'Toplam Öğrenci', value: '25' },
        { label: 'Ortalama Not', value: '78.5' },
        { label: 'Başarı Oranı', value: '85%' }
      ],
      charts: [
        { title: 'Not Dağılımı' },
        { title: 'İlerleme Grafiği' }
      ],
      tables: [
        {
          title: 'Öğrenci Notları',
          headers: ['Öğrenci Adı', 'Matematik', 'Fen', 'Türkçe', 'Ortalama'],
          rows: [
            ['Ahmet Yılmaz', '85', '90', '78', '84.3'],
            ['Ayşe Demir', '92', '88', '95', '91.7'],
            ['Mehmet Kaya', '76', '82', '80', '79.3']
          ]
        }
      ],
      content: `
        <h3>Rapor Özeti</h3>
        <p>Bu rapor, öğrencilerin genel performans durumunu ve ilerleme süreçlerini analiz etmektedir.</p>
        
        <h4>Genel Değerlendirme</h4>
        <p>Sınıf genelinde öğrenciler başarılı bir performans sergilemişlerdir. Matematik dersinde en yüksek başarı oranı görülürken, Türkçe dersinde iyileştirme alanları tespit edilmiştir.</p>
        
        <h4>Öneriler</h4>
        <ul>
          <li>Türkçe dersinde ek çalışma programları uygulanabilir</li>
          <li>Matematik dersinde ileri seviye konulara geçilebilir</li>
          <li>Fen bilimleri dersinde laboratuvar çalışmaları artırılabilir</li>
        </ul>
      `
    };
    
    setSelectedReport(sampleReportData);
  };

  const handleDeleteReport = (reportId) => {
    if (window.confirm('Bu raporu silmek istediğinizden emin misiniz?')) {
      setReports(prev => prev.filter(report => report.id !== reportId));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'generating':
        return 'Oluşturuluyor';
      case 'failed':
        return 'Başarısız';
      default:
        return 'Bilinmiyor';
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <LoadingSpinner />
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <Head>
        <title>Raporlar - Hedefly</title>
        <meta name="description" content="Öğrenci ve sınıf raporlarını görüntüleyin" />
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Raporlar</h1>
            <p className="text-gray-600">Öğrenci ve sınıf performans raporlarını oluşturun ve görüntüleyin</p>
          </div>
          <button
            onClick={() => setShowGenerator(true)}
            className="btn btn-primary flex items-center"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Yeni Rapor Oluştur
          </button>
        </div>

        {/* Report Generator Modal */}
        {showGenerator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <ReportGenerator
                title="Yeni Rapor Oluştur"
                onGenerate={handleGenerateReport}
                reportTypes={reportTypes}
                filters={filters}
                loading={generating}
              />
              <div className="p-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowGenerator(false)}
                  className="btn btn-outline mr-2"
                >
                  İptal
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Report Viewer Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden"
            >
              <ReportViewer
                reportData={selectedReport}
                onClose={() => setSelectedReport(null)}
                title="Rapor Görüntüleyici"
              />
            </motion.div>
          </div>
        )}

        {/* Reports List */}
        {reports.length === 0 ? (
          <EmptyState
            title="Henüz rapor oluşturulmadı"
            message="İlk raporunuzu oluşturmak için yukarıdaki butona tıklayın."
            icon={DocumentArrowDownIcon}
          >
            <button
              onClick={() => setShowGenerator(true)}
              className="btn btn-primary mt-4"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              İlk Raporu Oluştur
            </button>
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: reports.indexOf(report) * 0.1 }}
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DocumentArrowDownIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{report.title}</h3>
                      <p className="text-sm text-gray-500">
                        {report.createdAt.toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleViewReport(report)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Görüntüle"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Sil"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Durum:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(report.status)}`}>
                      {getStatusText(report.status)}
                    </span>
                  </div>
                  
                  {report.fileSize && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Dosya Boyutu:</span>
                      <span className="text-sm text-gray-900">{report.fileSize}</span>
                    </div>
                  )}
                  
                  {report.pages && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sayfa Sayısı:</span>
                      <span className="text-sm text-gray-900">{report.pages}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleViewReport(report)}
                    disabled={report.status !== 'completed'}
                    className="btn btn-outline w-full btn-sm"
                  >
                    {report.status === 'completed' ? 'Görüntüle' : 'Hazırlanıyor...'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </TeacherLayout>
  );
}

