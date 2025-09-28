import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/layout/AdminLayout';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { usersAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll({
        page: currentPage,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      });
      setUsers(response.data?.users || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Users fetch error:', error);
      toast.error('Kullanıcılar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (userId, status) => {
    try {
      await usersAPI.updateStatus(userId, { status });
      toast.success('Durum güncellendi');
      fetchUsers();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Durum güncellenirken bir hata oluştu');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        await usersAPI.delete(userId);
        toast.success('Kullanıcı silindi');
        fetchUsers();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Kullanıcı silinirken bir hata oluştu');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      active: { text: 'Aktif', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      inactive: { text: 'Pasif', color: 'bg-gray-100 text-gray-800', icon: XCircleIcon },
      pending: { text: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon }
    };
    return statuses[status] || { text: status, color: 'bg-gray-100 text-gray-800', icon: ClockIcon };
  };

  const getRoleBadge = (role) => {
    const roles = {
      admin: { text: 'Admin', color: 'bg-red-100 text-red-800' },
      teacher: { text: 'Öğretmen', color: 'bg-blue-100 text-blue-800' },
      student: { text: 'Öğrenci', color: 'bg-green-100 text-green-800' }
    };
    return roles[role] || { text: role, color: 'bg-gray-100 text-gray-800' };
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  return (
    <>
      <Head>
        <title>Kullanıcılar - Hedefly Admin</title>
        <meta name="description" content="Sistem kullanıcılarını yönetin" />
      </Head>

      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
              <p className="text-gray-600">Sistem kullanıcılarını yönetin ve düzenleyin</p>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="İsim, email veya okul ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10 w-full"
                  />
                </div>
              </form>
              
              <div className="flex gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">Tüm Roller</option>
                  <option value="admin">Admin</option>
                  <option value="teacher">Öğretmen</option>
                  <option value="student">Öğrenci</option>
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                  <option value="pending">Bekliyor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="card p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-4">
                {users.map((user, index) => {
                  const status = getStatusBadge(user.status);
                  const role = getRoleBadge(user.role);
                  const StatusIcon = status.icon;
                  return (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <UserGroupIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {user.firstName} {user.lastName}
                            </h3>
                            <span className={`badge ${role.color}`}>
                              {role.text}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          {user.school && (
                            <p className="text-sm text-gray-500">{user.school}</p>
                          )}
                          <p className="text-xs text-gray-400">
                            Kayıt: {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`badge ${status.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {status.text}
                        </span>
                        
                        <div className="flex space-x-2">
                          {user.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(user._id, 'active')}
                                className="btn btn-success btn-sm"
                              >
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Aktif Et
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(user._id, 'inactive')}
                                className="btn btn-error btn-sm"
                              >
                                <XCircleIcon className="h-4 w-4 mr-1" />
                                Pasif Et
                              </button>
                            </>
                          )}
                          <button className="btn btn-outline btn-sm">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Görüntüle
                          </button>
                          <button className="btn btn-outline btn-sm">
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="btn btn-error btn-sm"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Sil
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Kullanıcı bulunamadı</h3>
                <p className="text-gray-500">Arama kriterlerinize uygun kullanıcı bulunmuyor.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
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
        </div>
      </AdminLayout>
    </>
  );
}

