import { useState, useEffect } from 'react';
import Head from 'next/head';
import TeacherLayout from '../../../components/layout/TeacherLayout';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { teacherCollaborationAPI } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function TeacherCollaboration() {
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedCollaboration, setSelectedCollaboration] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newCollaboration, setNewCollaboration] = useState({
    teacherEmail: '',
    permissions: {
      canViewStudents: true,
      canAddStudents: false,
      canEditStudents: false,
      canDeleteStudents: false,
      canCreateAssignments: true,
      canGradeAssignments: true,
      canViewAnalytics: true,
      canCreateReports: false
    }
  });

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      const response = await teacherCollaborationAPI.getMyCollaborations();
      setCollaborations(response.data || []);
    } catch (error) {
      console.error('Collaborations fetch error:', error);
      toast.error('İşbirlikleri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    try {
      await teacherCollaborationAPI.sendRequest(newCollaboration);
      toast.success('İşbirliği talebi gönderildi');
      setShowAddModal(false);
      setNewCollaboration({
        teacherEmail: '',
        permissions: {
          canViewStudents: true,
          canAddStudents: false,
          canEditStudents: false,
          canDeleteStudents: false,
          canCreateAssignments: true,
          canGradeAssignments: true,
          canViewAnalytics: true,
          canCreateReports: false
        }
      });
      fetchCollaborations();
    } catch (error) {
      console.error('Send request error:', error);
      toast.error(error.response?.data?.message || 'Talep gönderilirken bir hata oluştu');
    }
  };

  const handleAcceptRequest = async (collaborationId) => {
    try {
      await teacherCollaborationAPI.acceptRequest(collaborationId);
      toast.success('İşbirliği talebi kabul edildi');
      fetchCollaborations();
    } catch (error) {
      console.error('Accept request error:', error);
      toast.error('Talep kabul edilirken bir hata oluştu');
    }
  };

  const handleRejectRequest = async (collaborationId) => {
    try {
      await teacherCollaborationAPI.rejectRequest(collaborationId);
      toast.success('İşbirliği talebi reddedildi');
      fetchCollaborations();
    } catch (error) {
      console.error('Reject request error:', error);
      toast.error('Talep reddedilirken bir hata oluştu');
    }
  };

  const handleRemoveCollaboration = async (collaborationId, teacherId) => {
    if (window.confirm('Bu işbirliğini kaldırmak istediğinizden emin misiniz?')) {
      try {
        await teacherCollaborationAPI.removeCollaboration(collaborationId, teacherId);
        toast.success('İşbirliği kaldırıldı');
        fetchCollaborations();
      } catch (error) {
        console.error('Remove collaboration error:', error);
        toast.error('İşbirliği kaldırılırken bir hata oluştu');
      }
    }
  };

  const handleUpdatePermissions = async (e) => {
    e.preventDefault();
    try {
      await teacherCollaborationAPI.updatePermissions(
        selectedCollaboration._id,
        selectedTeacher.teacher._id,
        selectedTeacher.permissions
      );
      toast.success('İzinler güncellendi');
      setShowPermissionsModal(false);
      fetchCollaborations();
    } catch (error) {
      console.error('Update permissions error:', error);
      toast.error('İzinler güncellenirken bir hata oluştu');
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { text: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      accepted: { text: 'Kabul Edildi', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      rejected: { text: 'Reddedildi', color: 'bg-red-100 text-red-800', icon: XCircleIcon }
    };
    return statuses[status] || { text: status, color: 'bg-gray-100 text-gray-800', icon: ClockIcon };
  };

  const filteredCollaborations = collaborations.filter(collaboration => {
    const searchLower = searchTerm.toLowerCase();
    return (
      collaboration.mainTeacher.firstName.toLowerCase().includes(searchLower) ||
      collaboration.mainTeacher.lastName.toLowerCase().includes(searchLower) ||
      collaboration.mainTeacher.email.toLowerCase().includes(searchLower) ||
      collaboration.collaboratingTeachers.some(ct => 
        ct.teacher.firstName.toLowerCase().includes(searchLower) ||
        ct.teacher.lastName.toLowerCase().includes(searchLower) ||
        ct.teacher.email.toLowerCase().includes(searchLower)
      )
    );
  });

  return (
    <>
      <Head>
        <title>Öğretmen İşbirliği - Hedefly</title>
        <meta name="description" content="Öğretmen işbirliği yönetimi" />
      </Head>

      <TeacherLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Öğretmen İşbirliği</h1>
              <p className="text-gray-600">Maksimum 3 öğretmenle işbirliği yapın</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              İşbirliği Ekle
            </button>
          </div>

          {/* Search */}
          <div className="card p-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Öğretmen ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>

          {/* Collaborations List */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredCollaborations.length > 0 ? (
              filteredCollaborations.map((collaboration, index) => (
                <motion.div
                  key={collaboration._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <UserGroupIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {collaboration.mainTeacher.firstName} {collaboration.mainTeacher.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{collaboration.mainTeacher.email}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {collaboration.sharedStudents.length} paylaşılan öğrenci
                    </div>
                  </div>

                  {/* Collaborating Teachers */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">İşbirliği Yapan Öğretmenler</h4>
                    {collaboration.collaboratingTeachers.map((ct, ctIndex) => {
                      const status = getStatusBadge(ct.status);
                      const StatusIcon = status.icon;
                      return (
                        <div key={ctIndex} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <UserPlusIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">
                                {ct.teacher.firstName} {ct.teacher.lastName}
                              </h5>
                              <p className="text-sm text-gray-600">{ct.teacher.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className={`badge ${status.color}`}>
                              <StatusIcon className="h-4 w-4 mr-1" />
                              {status.text}
                            </span>
                            
                            <div className="flex space-x-2">
                              {ct.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleAcceptRequest(collaboration._id)}
                                    className="btn btn-success btn-sm"
                                  >
                                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                                    Kabul Et
                                  </button>
                                  <button
                                    onClick={() => handleRejectRequest(collaboration._id)}
                                    className="btn btn-error btn-sm"
                                  >
                                    <XCircleIcon className="h-4 w-4 mr-1" />
                                    Reddet
                                  </button>
                                </>
                              )}
                              
                              {ct.status === 'accepted' && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedCollaboration(collaboration);
                                      setSelectedTeacher(ct);
                                      setShowPermissionsModal(true);
                                    }}
                                    className="btn btn-outline btn-sm"
                                  >
                                    <PencilIcon className="h-4 w-4 mr-1" />
                                    İzinler
                                  </button>
                                  <button
                                    onClick={() => handleRemoveCollaboration(collaboration._id, ct.teacher._id)}
                                    className="btn btn-error btn-sm"
                                  >
                                    <TrashIcon className="h-4 w-4 mr-1" />
                                    Kaldır
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Shared Students */}
                  {collaboration.sharedStudents.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Paylaşılan Öğrenciler</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {collaboration.sharedStudents.map((ss, ssIndex) => (
                          <div key={ssIndex} className="flex items-center p-3 bg-blue-50 rounded-lg">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <ShareIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h6 className="font-medium text-gray-900">
                                {ss.student.firstName} {ss.student.lastName}
                              </h6>
                              <p className="text-xs text-gray-600">{ss.student.grade}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">İşbirliği bulunamadı</h3>
                <p className="text-gray-500">Henüz hiç işbirliğiniz yok.</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Collaboration Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)} />
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSendRequest}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">İşbirliği Talebi Gönder</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Öğretmen Email
                        </label>
                        <input
                          type="email"
                          required
                          value={newCollaboration.teacherEmail}
                          onChange={(e) => setNewCollaboration({
                            ...newCollaboration,
                            teacherEmail: e.target.value
                          })}
                          className="input w-full"
                          placeholder="ornek@email.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          İzinler
                        </label>
                        <div className="space-y-2">
                          {Object.entries(newCollaboration.permissions).map(([key, value]) => (
                            <label key={key} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => setNewCollaboration({
                                  ...newCollaboration,
                                  permissions: {
                                    ...newCollaboration.permissions,
                                    [key]: e.target.checked
                                  }
                                })}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="btn btn-primary w-full sm:w-auto sm:ml-3"
                    >
                      Talep Gönder
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="btn btn-outline w-full sm:w-auto mt-3 sm:mt-0"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Modal */}
        {showPermissionsModal && selectedCollaboration && selectedTeacher && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPermissionsModal(false)} />
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleUpdatePermissions}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {selectedTeacher.teacher.firstName} {selectedTeacher.teacher.lastName} İzinleri
                    </h3>
                    
                    <div className="space-y-2">
                      {Object.entries(selectedTeacher.permissions).map(([key, value]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setSelectedTeacher({
                              ...selectedTeacher,
                              permissions: {
                                ...selectedTeacher.permissions,
                                [key]: e.target.checked
                              }
                            })}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="btn btn-primary w-full sm:w-auto sm:ml-3"
                    >
                      Güncelle
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPermissionsModal(false)}
                      className="btn btn-outline w-full sm:w-auto mt-3 sm:mt-0"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </TeacherLayout>
    </>
  );
}

