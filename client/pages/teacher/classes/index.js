import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import TeacherLayout from '../../../components/layout/TeacherLayout';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { classesAPI } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterGrade, setFilterGrade] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classesAPI.getAll();
      setClasses(response.data?.classes || []);
    } catch (error) {
      console.error('Classes fetch error:', error);
      toast.error('Sınıflar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = 
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = !filterSubject || classItem.subject === filterSubject;
    const matchesGrade = !filterGrade || classItem.grade === filterGrade;
    
    return matchesSearch && matchesSubject && matchesGrade;
  });

  const subjects = [...new Set(classes.map(c => c.subject).filter(Boolean))];
  const grades = [...new Set(classes.map(c => c.grade).filter(Boolean))];

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
        <title>Sınıflarım - Hedefly</title>
        <meta name="description" content="Sınıf yönetimi - Hedefly" />
      </Head>

      <TeacherLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sınıflarım</h1>
              <p className="text-gray-600">Sınıflarınızı yönetin ve öğrencileri organize edin</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link href="/teacher/classes/create">
                <button className="btn btn-primary btn-md group">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Yeni Sınıf Oluştur
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
                  placeholder="Sınıf ara..."
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

          {/* Classes Grid */}
          {filteredClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((classItem, index) => (
                <motion.div
                  key={classItem._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card p-6 hover-lift"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center mr-3"
                        style={{ backgroundColor: classItem.color + '20' }}
                      >
                        <AcademicCapIcon 
                          className="h-6 w-6" 
                          style={{ color: classItem.color }}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {classItem.name}
                        </h3>
                        <p className="text-sm text-gray-500">{classItem.subject}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Link href={`/teacher/classes/${classItem._id}`}>
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </Link>
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {classItem.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {classItem.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{classItem.students?.length || 0} öğrenci</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpenIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{classItem.assignments?.length || 0} ödev</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ClipboardDocumentListIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{classItem.exams?.length || 0} sınav</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/teacher/classes/${classItem._id}`} className="flex-1">
                      <button className="btn btn-outline w-full btn-sm">
                        Detayları Gör
                      </button>
                    </Link>
                    <Link href={`/teacher/classes/${classItem._id}/students`} className="flex-1">
                      <button className="btn btn-primary w-full btn-sm">
                        Öğrenciler
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
              <AcademicCapIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterSubject || filterGrade ? 'Sınıf bulunamadı' : 'Henüz sınıf yok'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterSubject || filterGrade 
                  ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                  : 'İlk sınıfınızı oluşturarak başlayın'
                }
              </p>
              {!searchTerm && !filterSubject && !filterGrade && (
                <Link href="/teacher/classes/create">
                  <button className="btn btn-primary btn-md group">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    İlk Sınıfı Oluştur
                  </button>
                </Link>
              )}
            </motion.div>
          )}

          {/* Stats */}
          {classes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{classes.length}</div>
                  <div className="text-sm text-gray-500">Toplam Sınıf</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {classes.reduce((sum, c) => sum + (c.students?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-500">Toplam Öğrenci</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {classes.reduce((sum, c) => sum + (c.assignments?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-500">Toplam Ödev</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {classes.reduce((sum, c) => sum + (c.exams?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-500">Toplam Sınav</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </TeacherLayout>
    </>
  );
}

