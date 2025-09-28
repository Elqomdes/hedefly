import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { KeyIcon, ArrowLeftIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { passwordResetAPI } from '../lib/passwordResetAPI';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validToken, setValidToken] = useState(null);

  useEffect(() => {
    if (token) {
      validateToken(token);
    }
  }, [token]);

  const validateToken = async (resetToken) => {
    try {
      const response = await passwordResetAPI.verifyResetToken(resetToken);
      setValidToken(true);
    } catch (error) {
      console.error('Token validation error:', error);
      setValidToken(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.password || !formData.confirmPassword) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      setLoading(true);
      await passwordResetAPI.resetPassword(token, formData.password);
      toast.success('Şifreniz başarıyla güncellendi');
      router.push('/login');
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'Şifre güncellenirken bir hata oluştu';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (validToken === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (validToken === false) {
    return (
      <>
        <Head>
          <title>Geçersiz Bağlantı - Hedefly</title>
          <meta name="description" content="Geçersiz şifre sıfırlama bağlantısı" />
        </Head>

        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <KeyIcon className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="mt-6 text-3xl font-bold text-gray-900">
                  Geçersiz Bağlantı
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <KeyIcon className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Bağlantı Geçersiz
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>Lütfen yeni bir şifre sıfırlama bağlantısı isteyin.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <Link href="/forgot-password" className="btn btn-primary w-full">
                    Yeni Bağlantı İste
                  </Link>
                  
                  <Link href="/login" className="btn btn-outline w-full">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Giriş Sayfasına Dön
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Şifre Sıfırla - Hedefly</title>
        <meta name="description" content="Yeni şifrenizi belirleyin" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <KeyIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Yeni Şifre Belirle
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Güvenli bir şifre oluşturun
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Yeni Şifre
                </label>
                <div className="mt-1 relative">
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Şifre Tekrar
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input w-full pr-10"
                    placeholder="Şifrenizi tekrar girin"
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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  Güvenli Şifre İpuçları:
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• En az 6 karakter kullanın</li>
                  <li>• Büyük ve küçük harf karışımı</li>
                  <li>• Sayı ve özel karakter ekleyin</li>
                  <li>• Kişisel bilgilerinizi kullanmayın</li>
                </ul>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Şifreyi Güncelle'
                  )}
                </button>
              </div>

              <div className="text-center">
                <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500 flex items-center justify-center">
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Giriş Sayfasına Dön
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
}
