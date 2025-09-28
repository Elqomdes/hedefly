import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  UserIcon,
  PencilIcon,
  CameraIcon,
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI, uploadAPI } from '../../lib/api';
import FileUpload from '../../components/ui/FileUpload';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    school: '',
    subject: '',
    experience: '',
    location: '',
    website: '',
    socialMedia: {
      twitter: '',
      linkedin: '',
      instagram: ''
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    assignmentReminders: true,
    examReminders: true,
    goalReminders: true,
    weeklyReports: true
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        school: user.school || '',
        subject: user.subject || '',
        experience: user.experience || '',
        location: user.location || '',
        website: user.website || '',
        socialMedia: {
          twitter: user.socialMedia?.twitter || '',
          linkedin: user.socialMedia?.linkedin || '',
          instagram: user.socialMedia?.instagram || ''
        }
      });
      setNotificationSettings({
        emailNotifications: user.notificationSettings?.emailNotifications ?? true,
        pushNotifications: user.notificationSettings?.pushNotifications ?? true,
        assignmentReminders: user.notificationSettings?.assignmentReminders ?? true,
        examReminders: user.notificationSettings?.examReminders ?? true,
        goalReminders: user.notificationSettings?.goalReminders ?? true,
        weeklyReports: user.notificationSettings?.weeklyReports ?? true
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(profileData);
      updateUser(response.data.user);
      toast.success('Profil güncellendi');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('Yeni şifreler eşleşmiyor');
        return;
      }

      await authAPI.changePassword(passwordData);
      toast.success('Şifre değiştirildi');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.message || 'Şifre değiştirilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);

    try {
      await authAPI.updateNotificationSettings(notificationSettings);
      toast.success('Bildirim ayarları güncellendi');
    } catch (error) {
      console.error('Notification update error:', error);
      toast.error('Bildirim ayarları güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (files) => {
    try {
      const response = await uploadAPI.uploadProfilePicture(files[0]);
      const profilePictureUrl = response.data.data.url;
      
      await authAPI.updateProfile({ profilePicture: profilePictureUrl });
      updateUser({ ...user, profilePicture: profilePictureUrl });
      toast.success('Profil resmi güncellendi');
    } catch (error) {
      console.error('Profile picture upload error:', error);
      toast.error('Profil resmi yüklenirken bir hata oluştu');
    }
  };

  const tabs = [
    { id: 'personal', name: 'Kişisel Bilgiler', icon: UserIcon },
    { id: 'security', name: 'Güvenlik', icon: KeyIcon },
    { id: 'notifications', name: 'Bildirimler', icon: BellIcon },
    { id: 'privacy', name: 'Gizlilik', icon: ShieldCheckIcon }
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profil Resmi"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="h-12 w-12 text-gray-400" />
            )}
          </div>
          <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors">
            <CameraIcon className="h-4 w-4" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {user?.firstName} {user?.lastName}
          </h3>
          <p className="text-gray-500">{user?.email}</p>
          <FileUpload
            onUpload={handleProfilePictureUpload}
            multiple={false}
            acceptedTypes={{
              'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
            }}
            purpose="profile-picture"
            className="mt-2"
          />
        </div>
      </div>

      {/* Personal Information Form */}
      <form onSubmit={handleProfileUpdate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ad
            </label>
            <input
              type="text"
              value={profileData.firstName}
              onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
              className="input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Soyad
            </label>
            <input
              type="text"
              value={profileData.lastName}
              onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
              className="input w-full"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="input w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hakkında
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
            rows={4}
            className="input w-full"
            placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
          />
        </div>

        {user?.role === 'teacher' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Okul
                </label>
                <input
                  type="text"
                  value={profileData.school}
                  onChange={(e) => setProfileData({ ...profileData, school: e.target.value })}
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
                  onChange={(e) => setProfileData({ ...profileData, subject: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deneyim (Yıl)
                </label>
                <input
                  type="number"
                  value={profileData.experience}
                  onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                  className="input w-full"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konum
                </label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            value={profileData.website}
            onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
            className="input w-full"
            placeholder="https://example.com"
          />
        </div>

        {/* Social Media */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Sosyal Medya</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter
              </label>
              <input
                type="text"
                value={profileData.socialMedia.twitter}
                onChange={(e) => setProfileData({
                  ...profileData,
                  socialMedia: { ...profileData.socialMedia, twitter: e.target.value }
                })}
                className="input w-full"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <input
                type="text"
                value={profileData.socialMedia.linkedin}
                onChange={(e) => setProfileData({
                  ...profileData,
                  socialMedia: { ...profileData.socialMedia, linkedin: e.target.value }
                })}
                className="input w-full"
                placeholder="linkedin.com/in/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="text"
                value={profileData.socialMedia.instagram}
                onChange={(e) => setProfileData({
                  ...profileData,
                  socialMedia: { ...profileData.socialMedia, instagram: e.target.value }
                })}
                className="input w-full"
                placeholder="@username"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Güncelleniyor...' : 'Güncelle'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <form onSubmit={handlePasswordChange} className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Şifre Değiştir</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mevcut Şifre
          </label>
          <input
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            className="input w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Yeni Şifre
          </label>
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            className="input w-full"
            required
            minLength={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Yeni Şifre Tekrar
          </label>
          <input
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            className="input w-full"
            required
            minLength={6}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Değiştiriliyor...' : 'Şifre Değiştir'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Bildirim Ayarları</h3>
      
      <div className="space-y-4">
        {Object.entries(notificationSettings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h4>
              <p className="text-sm text-gray-500">
                {key === 'emailNotifications' && 'Email bildirimleri al'}
                {key === 'pushNotifications' && 'Push bildirimleri al'}
                {key === 'assignmentReminders' && 'Ödev hatırlatmaları'}
                {key === 'examReminders' && 'Sınav hatırlatmaları'}
                {key === 'goalReminders' && 'Hedef hatırlatmaları'}
                {key === 'weeklyReports' && 'Haftalık raporlar'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  [key]: e.target.checked
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNotificationUpdate}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Güncelleniyor...' : 'Ayarları Kaydet'}
        </button>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Gizlilik Ayarları</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Profil Görünürlüğü</h4>
            <p className="text-sm text-gray-500">Profilinizi diğer kullanıcılara göster</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Email Görünürlüğü</h4>
            <p className="text-sm text-gray-500">Email adresinizi diğer kullanıcılara göster</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Aktivite Durumu</h4>
            <p className="text-sm text-gray-500">Çevrimiçi durumunuzu göster</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalInfo();
      case 'security':
        return renderSecurity();
      case 'notifications':
        return renderNotifications();
      case 'privacy':
        return renderPrivacy();
      default:
        return renderPersonalInfo();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Profil - Hedefly</title>
        <meta name="description" content="Profil yönetimi" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold gradient-text">Profil</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card p-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {tab.name}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="card p-6"
              >
                {renderTabContent()}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

