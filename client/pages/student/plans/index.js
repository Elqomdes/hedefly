import { useState, useEffect } from 'react';
import Head from 'next/head';
import StudentLayout from '../../../components/layout/StudentLayout';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  AcademicCapIcon,
  TargetIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { studentsAPI } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function StudentPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPlans();
  }, [currentPage, typeFilter, statusFilter, searchTerm]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getPlans({
        page: currentPage,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      });
      setPlans(response.data?.plans || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Plans fetch error:', error);
      toast.error('Planlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      paused: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return statuses[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type) => {
    const icons = {
      daily: CalendarIcon,
      weekly: CalendarIcon,
      monthly: CalendarIcon
    };
    return icons[type] || CalendarIcon;
  };

  const calculateProgress = (plan) => {
    const totalTasks = plan.subjects.reduce((sum, subject) => sum + subject.topics.length, 0);
    const completedTasks = plan.subjects.reduce((sum, subject) => 
      sum + subject.topics.filter(topic => topic.completed).length, 0
    );
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || plan.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <>
      <Head>
        <title>Planlarım - Hedefly</title>
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
              <h1 className="text-2xl font-bold text-gray-900">Planlarım</h1>
              <p className="mt-1 text-sm text-gray-600">
                Öğretmenleriniz tarafından oluşturulan planları takip edin
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Plan ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Planlar</option>
                <option value="daily">Günlük</option>
                <option value="weekly">Haftalık</option>
                <option value="monthly">Aylık</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="completed">Tamamlandı</option>
                <option value="paused">Duraklatıldı</option>
                <option value="cancelled">İptal Edildi</option>
              </select>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Temizle
              </button>
            </div>
          </motion.div>

          {/* Plans List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="card p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Planlar yükleniyor...</p>
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="card p-8 text-center">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Plan bulunamadı</h3>
                <p className="text-gray-600">
                  {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Arama kriterlerinize uygun plan bulunamadı.'
                    : 'Henüz size atanmış bir plan bulunmuyor.'
                  }
                </p>
              </div>
            ) : (
              filteredPlans.map((plan) => {
                const TypeIcon = getTypeIcon(plan.type);
                const progress = calculateProgress(plan);
                
                return (
                  <motion.div
                    key={plan._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <TypeIcon className="h-6 w-6 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(plan.status)}`}>
                            {plan.status === 'active' ? 'Aktif' : 
                             plan.status === 'completed' ? 'Tamamlandı' :
                             plan.status === 'paused' ? 'Duraklatıldı' : 'İptal Edildi'}
                          </span>
                        </div>
                        
                        {plan.description && (
                          <p className="text-gray-600 mb-4">{plan.description}</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            <span>
                              {new Date(plan.startDate).toLocaleDateString('tr-TR')} - {new Date(plan.endDate).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <TargetIcon className="h-4 w-4 mr-2" />
                            <span>{plan.goals?.length || 0} Hedef</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <AcademicCapIcon className="h-4 w-4 mr-2" />
                            <span>{plan.subjects?.length || 0} Ders</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
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

                        {/* Subjects */}
                        {plan.subjects && plan.subjects.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-900">Dersler:</h4>
                            <div className="flex flex-wrap gap-2">
                              {plan.subjects.map((subject, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                >
                                  {subject.name}
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

