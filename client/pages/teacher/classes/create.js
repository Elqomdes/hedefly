import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import TeacherLayout from '../../../components/layout/TeacherLayout';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { classesAPI } from '../../../lib/api';
import toast from 'react-hot-toast';

const subjects = [
  'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Edebiyat',
  'Tarih', 'Coğrafya', 'Felsefe', 'İngilizce', 'Almanca', 'Fransızca',
  'Bilgisayar', 'Müzik', 'Resim', 'Beden Eğitimi', 'Diğer'
];

const grades = ['9', '10', '11', '12'];

const colors = [
  { name: 'Mavi', value: '#3B82F6' },
  { name: 'Yeşil', value: '#10B981' },
  { name: 'Mor', value: '#8B5CF6' },
  { name: 'Turuncu', value: '#F59E0B' },
  { name: 'Kırmızı', value: '#EF4444' },
  { name: 'Pembe', value: '#EC4899' },
  { name: 'İndigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' }
];

export default function CreateClassPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    grade: '',
    color: '#3B82F6'
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
      const result = await classesAPI.create(formData);
      if (result.success) {
        toast.success('Sınıf başarıyla oluşturuldu!');
        router.push('/teacher/classes');
      } else {
        toast.error(result.error || 'Sınıf oluşturulurken bir hata oluştu');
      }
    } catch (error) {
      console.error('Create class error:', error);
      toast.error('Sınıf oluşturulurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Yeni Sınıf Oluştur - Hedefly</title>
        <meta name="description" content="Yeni sınıf oluştur - Hedefly" />
      </Head>

      <TeacherLayout>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/teacher/classes" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Sınıflara Dön
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Yeni Sınıf Oluştur</h1>
            <p className="text-gray-600">Yeni bir sınıf oluşturun ve öğrencileri organize edin</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Temel Bilgiler</h3>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="label block text-sm font-medium text-gray-700 mb-2">
                      Sınıf Adı *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="Örn: 9-A Matematik, 11. Sınıf Fizik"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="label block text-sm font-medium text-gray-700 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      className="input w-full resize-none"
                      placeholder="Sınıf hakkında kısa bir açıklama yazın..."
                    />
                  </div>
                </div>
              </div>

              {/* Subject and Grade */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ders Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="subject" className="label block text-sm font-medium text-gray-700 mb-2">
                      Ders *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="input w-full"
                    >
                      <option value="">Ders seçin</option>
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="grade" className="label block text-sm font-medium text-gray-700 mb-2">
                      Sınıf *
                    </label>
                    <select
                      id="grade"
                      name="grade"
                      required
                      value={formData.grade}
                      onChange={handleChange}
                      className="input w-full"
                    >
                      <option value="">Sınıf seçin</option>
                      {grades.map(grade => (
                        <option key={grade} value={grade}>{grade}. Sınıf</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Renk Seçimi</h3>
                <div className="grid grid-cols-4 gap-3">
                  {colors.map((color) => (
                    <label
                      key={color.value}
                      className={`relative flex cursor-pointer rounded-lg p-3 border-2 ${
                        formData.color === color.value 
                          ? 'border-gray-900 bg-gray-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="color"
                        value={color.value}
                        checked={formData.color === color.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-8 h-8 rounded-full mb-2"
                          style={{ backgroundColor: color.value }}
                        ></div>
                        <span className="text-xs text-gray-700">{color.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Önizleme</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: formData.color + '20' }}
                    >
                      <AcademicCapIcon 
                        className="h-6 w-6" 
                        style={{ color: formData.color }}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {formData.name || 'Sınıf Adı'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formData.subject && formData.grade 
                          ? `${formData.subject} - ${formData.grade}. Sınıf`
                          : 'Ders - Sınıf'
                        }
                      </p>
                    </div>
                  </div>
                  {formData.description && (
                    <p className="text-sm text-gray-600 mt-3">
                      {formData.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Link href="/teacher/classes">
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
                      Oluşturuluyor...
                    </div>
                  ) : (
                    <>
                      <AcademicCapIcon className="h-5 w-5 mr-2" />
                      Sınıfı Oluştur
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

