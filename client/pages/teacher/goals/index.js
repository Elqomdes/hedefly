import { useState, useEffect } from 'react';
import Head from 'next/head';
import TeacherLayout from '../../../components/layout/TeacherLayout';
import { motion } from 'framer-motion';
import {
  TargetIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { goalsAPI } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function TeacherGoals() {
  const [goals, setGoals] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [studentFilter, setStudentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newGoal, setNewGoal] = useState({
    studentId: '',
    title: '',
    description: '',
    category: 'academic',
    priority: 'medium',
    targetDate: '',
    milestones: [],
    metrics: [],
    tags: []
  });

  useEffect(() => {
    fetchGoals();
    fetchStudents();
  }, [currentPage, categoryFilter, priorityFilter, statusFilter, studentFilter, searchTerm]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await goalsAPI.getMyGoals({
        page: currentPage,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        studentId: studentFilter !== 'all' ? studentFilter : undefined,
        search: searchTerm || undefined
      });
      setGoals(response.data.goals || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Goals fetch error:', error);
      toast.error('Hedefler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await goalsAPI.getStudents();
      setStudents(response.data || []);
    } catch (error) {
      console.error('Students fetch error:', error);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await goalsAPI.create(newGoal);
      toast.success('Hedef oluşturuldu');
      setShowCreateModal(false);
      setNewGoal({
        studentId: '',
        title: '',
        description: '',
        category: 'academic',
        priority: 'medium',
        targetDate: '',
        milestones: [],
        metrics: [],
        tags: []
      });
      fetchGoals();
    } catch (error) {
      console.error('Create goal error:', error);
      toast.error(error.response?.data?.message || 'Hedef oluşturulurken bir hata oluştu');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('Bu hedefi silmek istediğinizden emin misiniz?')) {
      try {
        await goalsAPI.delete(goalId);
        toast.success('Hedef silindi');
        fetchGoals();
      } catch (error) {
        console.error('Delete goal error:', error);
        toast.error('Hedef silinirken bir hata oluştu');
      }
    }
  };

  const getCategoryBadge = (category) => {
    const categories = {
      academic: { text: 'Akademik', color: 'bg-blue-100 text-blue-800' },
      behavioral: { text: 'Davranışsal', color: 'bg-green-100 text-green-800' },
      social: { text: 'Sosyal', color: 'bg-purple-100 text-purple-800' },
      personal: { text: 'Kişisel', color: 'bg-orange-100 text-orange-800' },
      career: { text: 'Kariyer', color: 'bg-indigo-100 text-indigo-800' },
      other: { text: 'Diğer', color: 'bg-gray-100 text-gray-800' }
    };
    return categories[category] || { text: category, color: 'bg-gray-100 text-gray-800' };
  };

  const getPriorityBadge = (priority) => {
    const priorities = {
      low: { text: 'Düşük', color: 'bg-gray-100 text-gray-800', icon: ClockIcon },
      medium: { text: 'Orta', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      high: { text: 'Yüksek', color: 'bg-orange-100 text-orange-800', icon: ExclamationTriangleIcon },
      urgent: { text: 'Acil', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon }
    };
    return priorities[priority] || { text: priority, color: 'bg-gray-100 text-gray-800', icon: ClockIcon };
  };

  const getStatusBadge = (status) => {
    const statuses = {
      not_started: { text: 'Başlanmadı', color: 'bg-gray-100 text-gray-800' },
      in_progress: { text: 'Devam Ediyor', color: 'bg-blue-100 text-blue-800' },
      completed: { text: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
      cancelled: { text: 'İptal', color: 'bg-red-100 text-red-800' },
      on_hold: { text: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' }
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
    fetchGoals();
  };

  return (
    <>
      <Head>
        <title>Hedefler - Hedefly</title>
        <meta name="description" content="Öğrenci hedefleri yönetimi" />
      </Head>

      <TeacherLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Öğrenci Hedefleri</h1>
              <p className="text-gray-600">Akademik ve kişisel hedefler belirleyin</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Hedef Oluştur
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
                    placeholder="Hedef ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10 w-full"
                  />
                </div>
              </form>
              
              <div className="flex gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">Tüm Kategoriler</option>
                  <option value="academic">Akademik</option>
                  <option value="behavioral">Davranışsal</option>
                  <option value="social">Sosyal</option>
                  <option value="personal">Kişisel</option>
                  <option value="career">Kariyer</option>
                  <option value="other">Diğer</option>
                </select>
                
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">Tüm Öncelikler</option>
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                  <option value="urgent">Acil</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="not_started">Başlanmadı</option>
                  <option value="in_progress">Devam Ediyor</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal</option>
                  <option value="on_hold">Beklemede</option>
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

          {/* Goals List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : goals.length > 0 ? (
              goals.map((goal, index) => {
                const category = getCategoryBadge(goal.category);
                const priority = getPriorityBadge(goal.priority);
                const status = getStatusBadge(goal.status);
                const PriorityIcon = priority.icon;
                return (
                  <motion.div
                    key={goal._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="card p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                          <span className={`badge ${category.color}`}>
                            {category.text}
                          </span>
                          <span className={`badge ${priority.color}`}>
                            <PriorityIcon className="h-4 w-4 mr-1" />
                            {priority.text}
                          </span>
                          <span className={`badge ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{goal.description}</p>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <AcademicCapIcon className="h-4 w-4 mr-1" />
                            {goal.student.firstName} {goal.student.lastName}
                          </div>
                          <div className="flex items-center">
                            <TargetIcon className="h-4 w-4 mr-1" />
                            {new Date(goal.targetDate).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="flex items-center">
                            <ChartBarIcon className="h-4 w-4 mr-1" />
                            {goal.milestones.length} kilometre taşı
                          </div>
                          <div className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            {goal.sharedWith.length} paylaşım
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>İlerleme</span>
                            <span>{goal.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(goal.progress)}`}
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Milestones Preview */}
                        {goal.milestones.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Kilometre Taşları</h4>
                            <div className="space-y-2">
                              {goal.milestones.slice(0, 3).map((milestone, milestoneIndex) => (
                                <div key={milestoneIndex} className="flex items-center gap-2">
                                  {milestone.completed ? (
                                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <ClockIcon className="h-4 w-4 text-gray-400" />
                                  )}
                                  <span className={`text-sm ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                    {milestone.title}
                                  </span>
                                </div>
                              ))}
                              {goal.milestones.length > 3 && (
                                <span className="text-sm text-gray-500">
                                  +{goal.milestones.length - 3} daha
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {goal.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {goal.tags.map((tag, tagIndex) => (
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
                        <button className="btn btn-outline btn-sm">
                          <ShareIcon className="h-4 w-4 mr-1" />
                          Paylaş
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal._id)}
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
                <TargetIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Hedef bulunamadı</h3>
                <p className="text-gray-500">Henüz hiç hedefiniz yok.</p>
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

        {/* Create Goal Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateModal(false)} />
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <form onSubmit={handleCreateGoal}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Yeni Hedef Oluştur</h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Öğrenci
                          </label>
                          <select
                            required
                            value={newGoal.studentId}
                            onChange={(e) => setNewGoal({ ...newGoal, studentId: e.target.value })}
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
                            Kategori
                          </label>
                          <select
                            required
                            value={newGoal.category}
                            onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                            className="input w-full"
                          >
                            <option value="academic">Akademik</option>
                            <option value="behavioral">Davranışsal</option>
                            <option value="social">Sosyal</option>
                            <option value="personal">Kişisel</option>
                            <option value="career">Kariyer</option>
                            <option value="other">Diğer</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hedef Başlığı
                        </label>
                        <input
                          type="text"
                          required
                          value={newGoal.title}
                          onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                          className="input w-full"
                          placeholder="Hedef başlığını girin"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Açıklama
                        </label>
                        <textarea
                          value={newGoal.description}
                          onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                          rows={3}
                          className="input w-full"
                          placeholder="Hedef açıklamasını girin"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Öncelik
                          </label>
                          <select
                            required
                            value={newGoal.priority}
                            onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                            className="input w-full"
                          >
                            <option value="low">Düşük</option>
                            <option value="medium">Orta</option>
                            <option value="high">Yüksek</option>
                            <option value="urgent">Acil</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hedef Tarihi
                          </label>
                          <input
                            type="date"
                            required
                            value={newGoal.targetDate}
                            onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
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
                      Hedef Oluştur
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

