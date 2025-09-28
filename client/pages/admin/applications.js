import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/layout/AdminLayout';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { contactAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminApplications() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchContacts();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await contactAPI.getAll({
        page: currentPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      });
      setContacts(response.data?.contacts || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Contacts fetch error:', error);
      toast.error('Başvurular yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (contactId, status) => {
    try {
      await contactAPI.updateStatus(contactId, { status });
      toast.success('Durum güncellendi');
      fetchContacts();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Durum güncellenirken bir hata oluştu');
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { text: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      approved: { text: 'Onaylandı', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      rejected: { text: 'Reddedildi', color: 'bg-red-100 text-red-800', icon: XCircleIcon }
    };
    return statuses[status] || { text: status, color: 'bg-gray-100 text-gray-800', icon: ClockIcon };
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchContacts();
  };

  return (
    <>
      <Head>
        <title>Başvurular - Hedefly Admin</title>
        <meta name="description" content="Öğretmen başvurularını yönetin" />
      </Head>

      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Öğretmen Başvuruları</h1>
              <p className="text-gray-600">Sistem başvurularını yönetin ve değerlendirin</p>
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="pending">Bekliyor</option>
                  <option value="approved">Onaylandı</option>
                  <option value="rejected">Reddedildi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className="card p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : contacts.length > 0 ? (
              <div className="space-y-4">
                {contacts.map((contact, index) => {
                  const status = getStatusBadge(contact.status);
                  const StatusIcon = status.icon;
                  return (
                    <motion.div
                      key={contact._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                          <p className="text-sm text-gray-600">{contact.email}</p>
                          <p className="text-sm text-gray-500">
                            {contact.school} • {contact.subject} • {contact.experience} yıl deneyim
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(contact.createdAt).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`badge ${status.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {status.text}
                        </span>
                        
                        <div className="flex space-x-2">
                          {contact.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(contact._id, 'approved')}
                                className="btn btn-success btn-sm"
                              >
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Onayla
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(contact._id, 'rejected')}
                                className="btn btn-error btn-sm"
                              >
                                <XCircleIcon className="h-4 w-4 mr-1" />
                                Reddet
                              </button>
                            </>
                          )}
                          <button className="btn btn-outline btn-sm">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Detay
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <EnvelopeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Başvuru bulunamadı</h3>
                <p className="text-gray-500">Arama kriterlerinize uygun başvuru bulunmuyor.</p>
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

