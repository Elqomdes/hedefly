import { useState, useEffect } from 'react';
import Head from 'next/head';
import StudentLayout from '../../../components/layout/StudentLayout';
import { motion } from 'framer-motion';
import {
  TargetIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { studentsAPI } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function StudentGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchGoals();
  }, [currentPage, categoryFilter, priorityFilter, statusFilter, searchTerm]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getGoals({
        page: currentPage,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      });
      setGoals(response.data?.goals || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Goals fetch error:', error);
      toast.error('Hedefler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      not_started: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      on_hold: 'bg-yellow-100 text-yellow-800'
    };
    return statuses[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority) => {
    const priorities = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return priorities[priority] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      academic: AcademicCapIcon,
      behavioral: TargetIcon,
      social: TargetIcon,
      personal: TargetIcon,
      career: TargetIcon,
      other: TargetIcon
    };
    return icons[category] || TargetIcon;
  };

  const getStatusText = (status) => {
    const statuses = {
      not_started: 'Başlanmadı',
      in_progress: 'Devam Ediyor',
      completed: 'Tamamlandı',
      cancelled: 'İptal Edildi',
      on_hold: 'Beklemede'
    };
    return statuses[status] || status;
  };

  const getPriorityText = (priority) => {
    const priorities = {
      low: 'Düşük',
      medium: 'Orta',
      high: 'Yüksek',
      urgent: 'Acil'
    };
    return priorities[priority] || priority;
  };

  const getCategoryText = (category) => {
    const categories = {
      academic: 'Akademik',
      behavioral: 'Davranışsal',
      social: 'Sosyal',
      personal: 'Kişisel',
      career: 'Kariyer',
      other: 'Diğer'
    };
    return categories[category] || category;
  };

  const calculateProgress = (goal) => {
    if (goal.milestones && goal.milestones.length > 0) {
      const completedMilestones = goal.milestones.filter(milestone => milestone.completed).length;
      return Math.round((completedMilestones / goal.milestones.length) * 100);
    }
    return 0;
  };

  const isOverdue = (targetDate) => {
    return new Date(targetDate) < new Date() && new Date(targetDate).toDateString() !== new Date().toDateString();
  };

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || goal.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || goal.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || goal.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  return (
    <>
      <Head>
        <title>Hedeflerim - Hedefly</title>
      </Head>
      
      <StudentLayout>
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hedeflerim</h1>
              <p className="mt-1 text-sm text-gray-600">
                Öğretmenleriniz tarafından belirlenen hedefleri takip edin
              </p>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Hedef ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Kategoriler</option>
                <option value="academic">Akademik</option>
                <option value="behavioral">Davranışsal</option>
                <option value="social">Sosyal</option>
                <option value="personal">Kişisel</option>
                <option value="career">Kariyer</option>
                <option value="other">Diğer</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Öncelikler</option>
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
                <option value="urgent">Acil</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="not_started">Başlanmadı</option>
                <option value="in_progress">Devam Ediyor</option>
                <option value="completed">Tamamlandı</option>
                <option value="on_hold">Beklemede</option>
                <option value="cancelled">İptal Edildi</option>
              </select>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setPriorityFilter('all');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Temizle
              </button>
            </div>
          </motion.div>

          {/* Goals List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="card p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Hedefler yükleniyor...</p>
              </div>
            ) : filteredGoals.length === 0 ? (
              <div className="card p-8 text-center">
                <TargetIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Hedef bulunamadı</h3>
                <p className="text-gray-600">
                  {searchTerm || categoryFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all'
                    ? 'Arama kriterlerinize uygun hedef bulunamadı.'
                    : 'Henüz size atanmış bir hedef bulunmuyor.'
                  }
                </p>
              </div>
            ) : (
              filteredGoals.map((goal) => {
                const CategoryIcon = getCategoryIcon(goal.category);
                const progress = calculateProgress(goal);
                const overdue = isOverdue(goal.targetDate);
                
                return (
                  <motion.div
                    key={goal._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`card p-6 hover:shadow-lg transition-shadow ${overdue ? 'border-l-4 border-red-500' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CategoryIcon className="h-6 w-6 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(goal.status)}`}>
                            {getStatusText(goal.status)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(goal.priority)}`}>
                            {getPriorityText(goal.priority)}
                          </span>
                          {overdue && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Süresi Geçmiş
                            </span>
                          )}
                        </div>
                        
                        {goal.description && (
                          <p className="text-gray-600 mb-4">{goal.description}</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            <span>
                              Hedef Tarihi: {new Date(goal.targetDate).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <TargetIcon className="h-4 w-4 mr-2" />
                            <span>{getCategoryText(goal.category)}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <ChartBarIcon className="h-4 w-4 mr-2" />
                            <span>{goal.milestones?.length || 0} Kilometre Taşı</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {goal.milestones && goal.milestones.length > 0 && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>İlerleme</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Milestones */}
                        {goal.milestones && goal.milestones.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-900">Kilometre Taşları:</h4>
                            <div className="space-y-1">
                              {goal.milestones.map((milestone, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  {milestone.completed ? (
                                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <ClockIcon className="h-4 w-4 text-gray-400" />
                                  )}
                                  <span className={`text-sm ${milestone.completed ? 'text-green-600 line-through' : 'text-gray-600'}`}>
                                    {milestone.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {goal.tags && goal.tags.length > 0 && (
                          <div className="mt-4">
                            <div className="flex flex-wrap gap-2">
                              {goal.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Önceki
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm border rounded-lg ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sonraki
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </StudentLayout>
    </>
  );
}

