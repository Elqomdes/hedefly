import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import TeacherLayout from '../../../components/layout/TeacherLayout';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { teachersAPI } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function AddStudentPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    grade: '',
    school: '',
    parentName: '',
    parentPhone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await teachersAPI.addStudent(formData);
      if (result.success) {
        toast.success('Öğrenci başarıyla eklendi!');
        router.push('/teacher/students');
      } else {
        toast.error(result.error || 'Öğrenci eklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Add student error:', error);
      toast.error('Öğrenci eklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Yeni Öğrenci Ekle - Hedefly</title>
        <meta name="description" content="Yeni öğrenci ekle - Hedefly" />
      </Head>

      <TeacherLayout>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/teacher/students" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Öğrencilere Dön
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Yeni Öğrenci Ekle</h1>
            <p className="text-gray-600">Sisteme yeni öğrenci ekleyin</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Kişisel Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="label block text-sm font-medium text-gray-700 mb-2">
                      Ad *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="Öğrencinin adı"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="label block text-sm font-medium text-gray-700 mb-2">
                      Soyad *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="Öğrencinin soyadı"
                    />
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hesap Bilgileri</h3>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="email" className="label block text-sm font-medium text-gray-700 mb-2">
                      Email Adresi *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="ornek@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="label block text-sm font-medium text-gray-700 mb-2">
                      Şifre *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="En az 6 karakter"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Öğrenci bu şifre ile sisteme giriş yapabilir
                    </p>
                  </div>
                </div>
              </div>

              {/* Educational Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Eğitim Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="grade" className="label block text-sm font-medium text-gray-700 mb-2">
                      Sınıf
                    </label>
                    <select
                      id="grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      className="input w-full"
                    >
                      <option value="">Sınıf seçin</option>
                      <option value="9">9. Sınıf</option>
                      <option value="10">10. Sınıf</option>
                      <option value="11">11. Sınıf</option>
                      <option value="12">12. Sınıf</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="school" className="label block text-sm font-medium text-gray-700 mb-2">
                      Okul
                    </label>
                    <input
                      type="text"
                      id="school"
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="Okul adı"
                    />
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Veli Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="parentName" className="label block text-sm font-medium text-gray-700 mb-2">
                      Veli Adı
                    </label>
                    <input
                      type="text"
                      id="parentName"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="Veli adı soyadı"
                    />
                  </div>

                  <div>
                    <label htmlFor="parentPhone" className="label block text-sm font-medium text-gray-700 mb-2">
                      Veli Telefonu
                    </label>
                    <input
                      type="tel"
                      id="parentPhone"
                      name="parentPhone"
                      value={formData.parentPhone}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="0555 123 45 67"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Link href="/teacher/students">
                  <button type="button" className="btn btn-outline btn-md">
                    İptal
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary btn-md group"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Ekleniyor...
                    </div>
                  ) : (
                    <>
                      <UserPlusIcon className="h-5 w-5 mr-2" />
                      Öğrenciyi Ekle
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </TeacherLayout>
    </>
  );
}

