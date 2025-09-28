import { useState, useEffect } from 'react';
import Head from 'next/head';
import TeacherLayout from '../../../components/layout/TeacherLayout';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { analyticsAPI, teachersAPI } from '../../../lib/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function AnalyticsPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentAnalytics(selectedStudent._id);
    }
  }, [selectedStudent, period]);

  const fetchStudents = async () => {
    try {
      const response = await teachersAPI.getStudents();
      setStudents(response.data || []);
    } catch (error) {
      console.error('Students fetch error:', error);
      toast.error('Öğrenciler yüklenirken bir hata oluştu');
    }
  };

  const fetchStudentAnalytics = async (studentId) => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getStudentAnalytics(studentId, period);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error('Analiz verileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateReport = async (studentId) => {
    try {
      const response = await analyticsAPI.generateStudentReport(studentId, {
        format: 'pdf',
        includeCharts: true
      });
      toast.success('Rapor oluşturuldu!');
      // In a real implementation, you would download the PDF here
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Rapor oluşturulurken bir hata oluştu');
    }
  };

  const subjectData = analyticsData?.statistics?.subjectStats ? 
    Object.entries(analyticsData.statistics.subjectStats).map(([subject, stats]) => ({
      subject,
      total: stats.total,
      completed: stats.completed,
      averageGrade: stats.averageGrade
    })) : [];

  const radarData = subjectData.map(item => ({
    subject: item.subject,
    completionRate: (item.completed / item.total) * 100,
    averageGrade: item.averageGrade
  }));

  return (
    <>
      <Head>
        <title>Analizler - Hedefly</title>
        <meta name="description" content="Öğrenci analizleri - Hedefly" />
      </Head>

      <TeacherLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analizler</h1>
            <p className="text-gray-600">Öğrenci performanslarını analiz edin ve raporlar oluşturun</p>
          </div>

          {/* Student Selection */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Öğrenci Seçimi</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Öğrenci ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input w-full pl-10"
                />
              </div>
              
              <div>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="input w-full"
                >
                  <option value="all">Tüm Zamanlar</option>
                  <option value="week">Son 1 Hafta</option>
                  <option value="month">Son 1 Ay</option>
                  <option value="year">Son 1 Yıl</option>
                </select>
              </div>

              <div className="flex space-x-2">
                <button className="btn btn-outline btn-md">
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  Filtrele
                </button>
              </div>
            </div>

            {/* Student List */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student) => (
                <motion.div
                  key={student._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedStudent?._id === student._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <UserGroupIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </h4>
                      <p className="text-sm text-gray-500">{student.studentId}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Analytics Content */}
          {selectedStudent && analyticsData ? (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <UserGroupIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {analyticsData.student.firstName} {analyticsData.student.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {analyticsData.student.studentId} • {analyticsData.student.grade}. Sınıf
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => generateReport(selectedStudent._id)}
                      className="btn btn-outline btn-md"
                    >
                      <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                      Rapor Oluştur
                    </button>
                    <button className="btn btn-primary btn-md">
                      <EyeIcon className="h-5 w-5 mr-2" />
                      Detaylı Görünüm
                    </button>
                  </div>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-6"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-blue-100">
                      <BookOpenIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Toplam Ödev</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analyticsData.statistics.assignments.total}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-green-600">
                        {analyticsData.statistics.assignments.completionRate}%
                      </span>
                      <span className="text-sm text-gray-500 ml-2">tamamlandı</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="card p-6"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-green-100">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Ortalama Not</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analyticsData.statistics.assignments.averageGrade}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card p-6"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-purple-100">
                      <ClipboardDocumentListIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Toplam Sınav</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analyticsData.statistics.exams.total}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-green-600">
                        {analyticsData.statistics.exams.completionRate}%
                      </span>
                      <span className="text-sm text-gray-500 ml-2">tamamlandı</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="card p-6"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-orange-100">
                      <ChartBarIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Sınav Ortalaması</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analyticsData.statistics.exams.averageGrade}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subject Performance Bar Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="card p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ders Bazında Performans</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={subjectData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="subject" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="averageGrade" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Subject Completion Pie Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="card p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ders Bazında Tamamlanma</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={subjectData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ subject, completed, total }) => `${subject}: ${completed}/${total}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="completed"
                        >
                          {subjectData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>

              {/* Radar Chart */}
              {radarData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="card p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ders Performans Radar Grafiği</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis />
                        <Radar
                          name="Tamamlanma Oranı"
                          dataKey="completionRate"
                          stroke="#3B82F6"
                          fill="#3B82F6"
                          fillOpacity={0.3}
                        />
                        <Radar
                          name="Ortalama Not"
                          dataKey="averageGrade"
                          stroke="#10B981"
                          fill="#10B981"
                          fillOpacity={0.3}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
                <div className="space-y-4">
                  {analyticsData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        activity.type === 'assignment' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        {activity.type === 'assignment' ? (
                          <BookOpenIcon className="h-4 w-4 text-blue-600" />
                        ) : (
                          <ClipboardDocumentListIcon className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">
                          {activity.subject} • {new Date(activity.date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activity.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : selectedStudent && loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Analiz için öğrenci seçin
              </h3>
              <p className="text-gray-500">
                Yukarıdan bir öğrenci seçerek detaylı analizlerini görüntüleyebilirsiniz
              </p>
            </motion.div>
          )}
        </div>
      </TeacherLayout>
    </>
  );
}

