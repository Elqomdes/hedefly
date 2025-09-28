import { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function TestMongoDB() {
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [testStatus, setTestStatus] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);
  const [debugInfo, setDebugInfo] = useState({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
    timestamp: new Date().toISOString()
  });

  const testHealth = async () => {
    try {
      setLoading(true);
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      console.log('Health check URL:', `${baseURL}/health`);
      
      const response = await axios.get(`${baseURL}/health`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Health check response:', response.data);
      setHealthStatus(response.data);
      toast.success('Health check başarılı!');
    } catch (error) {
      console.error('Health check error:', error);
      const errorData = {
        error: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      };
      setHealthStatus(errorData);
      toast.error(`Health check başarısız: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testMongoDB = async () => {
    try {
      setLoading(true);
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      console.log('MongoDB test URL:', `${baseURL}/test-mongodb`);
      
      const response = await axios.get(`${baseURL}/test-mongodb`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('MongoDB test response:', response.data);
      setTestStatus(response.data);
      toast.success('MongoDB test başarılı!');
    } catch (error) {
      console.error('MongoDB test error:', error);
      const errorData = {
        error: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      };
      setTestStatus(errorData);
      toast.error(`MongoDB test başarısız: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestAccounts = async () => {
    try {
      setLoading(true);
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      console.log('Create test accounts URL:', `${baseURL}/auth/create-test-accounts`);
      
      const response = await axios.post(`${baseURL}/auth/create-test-accounts`, {}, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Create test accounts response:', response.data);
      
      if (response.data.success) {
        toast.success('Test hesapları oluşturuldu!');
        console.log('Test accounts:', response.data.accounts);
      } else {
        toast.error(response.data.message || 'Test hesapları oluşturulamadı');
      }
    } catch (error) {
      console.error('Create test accounts error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Test hesapları oluşturulamadı';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkServerStatus = async () => {
    try {
      setLoading(true);
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      console.log('Server status check URL:', `${baseURL}/health`);
      
      const response = await axios.get(`${baseURL}/health`, { 
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Server status response:', response.data);
      setServerStatus({
        status: 'online',
        data: response.data,
        timestamp: new Date().toISOString()
      });
      toast.success('Server çalışıyor!');
    } catch (error) {
      console.error('Server status check error:', error);
      setServerStatus({
        status: 'offline',
        error: error.message,
        code: error.code,
        response: error.response?.data,
        timestamp: new Date().toISOString()
      });
      toast.error(`Server çalışmıyor: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>MongoDB Test - Hedefly</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              MongoDB Bağlantı Testi
            </h1>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">Test Adımları:</h2>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                <li>Önce "Server Durumunu Kontrol Et" butonuna tıklayın</li>
                <li>Server çalışıyorsa "Health Check Yap" butonuna tıklayın</li>
                <li>Health check başarılıysa "MongoDB Test Yap" butonuna tıklayın</li>
                <li>MongoDB test başarılıysa "Test Hesapları Oluştur" butonuna tıklayın</li>
              </ol>
            </div>

            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">Önemli Notlar:</h2>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                <li>Server'ın 5001 portunda çalıştığından emin olun</li>
                <li>MongoDB bağlantısının kurulu olduğundan emin olun</li>
                <li>Hata durumunda browser console'unu kontrol edin (F12)</li>
                <li>Server başlatmak için: <code className="bg-gray-200 px-1 rounded">npm run server</code></li>
              </ul>
            </div>

            <div className="space-y-6">
              {/* Debug Info */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h2 className="text-xl font-semibold mb-4">Debug Bilgileri</h2>
                <div className="space-y-2 text-sm">
                  <div><strong>API Base URL:</strong> {debugInfo.baseURL}</div>
                  <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
                  <div><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</div>
                </div>
              </div>

              {/* Server Status Check */}
              <div className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">Server Durumu</h2>
                <button
                  onClick={checkServerStatus}
                  disabled={loading}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
                >
                  {loading ? 'Kontrol Ediliyor...' : 'Server Durumunu Kontrol Et'}
                </button>
                
                {serverStatus && (
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <h3 className="font-semibold mb-2">Sonuç:</h3>
                    <div className="mb-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        serverStatus.status === 'offline' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {serverStatus.status === 'offline' ? 'OFFLINE' : 'ONLINE'}
                      </span>
                    </div>
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(serverStatus, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Health Check */}
              <div className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">Health Check</h2>
                <button
                  onClick={testHealth}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Test Ediliyor...' : 'Health Check Yap'}
                </button>
                
                {healthStatus && (
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <h3 className="font-semibold mb-2">Sonuç:</h3>
                    <div className="mb-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        healthStatus.error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {healthStatus.error ? 'HATA' : 'BAŞARILI'}
                      </span>
                    </div>
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(healthStatus, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* MongoDB Test */}
              <div className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">MongoDB Test</h2>
                <button
                  onClick={testMongoDB}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Test Ediliyor...' : 'MongoDB Test Yap'}
                </button>
                
                {testStatus && (
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <h3 className="font-semibold mb-2">Sonuç:</h3>
                    <div className="mb-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        testStatus.error || !testStatus.success ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {testStatus.error || !testStatus.success ? 'HATA' : 'BAŞARILI'}
                      </span>
                    </div>
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(testStatus, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Test Accounts */}
              <div className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">Test Hesapları</h2>
                <button
                  onClick={createTestAccounts}
                  disabled={loading}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Oluşturuluyor...' : 'Test Hesapları Oluştur'}
                </button>
                
                <div className="mt-4 p-4 bg-yellow-50 rounded">
                  <h3 className="font-semibold mb-2">Test Hesapları:</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Öğretmen:</strong> teacher@test.com / 123456
                    </div>
                    <div>
                      <strong>Öğrenci:</strong> student@test.com / 123456
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
