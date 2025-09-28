import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import TeacherLayout from '../../../components/layout/TeacherLayout';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { teachersAPI } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await teachersAPI.getStudents();
      setStudents(response.data || []);
    } catch (error) {
      console.error('Students fetch error:', error);
      toast.error('Öğrenciler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = !filterGrade || student.grade === filterGrade;
    
    return matchesSearch && matchesGrade;
  });

  const grades = [...new Set(students.map(s => s.grade).filter(Boolean))];

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
        <title>Öğrencilerim - Hedefly</title>
        <meta name="description" content="Öğrenci yönetimi - Hedefly" />
      </Head>

      <TeacherLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Öğrencilerim</h1>
              <p className="text-gray-600">Öğrencilerinizi yönetin ve takip edin</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link href="/teacher/students/add">
                <button className="btn btn-primary btn-md group">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Yeni Öğrenci Ekle
                </button>
              </Link>
            </div>
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
                  placeholder="Öğrenci ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input w-full pl-10"
                />
              </div>
              
              <div>
                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Tüm Sınıflar</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}. Sınıf</option>
                  ))}
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

          {/* Students Grid */}
          {filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student, index) => (
                <motion.div
                  key={student._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card p-6 hover-lift"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <UserGroupIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{student.studentId}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Link href={`/teacher/students/${student._id}`}>
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </Link>
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Email:</span>
                      <span className="ml-2">{student.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Sınıf:</span>
                      <span className="ml-2">{student.grade || 'Belirtilmemiş'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Okul:</span>
                      <span className="ml-2">{student.school || 'Belirtilmemiş'}</span>
                    </div>
                    {student.parentName && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Veli:</span>
                        <span className="ml-2">{student.parentName}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/teacher/students/${student._id}/analytics`} className="flex-1">
                      <button className="btn btn-outline w-full btn-sm">
                        Analizleri Gör
                      </button>
                    </Link>
                    <Link href={`/teacher/students/${student._id}/assignments`} className="flex-1">
                      <button className="btn btn-primary w-full btn-sm">
                        Ödevler
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterGrade ? 'Öğrenci bulunamadı' : 'Henüz öğrenci yok'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterGrade 
                  ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                  : 'İlk öğrencinizi ekleyerek başlayın'
                }
              </p>
              {!searchTerm && !filterGrade && (
                <Link href="/teacher/students/add">
                  <button className="btn btn-primary btn-md group">
                    <UserPlusIcon className="h-5 w-5 mr-2" />
                    İlk Öğrenciyi Ekle
                  </button>
                </Link>
              )}
            </motion.div>
          )}

          {/* Stats */}
          {students.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{students.length}</div>
                  <div className="text-sm text-gray-500">Toplam Öğrenci</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {grades.length}
                  </div>
                  <div className="text-sm text-gray-500">Farklı Sınıf</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {students.filter(s => s.parentName).length}
                  </div>
                  <div className="text-sm text-gray-500">Veli Bilgisi Var</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {students.filter(s => s.school).length}
                  </div>
                  <div className="text-sm text-gray-500">Okul Bilgisi Var</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </TeacherLayout>
    </>
  );
}

