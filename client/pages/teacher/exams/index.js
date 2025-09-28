import { useState, useEffect } from 'react';
import Head from 'next/head';
import TeacherLayout from '../../../components/layout/TeacherLayout';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { examsAPI } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function TeacherExams() {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    type: 'quiz',
    subject: '',
    grade: '',
    duration: 60,
    questions: [],
    settings: {
      shuffleQuestions: false,
      shuffleOptions: false,
      showCorrectAnswers: true,
      showExplanations: true,
      allowReview: true,
      timeLimit: null,
      attempts: { max: 1 },
      password: '',
      proctoring: {
        enabled: false,
        settings: {
          blockCopyPaste: false,
          blockRightClick: false,
          fullScreenRequired: false,
          webcamRequired: false
        }
      }
    },
    schedule: {
      startDate: '',
      endDate: '',
      timezone: 'Europe/Istanbul'
    },
    assignedTo: [],
    tags: []
  });

  useEffect(() => {
    fetchExams();
    fetchStudents();
    fetchClasses();
  }, [currentPage, typeFilter, statusFilter, subjectFilter, searchTerm]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await examsAPI.getMyExams({
        page: currentPage,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        subject: subjectFilter !== 'all' ? subjectFilter : undefined,
        search: searchTerm || undefined
      });
      setExams(response.data.exams || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Exams fetch error:', error);
      toast.error('Sınavlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await examsAPI.getStudents();
      setStudents(response.data || []);
    } catch (error) {
      console.error('Students fetch error:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await examsAPI.getClasses();
      setClasses(response.data || []);
    } catch (error) {
      console.error('Classes fetch error:', error);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await examsAPI.create(newExam);
      toast.success('Sınav oluşturuldu');
      setShowCreateModal(false);
      setNewExam({
        title: '',
        description: '',
        type: 'quiz',
        subject: '',
        grade: '',
        duration: 60,
        questions: [],
        settings: {
          shuffleQuestions: false,
          shuffleOptions: false,
          showCorrectAnswers: true,
          showExplanations: true,
          allowReview: true,
          timeLimit: null,
          attempts: { max: 1 },
          password: '',
          proctoring: {
            enabled: false,
            settings: {
              blockCopyPaste: false,
              blockRightClick: false,
              fullScreenRequired: false,
              webcamRequired: false
            }
          }
        },
        schedule: {
          startDate: '',
          endDate: '',
          timezone: 'Europe/Istanbul'
        },
        assignedTo: [],
        tags: []
      });
      fetchExams();
    } catch (error) {
      console.error('Create exam error:', error);
      toast.error(error.response?.data?.message || 'Sınav oluşturulurken bir hata oluştu');
    }
  };

  const handlePublishExam = async (examId) => {
    try {
      await examsAPI.publish(examId);
      toast.success('Sınav yayınlandı');
      fetchExams();
    } catch (error) {
      console.error('Publish exam error:', error);
      toast.error('Sınav yayınlanırken bir hata oluştu');
    }
  };

  const handleArchiveExam = async (examId) => {
    try {
      await examsAPI.archive(examId);
      toast.success('Sınav arşivlendi');
      fetchExams();
    } catch (error) {
      console.error('Archive exam error:', error);
      toast.error('Sınav arşivlenirken bir hata oluştu');
    }
  };

  const handleDeleteExam = async (examId) => {
    if (window.confirm('Bu sınavı silmek istediğinizden emin misiniz?')) {
      try {
        await examsAPI.delete(examId);
        toast.success('Sınav silindi');
        fetchExams();
      } catch (error) {
        console.error('Delete exam error:', error);
        toast.error('Sınav silinirken bir hata oluştu');
      }
    }
  };

  const getTypeBadge = (type) => {
    const types = {
      quiz: { text: 'Quiz', color: 'bg-blue-100 text-blue-800' },
      midterm: { text: 'Ara Sınav', color: 'bg-green-100 text-green-800' },
      final: { text: 'Final', color: 'bg-red-100 text-red-800' },
      practice: { text: 'Deneme', color: 'bg-purple-100 text-purple-800' },
      diagnostic: { text: 'Tanı', color: 'bg-orange-100 text-orange-800' },
      other: { text: 'Diğer', color: 'bg-gray-100 text-gray-800' }
    };
    return types[type] || { text: type, color: 'bg-gray-100 text-gray-800' };
  };

  const getStatusBadge = (status) => {
    const statuses = {
      draft: { text: 'Taslak', color: 'bg-gray-100 text-gray-800' },
      published: { text: 'Yayınlandı', color: 'bg-green-100 text-green-800' },
      archived: { text: 'Arşivlendi', color: 'bg-yellow-100 text-yellow-800' },
      cancelled: { text: 'İptal', color: 'bg-red-100 text-red-800' }
    };
    return statuses[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchExams();
  };

  return (
    <>
      <Head>
        <title>Sınavlar - Hedefly</title>
        <meta name="description" content="Sınav yönetimi" />
      </Head>

      <TeacherLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sınavlar</h1>
              <p className="text-gray-600">Online sınavlar oluşturun ve yönetin</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Sınav Oluştur
            </button>
          </div>

          {/* Filters */}
          <div className="card p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Sınav ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10 w-full"
                  />
                </div>
              </form>
              
              <div className="flex gap-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">Tüm Tipler</option>
                  <option value="quiz">Quiz</option>
                  <option value="midterm">Ara Sınav</option>
                  <option value="final">Final</option>
                  <option value="practice">Deneme</option>
                  <option value="diagnostic">Tanı</option>
                  <option value="other">Diğer</option>
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="draft">Taslak</option>
                  <option value="published">Yayınlandı</option>
                  <option value="archived">Arşivlendi</option>
                  <option value="cancelled">İptal</option>
                </select>

                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">Tüm Dersler</option>
                  <option value="matematik">Matematik</option>
                  <option value="fizik">Fizik</option>
                  <option value="kimya">Kimya</option>
                  <option value="biyoloji">Biyoloji</option>
                  <option value="turkce">Türkçe</option>
                  <option value="tarih">Tarih</option>
                  <option value="cografya">Coğrafya</option>
                  <option value="felsefe">Felsefe</option>
                  <option value="ingilizce">İngilizce</option>
                </select>
              </div>
            </div>
          </div>

          {/* Exams List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : exams.length > 0 ? (
              exams.map((exam, index) => {
                const type = getTypeBadge(exam.type);
                const status = getStatusBadge(exam.status);
                return (
                  <motion.div
                    key={exam._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="card p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                          <span className={`badge ${type.color}`}>
                            {type.text}
                          </span>
                          <span className={`badge ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{exam.description}</p>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <AcademicCapIcon className="h-4 w-4 mr-1" />
                            {exam.subject} - {exam.grade}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {exam.duration} dakika
                          </div>
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-4 w-4 mr-1" />
                            {exam.questions.length} soru
                          </div>
                          <div className="flex items-center">
                            <ChartBarIcon className="h-4 w-4 mr-1" />
                            {exam.assignedTo.length} öğrenci
                          </div>
                        </div>

                        {/* Schedule */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Sınav Zamanı</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(exam.schedule.startDate).toLocaleDateString('tr-TR')} - {new Date(exam.schedule.endDate).toLocaleDateString('tr-TR')}
                          </p>
                        </div>

                        {/* Analytics */}
                        {exam.analytics && exam.analytics.totalAttempts > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">İstatistikler</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Ortalama Puan:</span>
                                <span className={`ml-1 font-semibold ${getGradeColor(exam.analytics.averageScore)}`}>
                                  {exam.analytics.averageScore.toFixed(1)}%
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Tamamlanma:</span>
                                <span className="ml-1 font-semibold text-gray-900">
                                  {exam.analytics.completionRate.toFixed(1)}%
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Toplam Deneme:</span>
                                <span className="ml-1 font-semibold text-gray-900">
                                  {exam.analytics.totalAttempts}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Ortalama Süre:</span>
                                <span className="ml-1 font-semibold text-gray-900">
                                  {Math.floor(exam.analytics.averageTime / 60)} dk
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {exam.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {exam.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="badge bg-gray-100 text-gray-600 text-xs">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button className="btn btn-outline btn-sm">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Görüntüle
                        </button>
                        
                        <button className="btn btn-outline btn-sm">
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Düzenle
                        </button>
                        
                        {exam.status === 'draft' && (
                          <button
                            onClick={() => handlePublishExam(exam._id)}
                            className="btn btn-success btn-sm"
                          >
                            <PlayIcon className="h-4 w-4 mr-1" />
                            Yayınla
                          </button>
                        )}
                        
                        {exam.status === 'published' && (
                          <button
                            onClick={() => handleArchiveExam(exam._id)}
                            className="btn btn-warning btn-sm"
                          >
                            <PauseIcon className="h-4 w-4 mr-1" />
                            Arşivle
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteExam(exam._id)}
                          className="btn btn-error btn-sm"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Sil
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <AcademicCapIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sınav bulunamadı</h3>
                <p className="text-gray-500">Henüz hiç sınavınız yok.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-outline btn-sm disabled:opacity-50"
                >
                  Önceki
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`btn btn-sm ${
                      currentPage === i + 1 ? 'btn-primary' : 'btn-outline'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-outline btn-sm disabled:opacity-50"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create Exam Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateModal(false)} />
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <form onSubmit={handleCreateExam}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Yeni Sınav Oluştur</h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sınav Başlığı
                          </label>
                          <input
                            type="text"
                            required
                            value={newExam.title}
                            onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                            className="input w-full"
                            placeholder="Sınav başlığını girin"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sınav Tipi
                          </label>
                          <select
                            required
                            value={newExam.type}
                            onChange={(e) => setNewExam({ ...newExam, type: e.target.value })}
                            className="input w-full"
                          >
                            <option value="quiz">Quiz</option>
                            <option value="midterm">Ara Sınav</option>
                            <option value="final">Final</option>
                            <option value="practice">Deneme</option>
                            <option value="diagnostic">Tanı</option>
                            <option value="other">Diğer</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Açıklama
                        </label>
                        <textarea
                          value={newExam.description}
                          onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                          rows={3}
                          className="input w-full"
                          placeholder="Sınav açıklamasını girin"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ders
                          </label>
                          <select
                            required
                            value={newExam.subject}
                            onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
                            className="input w-full"
                          >
                            <option value="">Ders seçin</option>
                            <option value="matematik">Matematik</option>
                            <option value="fizik">Fizik</option>
                            <option value="kimya">Kimya</option>
                            <option value="biyoloji">Biyoloji</option>
                            <option value="turkce">Türkçe</option>
                            <option value="tarih">Tarih</option>
                            <option value="cografya">Coğrafya</option>
                            <option value="felsefe">Felsefe</option>
                            <option value="ingilizce">İngilizce</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sınıf
                          </label>
                          <input
                            type="text"
                            required
                            value={newExam.grade}
                            onChange={(e) => setNewExam({ ...newExam, grade: e.target.value })}
                            className="input w-full"
                            placeholder="9. Sınıf"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Süre (dakika)
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={newExam.duration}
                            onChange={(e) => setNewExam({ ...newExam, duration: parseInt(e.target.value) })}
                            className="input w-full"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Başlangıç Tarihi
                          </label>
                          <input
                            type="datetime-local"
                            required
                            value={newExam.schedule.startDate}
                            onChange={(e) => setNewExam({
                              ...newExam,
                              schedule: { ...newExam.schedule, startDate: e.target.value }
                            })}
                            className="input w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bitiş Tarihi
                          </label>
                          <input
                            type="datetime-local"
                            required
                            value={newExam.schedule.endDate}
                            onChange={(e) => setNewExam({
                              ...newExam,
                              schedule: { ...newExam.schedule, endDate: e.target.value }
                            })}
                            className="input w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="btn btn-primary w-full sm:w-auto sm:ml-3"
                    >
                      Sınav Oluştur
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="btn btn-outline w-full sm:w-auto mt-3 sm:mt-0"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </TeacherLayout>
    </>
  );
}