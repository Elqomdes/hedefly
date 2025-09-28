import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircleIcon, AcademicCapIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { contactAPI } from '../lib/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    subject: '',
    experience: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

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
      await contactAPI.create(formData);
      toast.success('Başvurunuz başarıyla alındı! En kısa sürede size dönüş yapacağız.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        school: '',
        subject: '',
        experience: '',
        message: ''
      });
    } catch (error) {
      toast.error('Başvuru gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const subjects = [
    'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Edebiyat',
    'Tarih', 'Coğrafya', 'Felsefe', 'İngilizce', 'Almanca', 'Fransızca',
    'Bilgisayar', 'Müzik', 'Resim', 'Beden Eğitimi', 'Diğer'
  ];

  return (
    <>
      <Head>
        <title>İletişim - Hedefly</title>
        <meta name="description" content="Hedefly öğrenci koçluğu sistemine öğretmen olarak başvuru yapın." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center">
                <h1 className="text-2xl font-bold gradient-text">Hedefly</h1>
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Ana Sayfa
                </Link>
                <Link href="/login" className="btn btn-ghost btn-md">
                  Giriş Yap
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Öğretmen Başvurusu
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hedefly öğrenci koçluğu sistemine öğretmen olarak katılmak için 
              aşağıdaki formu doldurun. Başvurunuz değerlendirildikten sonra 
              size dönüş yapacağız.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="card p-6 h-fit">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Neden Hedefly?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Modern Platform</h4>
                      <p className="text-sm text-gray-600">En son teknolojilerle geliştirilmiş kullanıcı dostu arayüz</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Detaylı Analizler</h4>
                      <p className="text-sm text-gray-600">Öğrenci performanslarını takip edin ve analiz edin</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">İşbirliği</h4>
                      <p className="text-sm text-gray-600">Meslektaşlarınızla işbirliği yapın</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">7/24 Destek</h4>
                      <p className="text-sm text-gray-600">Her zaman yanınızdayız</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  İletişim Bilgileri
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <AcademicCapIcon className="h-5 w-5 text-blue-500" />
                    <span>Eduly Eğitim Teknolojileri</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="h-5 w-5 text-blue-500" />
                    <span>iletisim@edulyedu.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-blue-500" />
                    <span>7/24 Destek</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <div className="card p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="label block text-sm font-medium text-gray-700 mb-2">
                        Ad Soyad *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="input w-full"
                        placeholder="Adınız ve soyadınız"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="label block text-sm font-medium text-gray-700 mb-2">
                        Email Adresi *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="input w-full"
                        placeholder="ornek@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="label block text-sm font-medium text-gray-700 mb-2">
                        Telefon Numarası *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="input w-full"
                        placeholder="0555 123 45 67"
                      />
                    </div>

                    <div>
                      <label htmlFor="school" className="label block text-sm font-medium text-gray-700 mb-2">
                        Okul/Kurum *
                      </label>
                      <input
                        type="text"
                        id="school"
                        name="school"
                        required
                        value={formData.school}
                        onChange={handleChange}
                        className="input w-full"
                        placeholder="Çalıştığınız okul veya kurum"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="subject" className="label block text-sm font-medium text-gray-700 mb-2">
                        Branş *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="input w-full"
                      >
                        <option value="">Branş seçin</option>
                        {subjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="experience" className="label block text-sm font-medium text-gray-700 mb-2">
                        Deneyim (Yıl) *
                      </label>
                      <input
                        type="number"
                        id="experience"
                        name="experience"
                        required
                        min="0"
                        value={formData.experience}
                        onChange={handleChange}
                        className="input w-full"
                        placeholder="Kaç yıllık deneyiminiz var?"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="label block text-sm font-medium text-gray-700 mb-2">
                      Mesaj *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="input w-full resize-none"
                      placeholder="Kendinizi tanıtın ve neden Hedefly'da çalışmak istediğinizi açıklayın..."
                    />
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        required
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="text-gray-700">
                        <a href="#" className="text-blue-600 hover:text-blue-500">
                          Kullanım şartlarını
                        </a>{' '}
                        ve{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-500">
                          gizlilik politikasını
                        </a>{' '}
                        okudum ve kabul ediyorum. *
                      </label>
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
                          Gönderiliyor...
                        </div>
                      ) : (
                        'Başvuru Gönder'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

