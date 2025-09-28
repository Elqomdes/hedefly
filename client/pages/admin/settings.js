import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/layout/AdminLayout';
import { motion } from 'framer-motion';
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  ServerIcon,
  DatabaseIcon,
  KeyIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { authAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName: 'Hedefly',
    siteDescription: 'Öğrenci Koçluğu Sistemi',
    contactEmail: 'iletisim@edulyedu.com',
    mainWebsite: 'edulyedu.com',
    maxTeachersPerStudent: 3,
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'mp4', 'avi', 'mov'],
    emailNotifications: true,
    systemMaintenance: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    smtpServer: 'smtp.gmail.com',
    smtpPort: 587,
    smtpSSL: true,
    smtpUsername: 'noreply@edulyedu.com',
    smtpPassword: '',
    theme: 'light',
    language: 'tr',
    timezone: 'Europe/Istanbul'
  });

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getMe();
      setUser(response.data.user);
      // Load user settings from profile
      setSettings(prev => ({
        ...prev,
        ...response.data.user.notificationSettings
      }));
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
      toast.error('Ayarlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleArraySettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value.split(',').map(item => item.trim())
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Ayarlar başarıyla kaydedildi');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Ayarlar kaydedilirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'Genel', icon: CogIcon },
    { id: 'notifications', name: 'Bildirimler', icon: BellIcon },
    { id: 'security', name: 'Güvenlik', icon: ShieldCheckIcon },
    { id: 'system', name: 'Sistem', icon: ServerIcon },
    { id: 'email', name: 'Email', icon: GlobeAltIcon }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Site Bilgileri</h4>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Adı
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleSettingChange('siteName', e.target.value)}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Açıklaması
            </label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
              rows={3}
              className="input w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İletişim Email
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ana Website
              </label>
              <input
                type="url"
                value={settings.mainWebsite}
                onChange={(e) => handleSettingChange('mainWebsite', e.target.value)}
                className="input w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Sistem Limitleri</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Öğrenci Başına Maksimum Öğretmen Sayısı
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.maxTeachersPerStudent}
              onChange={(e) => handleSettingChange('maxTeachersPerStudent', parseInt(e.target.value))}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maksimum Dosya Boyutu (MB)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={settings.maxFileSize}
              onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
              className="input w-full"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Görünüm</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tema
            </label>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="input w-full"
            >
              <option value="light">Açık Tema</option>
              <option value="dark">Koyu Tema</option>
              <option value="auto">Otomatik</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dil
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="input w-full"
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zaman Dilimi
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
              className="input w-full"
            >
              <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
              <option value="Europe/London">Londra (UTC+0)</option>
              <option value="America/New_York">New York (UTC-5)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Email Bildirimleri</h4>
            <p className="text-sm text-gray-500">Sistem genelinde email bildirimleri</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Kayıt Bildirimleri</h4>
            <p className="text-sm text-gray-500">Yeni kullanıcı kayıtlarında bildirim</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.registrationEnabled}
              onChange={(e) => handleSettingChange('registrationEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Sistem Uyarıları</h4>
            <p className="text-sm text-gray-500">Sistem durumu ve güvenlik uyarıları</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={true}
              onChange={() => {}}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Email Doğrulama Gerekli</h4>
            <p className="text-sm text-gray-500">Kullanıcıların email adreslerini doğrulaması zorunlu</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.emailVerificationRequired}
              onChange={(e) => handleSettingChange('emailVerificationRequired', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Kayıt Açık</h4>
            <p className="text-sm text-gray-500">Yeni kullanıcı kayıtlarına izin ver</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.registrationEnabled}
              onChange={(e) => handleSettingChange('registrationEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Dosya Güvenliği</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İzin Verilen Dosya Türleri
            </label>
            <input
              type="text"
              value={settings.allowedFileTypes.join(', ')}
              onChange={(e) => handleArraySettingChange('allowedFileTypes', e.target.value)}
              className="input w-full"
              placeholder="pdf, doc, docx, mp4, avi, mov"
            />
            <p className="text-sm text-gray-500 mt-1">Dosya türlerini virgülle ayırarak yazın</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Hesap Güvenliği</h4>
        <div className="space-y-3">
          <button className="btn btn-outline w-full justify-start">
            <KeyIcon className="w-4 h-4 mr-2" />
            Şifre Değiştir
          </button>
          <button className="btn btn-outline w-full justify-start">
            <ShieldCheckIcon className="w-4 h-4 mr-2" />
            İki Faktörlü Kimlik Doğrulama
          </button>
          <button className="btn btn-outline w-full justify-start">
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            Güvenlik Raporu
          </button>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Sistem Bakım Modu</h4>
            <p className="text-sm text-gray-500">Sistemi bakım moduna al</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.systemMaintenance}
              onChange={(e) => handleSettingChange('systemMaintenance', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ShieldCheckIcon className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Sistem Bakım Modu
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Bakım modu aktif olduğunda kullanıcılar sisteme giriş yapamaz.</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Sistem Bilgileri</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-2">Sistem Durumu</h4>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-700">Çevrimiçi</span>
            </div>
          </div>

          <div className="card p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-2">Veritabanı</h4>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-700">Bağlantı Yok</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Sistem Yönetimi</h4>
        <div className="space-y-3">
          <button className="btn btn-outline w-full justify-start">
            <ServerIcon className="w-4 h-4 mr-2" />
            Sistem Durumu
          </button>
          <button className="btn btn-outline w-full justify-start">
            <DatabaseIcon className="w-4 h-4 mr-2" />
            Veritabanı Yönetimi
          </button>
          <button className="btn btn-outline w-full justify-start">
            <ChartBarIcon className="w-4 h-4 mr-2" />
            Performans Raporu
          </button>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">SMTP Ayarları</h4>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Sunucu
            </label>
            <input
              type="text"
              value={settings.smtpServer}
              onChange={(e) => handleSettingChange('smtpServer', e.target.value)}
              className="input w-full"
              placeholder="smtp.gmail.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Port
              </label>
              <input
                type="number"
                value={settings.smtpPort}
                onChange={(e) => handleSettingChange('smtpPort', parseInt(e.target.value))}
                className="input w-full"
                placeholder="587"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SSL Kullan
              </label>
              <select
                value={settings.smtpSSL}
                onChange={(e) => handleSettingChange('smtpSSL', e.target.value === 'true')}
                className="input w-full"
              >
                <option value="true">Evet</option>
                <option value="false">Hayır</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Kullanıcı Adı
              </label>
              <input
                type="email"
                value={settings.smtpUsername}
                onChange={(e) => handleSettingChange('smtpUsername', e.target.value)}
                className="input w-full"
                placeholder="noreply@edulyedu.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Şifresi
              </label>
              <input
                type="password"
                value={settings.smtpPassword}
                onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
                className="input w-full"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <GlobeAltIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Email Test
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Email ayarlarınızı test etmek için test emaili gönderin.</p>
            </div>
            <div className="mt-3">
              <button className="btn btn-outline btn-sm">
                Test Emaili Gönder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'system':
        return renderSystemSettings();
      case 'email':
        return renderEmailSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <AdminLayout title="Sistem Ayarları">
      <Head>
        <title>Sistem Ayarları - Hedefly Admin</title>
        <meta name="description" content="Sistem ayarlarını yönetin" />
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-6"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Sistem Ayarları</h1>
          <p className="text-gray-600">Sistem genelinde ayarları yönetin</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card p-6"
        >
          {renderTabContent()}

          {/* Save Button */}
          <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleSaveSettings}
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Ayarları Kaydet'
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}