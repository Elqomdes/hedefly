import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import TeacherLayout from '../../components/layout/TeacherLayout';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowRightIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { teachersAPI, assignmentsAPI, examsAPI, classesAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const stats = [
  {
    name: 'Toplam Öğrenci',
    value: 0,
    icon: UserGroupIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    change: '+12%',
    changeType: 'positive'
  },
  {
    name: 'Aktif Sınıf',
    value: 0,
    icon: AcademicCapIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    change: '+8%',
    changeType: 'positive'
  },
  {
    name: 'Bu Ay Ödev',
    value: 0,
    icon: BookOpenIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    change: '+23%',
    changeType: 'positive'
  },
  {
    name: 'Bu Ay Sınav',
    value: 0,
    icon: ClipboardDocumentListIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    change: '+5%',
    changeType: 'positive'
  }
];

const quickActions = [
  {
    name: 'Yeni Öğrenci Ekle',
    description: 'Sisteme yeni öğrenci ekleyin',
    href: '/teacher/students/add',
    icon: UserGroupIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    name: 'Sınıf Oluştur',
    description: 'Yeni sınıf oluşturun',
    href: '/teacher/classes/create',
    icon: AcademicCapIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    name: 'Ödev Ver',
    description: 'Öğrencilere ödev verin',
    href: '/teacher/assignments/create',
    icon: BookOpenIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    name: 'Sınav Oluştur',
    description: 'Online sınav oluşturun',
    href: '/teacher/exams/create',
    icon: ClipboardDocumentListIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  }
];

export default function TeacherDashboard() {
  const [dashboardData, setDashboardData] = useState({
    students: [],
    classes: [],
    recentAssignments: [],
    recentExams: [],
    stats: {
      totalStudents: 0,
      totalClasses: 0,
      totalAssignments: 0,
      totalExams: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [studentsRes, classesRes, assignmentsRes, examsRes] = await Promise.all([
        teachersAPI.getStudents(),
        classesAPI.getAll({ limit: 5 }),
        assignmentsAPI.getAll({ limit: 5 }),
        examsAPI.getAll({ limit: 5 })
      ]);

      setDashboardData({
        students: studentsRes.data || [],
        classes: classesRes.data?.classes || [],
        recentAssignments: assignmentsRes.data?.assignments || [],
        recentExams: examsRes.data?.exams || [],
        stats: {
          totalStudents: studentsRes.data?.length || 0,
          totalClasses: classesRes.data?.classes?.length || 0,
          totalAssignments: assignmentsRes.data?.total || 0,
          totalExams: examsRes.data?.total || 0
        }
      });
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      toast.error('Dashboard verileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const updatedStats = stats.map(stat => ({
    ...stat,
    value: stat.name === 'Toplam Öğrenci' ? dashboardData.stats.totalStudents :
           stat.name === 'Aktif Sınıf' ? dashboardData.stats.totalClasses :
           stat.name === 'Bu Ay Ödev' ? dashboardData.stats.totalAssignments :
           dashboardData.stats.totalExams
  }));

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
        <title>Dashboard - Hedefly</title>
        <meta name="description" content="Öğretmen dashboard - Hedefly" />
      </Head>

      <TeacherLayout>
        <div className="space-y-4 sm:space-y-6 w-full max-w-full">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Hoş geldiniz! İşte genel durumunuz.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {updatedStats.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">geçen aya göre</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-1"
            >
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Link
                      key={action.name}
                      href={action.href}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className={`p-2 rounded-lg ${action.bgColor} mr-3`}>
                        <action.icon className={`h-5 w-5 ${action.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                          {action.name}
                        </p>
                        <p className="text-xs text-gray-500">{action.description}</p>
                      </div>
                      <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="lg:col-span-2"
            >
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Son Aktiviteler</h3>
                  <Link href="/teacher/assignments" className="text-sm text-blue-600 hover:text-blue-500">
                    Tümünü Gör
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {dashboardData.recentAssignments.length > 0 ? (
                    dashboardData.recentAssignments.map((assignment, index) => (
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
                          <span className="text-xs text-gray-500">
                            {assignment.students?.length || 0} öğrenci
                          </span>
                          <Link href={`/teacher/assignments/${assignment._id}`}>
                            <EyeIcon className="h-4 w-4 text-gray-400 hover:text-blue-600" />
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Henüz ödev yok</p>
                      <Link href="/teacher/assignments/create" className="text-blue-600 hover:text-blue-500 text-sm">
                        İlk ödevinizi oluşturun
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Students */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Öğrencilerim</h3>
              <Link href="/teacher/students" className="text-sm text-blue-600 hover:text-blue-500">
                Tümünü Gör
              </Link>
            </div>
            
            {dashboardData.students.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.students.slice(0, 6).map((student) => (
                  <div key={student._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <UserGroupIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {student.studentId} • {student.grade}. Sınıf
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Henüz öğrenci yok</p>
                <Link href="/teacher/students/add" className="text-blue-600 hover:text-blue-500 text-sm">
                  İlk öğrencinizi ekleyin
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </TeacherLayout>
    </>
  );
}
