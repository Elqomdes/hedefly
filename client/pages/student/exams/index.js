import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import StudentLayout from '../../components/layout/StudentLayout';
import { motion } from 'framer-motion';
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { studentsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function StudentExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getExams();
      setExams(response.data || []);
    } catch (error) {
      console.error('Exams fetch error:', error);
      toast.error('Sınavlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const examDate = new Date(exam.examDate);
    const hasResult = exam.results && exam.results.some(r => r.student === exam.student);
    const isUpcoming = now < examDate;
    const isActive = now >= examDate && !hasResult;

    if (hasResult) {
      return { 
        text: 'Tamamlandı', 
        color: 'text-green-600', 
        bgColor: 'bg-green-100',
        icon: CheckCircleIcon,
        canTake: false
      };
    } else if (isActive) {
      return { 
        text: 'Aktif', 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-100',
        icon: PlayIcon,
        canTake: true
      };
    } else if (isUpcoming) {
      return { 
        text: 'Yaklaşan', 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-100',
        icon: ClockIcon,
        canTake: false
      };
    } else {
      return { 
        text: 'Bilinmiyor', 
        color: 'text-gray-600', 
        bgColor: 'bg-gray-100',
        icon: ExclamationTriangleIcon,
        canTake: false
      };
    }
  };

  const getTypeBadge = (type) => {
    const types = {
      quiz: { text: 'Quiz', color: 'bg-purple-100 text-purple-800' },
      exam: { text: 'Sınav', color: 'bg-blue-100 text-blue-800' },
      practice: { text: 'Deneme', color: 'bg-green-100 text-green-800' }
    };
    return types[type] || { text: type, color: 'bg-gray-100 text-gray-800' };
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = 
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = getExamStatus(exam);
    const matchesStatus = !filterStatus || 
      (filterStatus === 'completed' && status.text === 'Tamamlandı') ||
      (filterStatus === 'active' && status.text === 'Aktif') ||
      (filterStatus === 'upcoming' && status.text === 'Yaklaşan');
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Sınavlarım - Hedefly</title>
        <meta name="description" content="Öğrenci sınavları - Hedefly" />
      </Head>

      <StudentLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sınavlarım</h1>
            <p className="text-gray-600">Sınavlarınıza katılın ve sonuçlarınızı görün</p>
          </div>

          {/* Filters */}
          <div className="card p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Sınav ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input w-full pl-10"
                />
              </div>
              
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Tüm Durumlar</option>
                  <option value="upcoming">Yaklaşan</option>
                  <option value="active">Aktif</option>
                  <option value="completed">Tamamlandı</option>
                </select>
              </div>

              <div className="flex space-x-2">
                <button className="btn btn-outline btn-md">
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  Filtrele
                </button>
              </div>
            </div>
          </div>

          {/* Exams List */}
          {filteredExams.length > 0 ? (
            <div className="space-y-4">
              {filteredExams.map((exam, index) => {
                const status = getExamStatus(exam);
                const type = getTypeBadge(exam.type);
                const StatusIcon = status.icon;
                
                return (
                  <motion.div
                    key={exam._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="card p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                          <ClipboardDocumentListIcon className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {exam.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {exam.subject} • {exam.teacher?.firstName} {exam.teacher?.lastName}
                          </p>
                          {exam.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              {exam.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`badge ${type.color}`}>
                          {type.text}
                        </span>
                        <span className={`badge ${status.bgColor} ${status.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {status.text}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Sınav Tarihi: {new Date(exam.examDate).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Süre: {exam.duration} dakika</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <ChartBarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{exam.questions?.length || 0} soru</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <ChartBarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Toplam: {exam.totalPoints} puan</span>
                      </div>
                    </div>

                    {/* Results */}
                    {status.text === 'Tamamlandı' && exam.results && exam.results.length > 0 && (
                      <div className="mb-4 p-4 bg-green-50 rounded-lg">
                        <h4 className="text-sm font-medium text-green-900 mb-2">Sonuçlarınız:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <span className="text-sm text-green-700">Puan: </span>
                            <span className="font-semibold text-green-900">
                              {exam.results[0].score} / {exam.totalPoints}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-green-700">Yüzde: </span>
                            <span className="font-semibold text-green-900">
                              %{Math.round(exam.results[0].percentage)}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-green-700">Süre: </span>
                            <span className="font-semibold text-green-900">
                              {exam.results[0].timeSpent || 'Bilinmiyor'} dakika
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button className="btn btn-outline btn-sm">
                        Detayları Gör
                      </button>
                      {status.canTake ? (
                        <Link href={`/student/exams/${exam._id}/take`}>
                          <button className="btn btn-primary btn-sm">
                            <PlayIcon className="h-4 w-4 mr-2" />
                            Sınava Katıl
                          </button>
                        </Link>
                      ) : status.text === 'Tamamlandı' ? (
                        <Link href={`/student/exams/${exam._id}/results`}>
                          <button className="btn btn-success btn-sm">
                            <ChartBarIcon className="h-4 w-4 mr-2" />
                            Sonuçları Gör
                          </button>
                        </Link>
                      ) : (
                        <button className="btn btn-outline btn-sm" disabled>
                          {status.text === 'Yaklaşan' ? 'Henüz Başlamadı' : 'Sınav Bitti'}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <ClipboardDocumentListIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterStatus ? 'Sınav bulunamadı' : 'Henüz sınav yok'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus 
                  ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                  : 'Öğretmeniniz size sınav verdiğinde burada görünecek'
                }
              </p>
            </motion.div>
          )}

          {/* Stats */}
          {exams.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{exams.length}</div>
                  <div className="text-sm text-gray-500">Toplam Sınav</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {exams.filter(e => {
                      const status = getExamStatus(e);
                      return status.text === 'Tamamlandı';
                    }).length}
                  </div>
                  <div className="text-sm text-gray-500">Tamamlandı</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {exams.filter(e => {
                      const status = getExamStatus(e);
                      return status.text === 'Yaklaşan';
                    }).length}
                  </div>
                  <div className="text-sm text-gray-500">Yaklaşan</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {exams.filter(e => {
                      const status = getExamStatus(e);
                      return status.text === 'Aktif';
                    }).length}
                  </div>
                  <div className="text-sm text-gray-500">Aktif</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </StudentLayout>
    </>
  );
}

