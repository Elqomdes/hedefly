import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import StudentLayout from '../../components/layout/StudentLayout';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { studentsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState({
    recentAssignments: [],
    recentExams: [],
    activePlans: [],
    statistics: {
      totalAssignments: 0,
      completedAssignments: 0,
      assignmentCompletionRate: 0,
      totalExams: 0,
      completedExams: 0,
      examCompletionRate: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getDashboard();
      setDashboardData(response.data || {
        recentAssignments: [],
        recentExams: [],
        activePlans: [],
        statistics: {
          totalAssignments: 0,
          completedAssignments: 0,
          assignmentCompletionRate: 0,
          totalExams: 0,
          completedExams: 0,
          examCompletionRate: 0
        }
      });
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      toast.error('Dashboard verileri yüklenirken bir hata oluştu');
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
      return { text: 'Değerlendirildi', color: 'text-green-600', icon: CheckCircleIcon };
    } else if (hasSubmission) {
      return { text: 'Teslim Edildi', color: 'text-blue-600', icon: CheckCircleIcon };
    } else if (isOverdue) {
      return { text: 'Süresi Geçti', color: 'text-red-600', icon: ExclamationTriangleIcon };
    } else {
      return { text: 'Bekliyor', color: 'text-yellow-600', icon: ClockIcon };
    }
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const examStartDate = new Date(exam.schedule?.startDate);
    const examEndDate = new Date(exam.schedule?.endDate);
    const hasResult = exam.results && exam.results.some(r => r.student === exam.student);

    if (hasResult) {
      return { text: 'Tamamlandı', color: 'text-green-600', icon: CheckCircleIcon };
    } else if (now >= examStartDate && now <= examEndDate) {
      return { text: 'Aktif', color: 'text-blue-600', icon: ClockIcon };
    } else if (now < examStartDate) {
      return { text: 'Yaklaşan', color: 'text-yellow-600', icon: ClockIcon };
    } else {
      return { text: 'Süresi Geçti', color: 'text-red-600', icon: ExclamationTriangleIcon };
    }
  };

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
        <title>Dashboard - Hedefly</title>
        <meta name="description" content="Öğrenci dashboard - Hedefly" />
      </Head>

      <StudentLayout>
        <div className="space-y-4 sm:space-y-6 w-full max-w-full">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Hoş geldiniz! İşte güncel durumunuz.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <BookOpenIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Ödev</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.statistics.totalAssignments}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-green-600">
                    {dashboardData.statistics.assignmentCompletionRate}%
                  </span>
                  <span className="text-sm text-gray-500 ml-2">tamamlandı</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card p-6"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tamamlanan Ödev</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.statistics.completedAssignments}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="card p-6"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Sınav</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.statistics.totalExams}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-green-600">
                    {dashboardData.statistics.examCompletionRate}%
                  </span>
                  <span className="text-sm text-gray-500 ml-2">tamamlandı</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="card p-6"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-orange-100">
                  <ChartBarIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aktif Plan</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.activePlans.length}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Assignments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Son Ödevler</h3>
                <Link href="/student/assignments" className="text-sm text-blue-600 hover:text-blue-500">
                  Tümünü Gör
                </Link>
              </div>
              
              <div className="space-y-4">
                {dashboardData.recentAssignments.length > 0 ? (
                  dashboardData.recentAssignments.map((assignment, index) => {
                    const status = getAssignmentStatus(assignment);
                    const StatusIcon = status.icon;
                    return (
                      <div key={assignment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <BookOpenIcon className="h-5 w-5 text-blue-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                            <p className="text-xs text-gray-500">
                              {assignment.subject} • {new Date(assignment.dueDate).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`h-4 w-4 ${status.color}`} />
                          <span className={`text-xs ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz ödev yok</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Exams */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Son Sınavlar</h3>
                <Link href="/student/exams" className="text-sm text-blue-600 hover:text-blue-500">
                  Tümünü Gör
                </Link>
              </div>
              
              <div className="space-y-4">
                {dashboardData.recentExams.length > 0 ? (
                  dashboardData.recentExams.map((exam, index) => {
                    const status = getExamStatus(exam);
                    const StatusIcon = status.icon;
                    return (
                      <div key={exam._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <ClipboardDocumentListIcon className="h-5 w-5 text-purple-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{exam.title}</p>
                            <p className="text-xs text-gray-500">
                              {exam.subject} • {new Date(exam.schedule?.startDate).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`h-4 w-4 ${status.color}`} />
                          <span className={`text-xs ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <ClipboardDocumentListIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz sınav yok</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Active Plans */}
          {dashboardData.activePlans.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Aktif Planlarım</h3>
                <Link href="/student/plans" className="text-sm text-blue-600 hover:text-blue-500">
                  Tümünü Gör
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.activePlans.map((plan, index) => (
                  <div key={plan._id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AcademicCapIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-medium text-gray-900">{plan.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{plan.type === 'daily' ? 'Günlük' : plan.type === 'weekly' ? 'Haftalık' : 'Aylık'}</span>
                      <span>
                        {plan.tasks?.filter(t => t.isCompleted).length || 0} / {plan.tasks?.length || 0} görev
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/student/assignments">
                <button className="w-full p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <BookOpenIcon className="h-6 w-6 text-blue-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Ödevlerim</h4>
                  <p className="text-sm text-gray-600">Ödevlerinizi görüntüleyin ve teslim edin</p>
                </button>
              </Link>
              
              <Link href="/student/exams">
                <button className="w-full p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Sınavlarım</h4>
                  <p className="text-sm text-gray-600">Sınavlarınıza katılın</p>
                </button>
              </Link>
              
              <Link href="/student/plans">
                <button className="w-full p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <ChartBarIcon className="h-6 w-6 text-green-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Planlarım</h4>
                  <p className="text-sm text-gray-600">Planlarınızı takip edin</p>
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </StudentLayout>
    </>
  );
}
