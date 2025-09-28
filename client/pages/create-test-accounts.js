import { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function CreateTestAccounts() {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState(null);

  const createTestAccounts = async () => {
    try {
      setLoading(true);
      console.log('Test hesapları oluşturuluyor...');
      
      const response = await axios.post('/api/auth/create-test-accounts');
      
      if (response.data.success && response.data.accounts) {
        setAccounts(response.data.accounts);
        toast.success('Test hesapları başarıyla oluşturuldu!');
        console.log('Test hesapları oluşturuldu:', response.data.accounts);
      } else {
        toast.error(response.data.message || 'Test hesapları oluşturulamadı');
      }
    } catch (error) {
      console.error('Create test accounts error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Test hesapları oluşturulurken bir hata oluştu';
      toast.error(errorMessage);
      
      // MongoDB bağlantı hatası durumunda özel mesaj
      if (error.response?.status === 503) {
        toast.error('Veritabanı bağlantısı yok. Lütfen MongoDB bağlantısını kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Test Hesapları Oluştur - Hedefly</title>
        <meta name="description" content="Test hesapları oluştur - Hedefly" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold gradient-text">Hedefly</h1>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Test Hesapları Oluştur
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Öğretmen ve öğrenci test hesapları oluşturun
            </p>
          </div>

          <div className="card p-8">
            {!accounts ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Test Hesapları Oluştur
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Öğretmen ve öğrenci test hesapları oluşturarak sistemi test edebilirsiniz.
                  </p>
                </div>

                <button
                  onClick={createTestAccounts}
                  disabled={loading}
                  className="btn btn-primary w-full btn-lg group relative"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Oluşturuluyor...
                    </div>
                  ) : (
                    'Test Hesapları Oluştur'
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Test Hesapları Oluşturuldu!
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Aşağıdaki bilgileri kullanarak giriş yapabilirsiniz.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Teacher Account */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Öğretmen Hesabı</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-mono text-blue-900">{accounts.teacher.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Şifre:</span>
                        <span className="font-mono text-blue-900">{accounts.teacher.password}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rol:</span>
                        <span className="text-blue-900">{accounts.teacher.role}</span>
                      </div>
                    </div>
                  </div>

                  {/* Student Account */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">Öğrenci Hesabı</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-mono text-green-900">{accounts.student.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Şifre:</span>
                        <span className="font-mono text-green-900">{accounts.student.password}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rol:</span>
                        <span className="text-green-900">{accounts.student.role}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <a
                    href="/login"
                    className="btn btn-primary w-full btn-lg"
                  >
                    Giriş Sayfasına Git
                  </a>
                  
                  <button
                    onClick={() => setAccounts(null)}
                    className="btn btn-outline w-full"
                  >
                    Yeni Hesaplar Oluştur
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Bu sayfa sadece development modunda kullanılabilir.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

