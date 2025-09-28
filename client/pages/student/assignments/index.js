import { useState, useEffect } from 'react';
import Head from 'next/head';
import StudentLayout from '../../../components/layout/StudentLayout';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  EyeIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { studentsAPI } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getAssignments();
      setAssignments(response.data || []);
    } catch (error) {
      console.error('Assignments fetch error:', error);
      toast.error('Ödevler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatus = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isOverdue = now > dueDate;
    const hasSubmission = assignment.submissions && assignment.submissions.some(s => s.student === assignment.student);
    const isGraded = assignment.submissions && assignment.submissions.some(s => s.student === assignment.student && s.isGraded);

    if (isGraded) {
      return { 
        text: 'Değerlendirildi', 
        color: 'text-green-600', 
        bgColor: 'bg-green-100',
        icon: CheckCircleIcon 
      };
    } else if (hasSubmission) {
      return { 
        text: 'Teslim Edildi', 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-100',
        icon: CheckCircleIcon 
      };
    } else if (isOverdue) {
      return { 
        text: 'Süresi Geçti', 
        color: 'text-red-600', 
        bgColor: 'bg-red-100',
        icon: ExclamationTriangleIcon 
      };
    } else {
      return { 
        text: 'Bekliyor', 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-100',
        icon: ClockIcon 
      };
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = getAssignmentStatus(assignment);
    const matchesStatus = !filterStatus || 
      (filterStatus === 'completed' && status.text === 'Değerlendirildi') ||
      (filterStatus === 'submitted' && status.text === 'Teslim Edildi') ||
      (filterStatus === 'pending' && status.text === 'Bekliyor') ||
      (filterStatus === 'overdue' && status.text === 'Süresi Geçti');
    
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
        <title>Ödevlerim - Hedefly</title>
        <meta name="description" content="Öğrenci ödevleri - Hedefly" />
      </Head>

      <StudentLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ödevlerim</h1>
            <p className="text-gray-600">Ödevlerinizi görüntüleyin ve teslim edin</p>
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
                  placeholder="Ödev ara..."
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
                  <option value="pending">Bekleyen</option>
                  <option value="submitted">Teslim Edildi</option>
                  <option value="completed">Değerlendirildi</option>
                  <option value="overdue">Süresi Geçti</option>
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

          {/* Assignments List */}
          {filteredAssignments.length > 0 ? (
            <div className="space-y-4">
              {filteredAssignments.map((assignment, index) => {
                const status = getAssignmentStatus(assignment);
                const StatusIcon = status.icon;
                const isOverdue = status.text === 'Süresi Geçti';
                const canSubmit = !assignment.submissions?.some(s => s.student === assignment.student);
                
                return (
                  <motion.div
                    key={assignment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`card p-6 ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <BookOpenIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {assignment.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {assignment.subject} • {assignment.teacher?.firstName} {assignment.teacher?.lastName}
                          </p>
                          {assignment.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              {assignment.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`badge ${status.bgColor} ${status.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {status.text}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Son Tarih: {new Date(assignment.dueDate).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{assignment.attachments?.length || 0} dosya</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <LinkIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{assignment.videoLinks?.length || 0} video</span>
                      </div>
                    </div>

                    {/* Attachments */}
                    {assignment.attachments && assignment.attachments.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Dosyalar:</h4>
                        <div className="flex flex-wrap gap-2">
                          {assignment.attachments.map((attachment, idx) => (
                            <a
                              key={idx}
                              href={`/api/assignments/${assignment._id}/download/${attachment._id}`}
                              className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                            >
                              <DocumentTextIcon className="h-4 w-4 mr-1" />
                              {attachment.originalName}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Video Links */}
                    {assignment.videoLinks && assignment.videoLinks.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Video Linkleri:</h4>
                        <div className="space-y-2">
                          {assignment.videoLinks.map((video, idx) => (
                            <div key={idx} className="flex items-center">
                              <LinkIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <a
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                {video.title}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button className="btn btn-outline btn-sm">
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Detayları Gör
                      </button>
                      {canSubmit && !isOverdue && (
                        <button className="btn btn-primary btn-sm">
                          Teslim Et
                        </button>
                      )}
                      {isOverdue && (
                        <button className="btn btn-error btn-sm" disabled>
                          Süresi Geçti
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
              <BookOpenIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterStatus ? 'Ödev bulunamadı' : 'Henüz ödev yok'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus 
                  ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                  : 'Öğretmeniniz size ödev verdiğinde burada görünecek'
                }
              </p>
            </motion.div>
          )}

          {/* Stats */}
          {assignments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{assignments.length}</div>
                  <div className="text-sm text-gray-500">Toplam Ödev</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {assignments.filter(a => {
                      const status = getAssignmentStatus(a);
                      return status.text === 'Değerlendirildi';
                    }).length}
                  </div>
                  <div className="text-sm text-gray-500">Değerlendirildi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {assignments.filter(a => {
                      const status = getAssignmentStatus(a);
                      return status.text === 'Bekliyor';
                    }).length}
                  </div>
                  <div className="text-sm text-gray-500">Bekleyen</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {assignments.filter(a => {
                      const status = getAssignmentStatus(a);
                      return status.text === 'Süresi Geçti';
                    }).length}
                  </div>
                  <div className="text-sm text-gray-500">Süresi Geçti</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </StudentLayout>
    </>
  );
}

