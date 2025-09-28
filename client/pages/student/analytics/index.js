import { useState, useEffect } from 'react';
import Head from 'next/head';
import StudentLayout from '../../../components/layout/StudentLayout';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  TargetIcon,
  CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { studentsAPI } from '../../../lib/api';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function StudentAnalytics() {
  const [analytics, setAnalytics] = useState({
    statistics: {
      assignments: {
        total: 0,
        completed: 0,
        completionRate: 0,
        averageGrade: 0
      },
      exams: {
        total: 0,
        completed: 0,
        completionRate: 0,
        averageGrade: 0
      },
      plans: {
        totalTasks: 0,
        completedTasks: 0,
        taskCompletionRate: 0,
        totalGoals: 0,
        achievedGoals: 0,
        goalAchievementRate: 0
      }
    },
    subjectStats: {},
    recentActivity: [],
    performanceTrend: [],
    monthlyProgress: []
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getAnalytics({ period });
      setAnalytics(response.data || {
        statistics: {
          assignments: { total: 0, completed: 0, completionRate: 0, averageGrade: 0 },
          exams: { total: 0, completed: 0, completionRate: 0, averageGrade: 0 },
          plans: { totalTasks: 0, completedTasks: 0, taskCompletionRate: 0, totalGoals: 0, achievedGoals: 0, goalAchievementRate: 0 }
        },
        subjectStats: {},
        recentActivity: [],
        performanceTrend: [],
        monthlyProgress: []
      });
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error('Analiz verileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getSubjectChartData = () => {
    return Object.entries(analytics.subjectStats).map(([subject, stats]) => ({
      subject,
      completionRate: stats.completionRate || 0,
      averageGrade: stats.averageGrade || 0,
      total: stats.total || 0,
      completed: stats.completed || 0
    }));
  };

  const getPerformanceRadarData = () => {
    const subjects = Object.keys(analytics.subjectStats);
    if (subjects.length === 0) return [];

    return subjects.map(subject => ({
      subject,
      completion: analytics.subjectStats[subject]?.completionRate || 0,
      performance: analytics.subjectStats[subject]?.averageGrade || 0,
      fullMark: 100
    }));
  };

  const getMonthlyProgressData = () => {
    return analytics.monthlyProgress.map(item => ({
      month: new Date(item.month).toLocaleDateString('tr-TR', { month: 'short' }),
      assignments: item.assignments || 0,
      exams: item.exams || 0,
      goals: item.goals || 0
    }));
  };

  const getPerformanceTrendData = () => {
    return analytics.performanceTrend.map(item => ({
      date: new Date(item.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
      grade: item.grade || 0,
      completion: item.completion || 0
    }));
  };

  const StatCard = ({ title, value, icon: Icon, color, change, changeType }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center text-sm ${
              changeType === 'positive' ? 'text-green-600' : 
              changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {changeType === 'positive' ? (
                <TrendingUpIcon className="h-4 w-4 mr-1" />
              ) : changeType === 'negative' ? (
                <TrendingDownIcon className="h-4 w-4 mr-1" />
              ) : null}
              {change}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <Head>
        <title>Analizlerim - Hedefly</title>
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
              <h1 className="text-2xl font-bold text-gray-900">Analizlerim</h1>
              <p className="mt-1 text-sm text-gray-600">
                Performansınızı ve ilerlemenizi detaylı olarak inceleyin
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">Son 1 Hafta</option>
                <option value="month">Son 1 Ay</option>
                <option value="year">Son 1 Yıl</option>
                <option value="all">Tüm Zamanlar</option>
              </select>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <StatCard
              title="Toplam Ödev"
              value={analytics.statistics.assignments.total}
              icon={BookOpenIcon}
              color="bg-blue-500"
            />
            <StatCard
              title="Ödev Tamamlama"
              value={`${analytics.statistics.assignments.completionRate}%`}
              icon={CheckCircleIcon}
              color="bg-green-500"
            />
            <StatCard
              title="Ortalama Not"
              value={analytics.statistics.assignments.averageGrade}
              icon={AcademicCapIcon}
              color="bg-purple-500"
            />
            <StatCard
              title="Toplam Sınav"
              value={analytics.statistics.exams.total}
              icon={ClipboardDocumentListIcon}
              color="bg-orange-500"
            />
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ders Bazında Performans</h3>
              {getSubjectChartData().length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getSubjectChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completionRate" fill="#3B82F6" name="Tamamlama Oranı (%)" />
                    <Bar dataKey="averageGrade" fill="#10B981" name="Ortalama Not" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Henüz veri bulunmuyor</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Performance Radar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performans Radarı</h3>
              {getPerformanceRadarData().length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={getPerformanceRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Tamamlama"
                      dataKey="completion"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Performans"
                      dataKey="performance"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <TargetIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Henüz veri bulunmuyor</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Monthly Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık İlerleme</h3>
            {getMonthlyProgressData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getMonthlyProgressData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="assignments" stroke="#3B82F6" name="Ödevler" />
                  <Line type="monotone" dataKey="exams" stroke="#10B981" name="Sınavlar" />
                  <Line type="monotone" dataKey="goals" stroke="#F59E0B" name="Hedefler" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Henüz veri bulunmuyor</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
            {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'assignment' ? 'bg-blue-100' :
                      activity.type === 'exam' ? 'bg-green-100' :
                      activity.type === 'goal' ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      {activity.type === 'assignment' ? (
                        <BookOpenIcon className="h-4 w-4 text-blue-600" />
                      ) : activity.type === 'exam' ? (
                        <ClipboardDocumentListIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <TargetIcon className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.subject} • {new Date(activity.date).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.status === 'completed' ? 'Tamamlandı' :
                       activity.status === 'pending' ? 'Beklemede' : activity.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ClockIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Henüz aktivite bulunmuyor</p>
              </div>
            )}
          </motion.div>
        </div>
      </StudentLayout>
    </>
  );
}

