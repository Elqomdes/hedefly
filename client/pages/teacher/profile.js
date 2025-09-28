import { useState, useEffect } from 'react';
import Head from 'next/head';
import TeacherLayout from '../../components/layout/TeacherLayout';
import { motion } from 'framer-motion';
import {
  UserIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  BellIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  MapPinIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { authAPI, uploadAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function TeacherProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({});
  const [notificationSettings, setNotificationSettings] = useState({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getMe();
      setUser(response.data.user);
      setProfileData({
        firstName: response.data.user.firstName || '',
        lastName: response.data.user.lastName || '',
        email: response.data.user.email || '',
        phone: response.data.user.phone || '',
        bio: response.data.user.bio || '',
        school: response.data.user.school || '',
        subject: response.data.user.subject || '',
        experience: response.data.user.experience || 0,
        location: response.data.user.location || '',
        website: response.data.user.website || '',
        socialMedia: response.data.user.socialMedia || {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: ''
        }
      });
      setNotificationSettings(response.data.user.notificationSettings || {
        emailNotifications: true,
        pushNotifications: true,
        assignmentReminders: true,
        examReminders: true,
        goalReminders: true,
        weeklyReports: true
      });
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      toast.error('Profil bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialMediaChange = (platform, value) => {
    setProfileData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleNotificationChange = (setting, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await authAPI.updateProfile(profileData);
      toast.success('Profil başarıyla güncellendi');
      setEditing(false);
      fetchUserData();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Profil güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      await authAPI.updateNotificationSettings(notificationSettings);
      toast.success('Bildirim ayarları güncellendi');
      fetchUserData();
    } catch (error) {
      console.error('Failed to update notifications:', error);
      toast.error('Bildirim ayarları güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir resim dosyası seçin');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await authAPI.uploadProfilePicture(formData);
      toast.success('Profil resmi güncellendi');
      fetchUserData();
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Resim yüklenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profil Bilgileri', icon: UserIcon },
    { id: 'notifications', name: 'Bildirimler', icon: BellIcon },
    { id: 'security', name: 'Güvenlik', icon: ShieldCheckIcon }
  ];

  if (loading) {
    return (
      <TeacherLayout>
        <LoadingSpinner />
      </TeacherLayout>
    );
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
            <CameraIcon className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={saving}
            />
          </label>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {user?.firstName} {user?.lastName}
          </h3>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-sm text-gray-500">Öğretmen</p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ad
          </label>
          <input
            type="text"
            value={profileData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            disabled={!editing}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Soyad
          </label>
          <input
            type="text"
            value={profileData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            disabled={!editing}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={!editing}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefon
          </label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={!editing}
            className="input w-full"
          />
        </div>
      </div>

      {/* Professional Information */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Mesleki Bilgiler</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Okul
            </label>
            <input
              type="text"
              value={profileData.school}
              onChange={(e) => handleInputChange('school', e.target.value)}
              disabled={!editing}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branş
            </label>
            <input
              type="text"
              value={profileData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              disabled={!editing}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deneyim (Yıl)
            </label>
            <input
              type="number"
              value={profileData.experience}
              onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
              disabled={!editing}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konum
            </label>
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              disabled={!editing}
              className="input w-full"
            />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hakkımda
        </label>
        <textarea
          value={profileData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          disabled={!editing}
          rows={4}
          className="input w-full"
          placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
        />
      </div>

      {/* Social Media */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Sosyal Medya</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={profileData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              disabled={!editing}
              className="input w-full"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook
            </label>
            <input
              type="url"
              value={profileData.socialMedia.facebook}
              onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
              disabled={!editing}
              className="input w-full"
              placeholder="https://facebook.com/username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Twitter
            </label>
            <input
              type="url"
              value={profileData.socialMedia.twitter}
              onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
              disabled={!editing}
              className="input w-full"
              placeholder="https://twitter.com/username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn
            </label>
            <input
              type="url"
              value={profileData.socialMedia.linkedin}
              onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
              disabled={!editing}
              className="input w-full"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        {editing ? (
          <>
            <button
              onClick={() => setEditing(false)}
              className="btn btn-outline"
              disabled={saving}
            >
              <XMarkIcon className="w-4 h-4 mr-2" />
              İptal
            </button>
            <button
              onClick={handleSaveProfile}
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Kaydet
                </>
              )}
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="btn btn-primary"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Düzenle
          </button>
        )}
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Email Bildirimleri</h4>
            <p className="text-sm text-gray-500">Genel email bildirimleri al</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.emailNotifications}
              onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Ödev Hatırlatmaları</h4>
            <p className="text-sm text-gray-500">Ödev teslim tarihleri için hatırlatma</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.assignmentReminders}
              onChange={(e) => handleNotificationChange('assignmentReminders', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Sınav Hatırlatmaları</h4>
            <p className="text-sm text-gray-500">Sınav tarihleri için hatırlatma</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.examReminders}
              onChange={(e) => handleNotificationChange('examReminders', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Hedef Hatırlatmaları</h4>
            <p className="text-sm text-gray-500">Öğrenci hedefleri için hatırlatma</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.goalReminders}
              onChange={(e) => handleNotificationChange('goalReminders', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Haftalık Raporlar</h4>
            <p className="text-sm text-gray-500">Haftalık öğrenci raporları</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.weeklyReports}
              onChange={(e) => handleNotificationChange('weeklyReports', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveNotifications}
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <CheckIcon className="w-4 h-4 mr-2" />
              Bildirim Ayarlarını Kaydet
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ShieldCheckIcon className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Güvenlik Uyarısı
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Şifrenizi düzenli olarak değiştirmenizi öneririz. Güçlü bir şifre kullanın.</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Şifre Değiştir</h4>
        <p className="text-sm text-gray-500 mb-4">
          Güvenliğiniz için şifrenizi düzenli olarak değiştirin.
        </p>
        <button className="btn btn-outline">
          Şifre Değiştir
        </button>
      </div>

      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Oturum Yönetimi</h4>
        <p className="text-sm text-gray-500 mb-4">
          Aktif oturumlarınızı görüntüleyin ve yönetin.
        </p>
        <button className="btn btn-outline">
          Oturumları Görüntüle
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'security':
        return renderSecurityTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <TeacherLayout>
      <Head>
        <title>Profil - Hedefly</title>
        <meta name="description" content="Profil bilgilerinizi yönetin" />
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-6"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Profil</h1>
          <p className="text-gray-600">Hesap bilgilerinizi ve ayarlarınızı yönetin</p>
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
        </motion.div>
      </motion.div>
    </TeacherLayout>
  );
}

