import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import TeacherLayout from '../../../components/layout/TeacherLayout';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { assignmentsAPI, classesAPI } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAssignments();
    fetchClasses();
  }, [currentPage, filterSubject, filterStatus]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        subject: filterSubject || undefined,
        status: filterStatus || undefined
      };
      const response = await assignmentsAPI.getAll(params);
      setAssignments(response.data?.assignments || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Assignments fetch error:', error);
      toast.error('Ödevler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classesAPI.getAll();
      setClasses(response.data?.classes || []);
    } catch (error) {
      console.error('Classes fetch error:', error);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const subjects = [...new Set(assignments.map(a => a.subject).filter(Boolean))];

  const getStatusBadge = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isOverdue = now > dueDate;
    const hasSubmissions = assignment.submissions && assignment.submissions.length > 0;
    const isGraded = assignment.submissions && assignment.submissions.some(s => s.isGraded);

    if (isOverdue && !hasSubmissions) {
      return { text: 'Süresi Geçti', color: 'bg-red-100 text-red-800' };
    } else if (isOverdue && hasSubmissions && !isGraded) {
      return { text: 'Değerlendirilmeli', color: 'bg-yellow-100 text-yellow-800' };
    } else if (isGraded) {
      return { text: 'Değerlendirildi', color: 'bg-green-100 text-green-800' };
    } else {
      return { text: 'Aktif', color: 'bg-blue-100 text-blue-800' };
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Ödevler - Hedefly</title>
        <meta name="description" content="Ödev yönetimi - Hedefly" />
      </Head>

      <TeacherLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ödevler</h1>
              <p className="text-gray-600">Ödevlerinizi oluşturun, yönetin ve değerlendirin</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link href="/teacher/assignments/create">
                <button className="btn btn-primary btn-md group">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Yeni Ödev Oluştur
                </button>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Tüm Dersler</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Tüm Durumlar</option>
                  <option value="active">Aktif</option>
                  <option value="graded">Değerlendirildi</option>
                  <option value="ungraded">Değerlendirilmeli</option>
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

          {/* Assignments Grid */}
          {filteredAssignments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssignments.map((assignment, index) => {
                const status = getStatusBadge(assignment);
                return (
                  <motion.div
                    key={assignment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="card p-6 hover-lift"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <BookOpenIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {assignment.title}
                          </h3>
                          <p className="text-sm text-gray-500">{assignment.subject}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Link href={`/teacher/assignments/${assignment._id}`}>
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </Link>
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {assignment.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {assignment.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Son Tarih: {new Date(assignment.dueDate).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{assignment.students?.length || 0} öğrenci</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{assignment.attachments?.length || 0} dosya</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className={`badge ${status.color}`}>
                        {status.text}
                      </span>
                      <span className="text-xs text-gray-500">
                        {assignment.type === 'class' ? 'Sınıf Ödevi' : 'Bireysel'}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <Link href={`/teacher/assignments/${assignment._id}`} className="flex-1">
                        <button className="btn btn-outline w-full btn-sm">
                          Detayları Gör
                        </button>
                      </Link>
                      <Link href={`/teacher/assignments/${assignment._id}/grade`} className="flex-1">
                        <button className="btn btn-primary w-full btn-sm">
                          Değerlendir
                        </button>
                      </Link>
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
                {searchTerm || filterSubject || filterStatus ? 'Ödev bulunamadı' : 'Henüz ödev yok'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterSubject || filterStatus 
                  ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                  : 'İlk ödevinizi oluşturarak başlayın'
                }
              </p>
              {!searchTerm && !filterSubject && !filterStatus && (
                <Link href="/teacher/assignments/create">
                  <button className="btn btn-primary btn-md group">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    İlk Ödevi Oluştur
                  </button>
                </Link>
              )}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex justify-center"
            >
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn btn-outline btn-sm disabled:opacity-50"
                >
                  Sonraki
                </button>
              </div>
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
                    {assignments.filter(a => a.submissions?.some(s => s.isGraded)).length}
                  </div>
                  <div className="text-sm text-gray-500">Değerlendirildi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {assignments.filter(a => {
                      const now = new Date();
                      const dueDate = new Date(a.dueDate);
                      return now > dueDate && a.submissions?.some(s => !s.isGraded);
                    }).length}
                  </div>
                  <div className="text-sm text-gray-500">Değerlendirilmeli</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {subjects.length}
                  </div>
                  <div className="text-sm text-gray-500">Farklı Ders</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </TeacherLayout>
    </>
  );
}

