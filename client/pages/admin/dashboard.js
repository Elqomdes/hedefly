import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../components/layout/AdminLayout';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { contactAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    recent: 0
  });
  const [recentContacts, setRecentContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentContacts();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await contactAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Stats fetch error:', error);
      toast.error('İstatistikler yüklenirken bir hata oluştu');
    }
  };

  const fetchRecentContacts = async () => {
    try {
      const response = await contactAPI.getAll({ limit: 5 });
      setRecentContacts(response.data?.contacts || []);
    } catch (error) {
      console.error('Recent contacts fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (contactId, status) => {
    try {
      await contactAPI.updateStatus(contactId, { status });
      toast.success('Durum güncellendi');
      fetchStats();
      fetchRecentContacts();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Durum güncellenirken bir hata oluştu');
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { text: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      approved: { text: 'Onaylandı', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      rejected: { text: 'Reddedildi', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon }
    };
    return statuses[status] || { text: status, color: 'bg-gray-100 text-gray-800', icon: ClockIcon };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - Hedefly</title>
        <meta name="description" content="Admin dashboard - Hedefly" />
      </Head>

      <AdminLayout>
          <div className="space-y-4 sm:space-y-6 w-full max-w-full">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Sistem genelinde öğretmen başvurularını yönetin</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Toplam Başvuru</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                  <div className="p-3 rounded-lg bg-yellow-100">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Bekleyen</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
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
                  <div className="p-3 rounded-lg bg-green-100">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Onaylandı</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
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
                  <div className="p-3 rounded-lg bg-red-100">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Reddedildi</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="card p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <ChartBarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Son 30 Gün</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.recent}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Recent Applications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Son Başvurular</h3>
                <button className="btn btn-outline btn-sm">
                  Tümünü Gör
                </button>
              </div>

              <div className="space-y-4">
                {recentContacts.length > 0 ? (
                  recentContacts.map((contact, index) => {
                    const status = getStatusBadge(contact.status);
                    const StatusIcon = status.icon;
                    return (
                      <div key={contact._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <UserGroupIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {contact.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {contact.email} • {contact.school} • {contact.subject}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(contact.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`badge ${status.color}`}>
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {status.text}
                          </span>
                          <div className="flex space-x-1">
                            {contact.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(contact._id, 'approved')}
                                  className="btn btn-success btn-sm"
                                >
                                  Onayla
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(contact._id, 'rejected')}
                                  className="btn btn-error btn-sm"
                                >
                                  Reddet
                                </button>
                              </>
                            )}
                            <button className="btn btn-outline btn-sm">
                              Detay
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <EnvelopeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz başvuru yok</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <EnvelopeIcon className="h-6 w-6 text-blue-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Başvuruları Yönet</h4>
                  <p className="text-sm text-gray-600">Öğretmen başvurularını inceleyin</p>
                </button>
                
                <button className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <UserGroupIcon className="h-6 w-6 text-green-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Kullanıcıları Yönet</h4>
                  <p className="text-sm text-gray-600">Sistem kullanıcılarını yönetin</p>
                </button>
                
                <button className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <ChartBarIcon className="h-6 w-6 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Sistem Raporları</h4>
                  <p className="text-sm text-gray-600">Detaylı sistem raporlarını görün</p>
                </button>
              </div>
            </motion.div>
          </div>
      </AdminLayout>
    </>
  );
}
