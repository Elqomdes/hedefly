import { useState, useEffect } from 'react';
import Head from 'next/head';
import TeacherLayout from '../../../components/layout/TeacherLayout';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  AcademicCapIcon,
  TargetIcon
} from '@heroicons/react/24/outline';
import { plansAPI } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function TeacherPlans() {
  const [plans, setPlans] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [studentFilter, setStudentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newPlan, setNewPlan] = useState({
    studentId: '',
    type: 'daily',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    subjects: [],
    goals: [],
    tags: []
  });

  useEffect(() => {
    fetchPlans();
    fetchStudents();
  }, [currentPage, typeFilter, statusFilter, studentFilter, searchTerm]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await plansAPI.getMyPlans({
        page: currentPage,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        studentId: studentFilter !== 'all' ? studentFilter : undefined,
        search: searchTerm || undefined
      });
      setPlans(response.data.plans || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Plans fetch error:', error);
      toast.error('Planlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await plansAPI.getStudents();
      setStudents(response.data || []);
    } catch (error) {
      console.error('Students fetch error:', error);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      await plansAPI.create(newPlan);
      toast.success('Plan oluşturuldu');
      setShowCreateModal(false);
      setNewPlan({
        studentId: '',
        type: 'daily',
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        subjects: [],
        goals: [],
        tags: []
      });
      fetchPlans();
    } catch (error) {
      console.error('Create plan error:', error);
      toast.error(error.response?.data?.message || 'Plan oluşturulurken bir hata oluştu');
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Bu planı silmek istediğinizden emin misiniz?')) {
      try {
        await plansAPI.delete(planId);
        toast.success('Plan silindi');
        fetchPlans();
      } catch (error) {
        console.error('Delete plan error:', error);
        toast.error('Plan silinirken bir hata oluştu');
      }
    }
  };

  const handleDuplicatePlan = async (planId) => {
    try {
      await plansAPI.duplicate(planId, { templateName: `${newPlan.title} (Kopya)` });
      toast.success('Plan kopyalandı');
      fetchPlans();
    } catch (error) {
      console.error('Duplicate plan error:', error);
      toast.error('Plan kopyalanırken bir hata oluştu');
    }
  };

  const getTypeBadge = (type) => {
    const types = {
      daily: { text: 'Günlük', color: 'bg-blue-100 text-blue-800' },
      weekly: { text: 'Haftalık', color: 'bg-green-100 text-green-800' },
      monthly: { text: 'Aylık', color: 'bg-purple-100 text-purple-800' }
    };
    return types[type] || { text: type, color: 'bg-gray-100 text-gray-800' };
  };

  const getStatusBadge = (status) => {
    const statuses = {
      draft: { text: 'Taslak', color: 'bg-gray-100 text-gray-800' },
      active: { text: 'Aktif', color: 'bg-green-100 text-green-800' },
      completed: { text: 'Tamamlandı', color: 'bg-blue-100 text-blue-800' },
      cancelled: { text: 'İptal', color: 'bg-red-100 text-red-800' }
    };
    return statuses[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPlans();
  };

  return (
    <>
      <Head>
        <title>Planlar - Hedefly</title>
        <meta name="description" content="Öğrenci planları yönetimi" />
      </Head>

      <TeacherLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Öğrenci Planları</h1>
              <p className="text-gray-600">Günlük, haftalık ve aylık planlar oluşturun</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Plan Oluştur
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
                    placeholder="Plan ara..."
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
                  <option value="daily">Günlük</option>
                  <option value="weekly">Haftalık</option>
                  <option value="monthly">Aylık</option>
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="draft">Taslak</option>
                  <option value="active">Aktif</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal</option>
                </select>

                <select
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">Tüm Öğrenciler</option>
                  {students.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Plans List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : plans.length > 0 ? (
              plans.map((plan, index) => {
                const type = getTypeBadge(plan.type);
                const status = getStatusBadge(plan.status);
                return (
                  <motion.div
                    key={plan._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="card p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                          <span className={`badge ${type.color}`}>
                            {type.text}
                          </span>
                          <span className={`badge ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{plan.description}</p>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <AcademicCapIcon className="h-4 w-4 mr-1" />
                            {plan.student.firstName} {plan.student.lastName}
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {new Date(plan.startDate).toLocaleDateString('tr-TR')} - {new Date(plan.endDate).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="flex items-center">
                            <TargetIcon className="h-4 w-4 mr-1" />
                            {plan.goals.length} hedef
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>İlerleme</span>
                            <span>{plan.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(plan.progress)}`}
                              style={{ width: `${plan.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Subjects Preview */}
                        {plan.subjects.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Dersler</h4>
                            <div className="flex flex-wrap gap-2">
                              {plan.subjects.slice(0, 3).map((subject, subjectIndex) => (
                                <span key={subjectIndex} className="badge bg-blue-100 text-blue-800">
                                  {subject.name} ({subject.topics.length} konu)
                                </span>
                              ))}
                              {plan.subjects.length > 3 && (
                                <span className="badge bg-gray-100 text-gray-800">
                                  +{plan.subjects.length - 3} daha
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {plan.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {plan.tags.map((tag, tagIndex) => (
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
                        <button
                          onClick={() => handleDuplicatePlan(plan._id)}
                          className="btn btn-outline btn-sm"
                        >
                          <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                          Kopyala
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan._id)}
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
                <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Plan bulunamadı</h3>
                <p className="text-gray-500">Henüz hiç planınız yok.</p>
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

        {/* Create Plan Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateModal(false)} />
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <form onSubmit={handleCreatePlan}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Yeni Plan Oluştur</h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Öğrenci
                          </label>
                          <select
                            required
                            value={newPlan.studentId}
                            onChange={(e) => setNewPlan({ ...newPlan, studentId: e.target.value })}
                            className="input w-full"
                          >
                            <option value="">Öğrenci seçin</option>
                            {students.map(student => (
                              <option key={student._id} value={student._id}>
                                {student.firstName} {student.lastName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Plan Tipi
                          </label>
                          <select
                            required
                            value={newPlan.type}
                            onChange={(e) => setNewPlan({ ...newPlan, type: e.target.value })}
                            className="input w-full"
                          >
                            <option value="daily">Günlük</option>
                            <option value="weekly">Haftalık</option>
                            <option value="monthly">Aylık</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Plan Başlığı
                        </label>
                        <input
                          type="text"
                          required
                          value={newPlan.title}
                          onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                          className="input w-full"
                          placeholder="Plan başlığını girin"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Açıklama
                        </label>
                        <textarea
                          value={newPlan.description}
                          onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                          rows={3}
                          className="input w-full"
                          placeholder="Plan açıklamasını girin"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Başlangıç Tarihi
                          </label>
                          <input
                            type="date"
                            required
                            value={newPlan.startDate}
                            onChange={(e) => setNewPlan({ ...newPlan, startDate: e.target.value })}
                            className="input w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bitiş Tarihi
                          </label>
                          <input
                            type="date"
                            required
                            value={newPlan.endDate}
                            onChange={(e) => setNewPlan({ ...newPlan, endDate: e.target.value })}
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
                      Plan Oluştur
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

