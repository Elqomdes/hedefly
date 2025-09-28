import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { EnvelopeIcon, CheckCircleIcon, XCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { emailVerificationAPI } from '../lib/emailVerificationAPI';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;
  
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // null, 'success', 'error', 'expired'
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    try {
      setLoading(true);
      const response = await emailVerificationAPI.verifyEmailToken(verificationToken);
      
      if (response.data.success) {
        setVerificationStatus('success');
        setEmail(response.data.user.email);
        toast.success('Email adresiniz başarıyla doğrulandı');
      } else {
        setVerificationStatus('error');
        toast.error('Geçersiz doğrulama bağlantısı');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      const errorMessage = error.response?.data?.message || 'Email doğrulanırken bir hata oluştu';
      
      if (errorMessage.includes('süresi dolmuş') || errorMessage.includes('expired')) {
        setVerificationStatus('expired');
        toast.error('Doğrulama bağlantısının süresi dolmuş');
      } else {
        setVerificationStatus('error');
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      setLoading(true);
      await emailVerificationAPI.resendVerification(email);
      toast.success('Doğrulama emaili tekrar gönderildi');
    } catch (error) {
      console.error('Resend verification error:', error);
      const errorMessage = error.response?.data?.message || 'Email gönderilirken bir hata oluştu';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const renderSuccess = () => (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <CheckCircleIcon className="h-6 w-6 text-green-600" />
      </div>
      <h2 className="mt-6 text-3xl font-bold text-gray-900">
        Email Doğrulandı
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Email adresiniz <strong>{email}</strong> başarıyla doğrulandı.
      </p>
      <p className="mt-2 text-sm text-gray-600">
        Artık hesabınızı kullanmaya başlayabilirsiniz.
      </p>

      <div className="mt-6 space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Doğrulama Tamamlandı
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Hesabınız aktif edildi ve tüm özellikler kullanılabilir.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <Link href="/login" className="btn btn-primary w-full">
            Giriş Yap
          </Link>
          
          <Link href="/" className="btn btn-outline w-full">
            Ana Sayfaya Git
          </Link>
        </div>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
        <XCircleIcon className="h-6 w-6 text-red-600" />
      </div>
      <h2 className="mt-6 text-3xl font-bold text-gray-900">
        Doğrulama Başarısız
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Email adresiniz doğrulanamadı.
      </p>

      <div className="mt-6 space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Doğrulama Hatası
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Geçersiz veya hatalı doğrulama bağlantısı.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={resendVerification}
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Yeni Doğrulama Emaili Gönder'}
          </button>
          
          <Link href="/login" className="btn btn-outline w-full">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    </div>
  );

  const renderExpired = () => (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
        <XCircleIcon className="h-6 w-6 text-yellow-600" />
      </div>
      <h2 className="mt-6 text-3xl font-bold text-gray-900">
        Bağlantı Süresi Doldu
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Doğrulama bağlantısının süresi dolmuş.
      </p>

      <div className="mt-6 space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <EnvelopeIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Süre Doldu
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Doğrulama bağlantısı 24 saat içinde kullanılmalıdır.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={resendVerification}
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Yeni Doğrulama Emaili Gönder'}
          </button>
          
          <Link href="/login" className="btn btn-outline w-full">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (verificationStatus) {
      case 'success':
        return renderSuccess();
      case 'error':
        return renderError();
      case 'expired':
        return renderExpired();
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Email Doğrulama - Hedefly</title>
        <meta name="description" content="Email adresinizi doğrulayın" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </>
  );
}
