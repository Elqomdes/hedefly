import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { passwordResetAPI } from '../lib/passwordResetAPI';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Lütfen email adresinizi girin');
      return;
    }

    try {
      setLoading(true);
      await passwordResetAPI.forgotPassword(email);
      setEmailSent(true);
      toast.success('Şifre sıfırlama bağlantısı email adresinize gönderildi');
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || 'Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <>
        <Head>
          <title>Email Gönderildi - Hedefly</title>
          <meta name="description" content="Şifre sıfırlama emaili gönderildi" />
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
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <EnvelopeIcon className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="mt-6 text-3xl font-bold text-gray-900">
                  Email Gönderildi
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi.
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Lütfen email kutunuzu kontrol edin ve bağlantıya tıklayarak şifrenizi sıfırlayın.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <EnvelopeIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Email Gelmedi mi?
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>Spam klasörünüzü kontrol edin veya birkaç dakika bekleyin.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => setEmailSent(false)}
                    className="btn btn-outline w-full"
                  >
                    Başka Email Dene
                  </button>
                  
                  <Link href="/login" className="btn btn-primary w-full">
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
        <title>Şifremi Unuttum - Hedefly</title>
        <meta name="description" content="Şifrenizi sıfırlayın" />
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
              <h2 className="text-3xl font-bold text-gray-900">
                Şifremi Unuttum
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Email adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Adresi
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input w-full"
                    placeholder="ornek@email.com"
                  />
                </div>
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
                    'Şifre Sıfırlama Bağlantısı Gönder'
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
