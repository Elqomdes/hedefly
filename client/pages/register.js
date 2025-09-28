import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    phone: '',
    grade: '',
    school: '',
    parentName: '',
    parentPhone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
      router.push(redirectPath);
    }
  }, [isAuthenticated, user, router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);
      
      if (result.success) {
        toast.success('Kayıt başarılı!');
        const redirectPath = result.user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
        router.push(redirectPath);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Kayıt olurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Kayıt Ol - Hedefly</title>
        <meta name="description" content="Hedefly öğrenci koçluğu sistemine kayıt olun." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold gradient-text">Hedefly</h1>
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Hesap Oluşturun
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Giriş yapın
              </Link>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card p-8"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Role Selection */}
              <div>
                <label className="label block text-sm font-medium text-gray-700 mb-3">
                  Hesap Türü
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`relative flex cursor-pointer rounded-lg p-4 border-2 ${
                    formData.role === 'student' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={formData.role === 'student'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center">
                      <div className="text-sm font-medium text-gray-900">Öğrenci</div>
                      <div className="text-xs text-gray-500">Öğrenci olarak kayıt ol</div>
                    </div>
                  </label>
                  
                  <label className={`relative flex cursor-pointer rounded-lg p-4 border-2 ${
                    formData.role === 'teacher' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="teacher"
                      checked={formData.role === 'teacher'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center">
                      <div className="text-sm font-medium text-gray-900">Öğretmen</div>
                      <div className="text-xs text-gray-500">Öğretmen olarak kayıt ol</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="label block text-sm font-medium text-gray-700 mb-2">
                    Ad *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="Adınız"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="label block text-sm font-medium text-gray-700 mb-2">
                    Soyad *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="Soyadınız"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="label block text-sm font-medium text-gray-700 mb-2">
                  Email Adresi *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="label block text-sm font-medium text-gray-700 mb-2">
                  Telefon Numarası
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="0555 123 45 67"
                />
              </div>

              {/* Student specific fields */}
              {formData.role === 'student' && (
                <>
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
                        id="school"
                        name="school"
                        type="text"
                        value={formData.school}
                        onChange={handleChange}
                        className="input w-full"
                        placeholder="Okul adı"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="parentName" className="label block text-sm font-medium text-gray-700 mb-2">
                        Veli Adı
                      </label>
                      <input
                        id="parentName"
                        name="parentName"
                        type="text"
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
                        id="parentPhone"
                        name="parentPhone"
                        type="tel"
                        value={formData.parentPhone}
                        onChange={handleChange}
                        className="input w-full"
                        placeholder="0555 123 45 67"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Password fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="label block text-sm font-medium text-gray-700 mb-2">
                    Şifre *
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="input w-full pr-10"
                      placeholder="En az 6 karakter"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="label block text-sm font-medium text-gray-700 mb-2">
                    Şifre Tekrar *
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input w-full pr-10"
                      placeholder="Şifreyi tekrar girin"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full btn-lg group relative"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Kayıt oluşturuluyor...
                    </div>
                  ) : (
                    'Hesap Oluştur'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Veya</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Öğretmen olarak başvuru yapmak için{' '}
                  <Link href="/contact" className="font-medium text-blue-600 hover:text-blue-500">
                    iletişim sayfasını
                  </Link>{' '}
                  ziyaret edin.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

