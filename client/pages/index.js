import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  BookOpenIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  AcademicCapIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  StarIcon,
  UsersIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: UserGroupIcon,
    title: 'Öğrenci Yönetimi',
    description: 'Öğrencilerinizi kolayca sisteme ekleyin ve takip edin. Bireysel veya sınıf bazında yönetim yapın.',
    color: 'text-blue-600'
  },
  {
    icon: BookOpenIcon,
    title: 'Ödev & Sınav Sistemi',
    description: 'PDF, video ve link ile ödev verin. Online sınavlar oluşturun ve değerlendirin.',
    color: 'text-green-600'
  },
  {
    icon: ChartBarIcon,
    title: 'Detaylı Analizler',
    description: 'Öğrenci performanslarını radar grafikleri ve istatistiklerle takip edin.',
    color: 'text-purple-600'
  },
  {
    icon: AcademicCapIcon,
    title: 'Planlama & Hedefler',
    description: 'Günlük, haftalık ve aylık planlar oluşturun. Hedefler belirleyin ve takip edin.',
    color: 'text-orange-600'
  },
  {
    icon: UsersIcon,
    title: 'İşbirliği',
    description: 'Maksimum 3 öğretmen ile işbirliği yapın. Ortak koçluk ve takip sistemi.',
    color: 'text-indigo-600'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Güvenli Platform',
    description: 'Verileriniz güvende. Modern güvenlik standartları ile korunuyor.',
    color: 'text-red-600'
  }
];

const stats = [
  { label: 'Aktif Öğretmen', value: '500+' },
  { label: 'Öğrenci', value: '10,000+' },
  { label: 'Tamamlanan Ödev', value: '50,000+' },
  { label: 'Memnuniyet Oranı', value: '%98' }
];

const testimonials = [
  {
    name: 'Dr. Ayşe Kaya',
    role: 'Matematik Öğretmeni',
    content: 'Hedefly sayesinde öğrencilerimi çok daha iyi takip edebiliyorum. Analiz raporları harika!',
    rating: 5
  },
  {
    name: 'Mehmet Özkan',
    role: 'Fizik Öğretmeni',
    content: 'İşbirliği özelliği sayesinde meslektaşlarımla birlikte çalışmak çok kolay.',
    rating: 5
  },
  {
    name: 'Elif Demir',
    role: 'Kimya Öğretmeni',
    content: 'Ödev ve sınav sistemini çok beğendim. Öğrenciler de çok memnun.',
    rating: 5
  }
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Head>
        <title>Hedefly - Öğrenci Koçluğu Sistemi | Eduly Eğitim Teknolojileri</title>
        <meta name="description" content="Hedefly ile öğrencilerinizi daha iyi takip edin ve koçluk yapın. Modern eğitim teknolojileri ile güçlendirilmiş platform." />
        <meta name="keywords" content="öğrenci koçluğu, eğitim teknolojileri, ödev takibi, sınav sistemi, öğretmen paneli" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Navigation */}
        <nav className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold gradient-text">Hedefly</h1>
                </div>
              </div>
              
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <a href="#features" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Özellikler
                  </a>
                  <a href="#about" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Hakkımızda
                  </a>
                  <a href="#contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    İletişim
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700">
                      Hoş geldin, {user?.firstName}
                    </span>
                    <Link href={user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'}>
                      <button className="btn btn-primary btn-md">
                        Paneli Aç
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link href="/login">
                      <button className="btn btn-ghost btn-md">
                        Giriş Yap
                      </button>
                    </Link>
                    <Link href="/register">
                      <button className="btn btn-primary btn-md">
                        Kayıt Ol
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl mx-auto"
              >
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  Öğrenci Koçluğunda
                  <span className="gradient-text block">Yeni Dönem</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Hedefly ile öğrencilerinizi daha iyi takip edin, analiz edin ve koçluk yapın. 
                  Modern eğitim teknolojileri ile güçlendirilmiş kapsamlı platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <button className="btn btn-primary btn-lg group">
                      Ücretsiz Başla
                      <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  <Link href="#features">
                    <button className="btn btn-outline btn-lg">
                      Özellikleri Keşfet
                    </button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Güçlü Özellikler
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Eğitim sürecinizi kolaylaştıran ve öğrenci başarısını artıran kapsamlı araçlar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card hover-lift p-8"
                >
                  <div className={`w-12 h-12 ${feature.color} mb-4`}>
                    <feature.icon className="w-full h-full" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Öğretmenlerimiz Ne Diyor?
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Hedefly kullanan öğretmenlerimizin deneyimleri
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-white mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-blue-200 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Hemen Başlayın
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Hedefly ile öğrenci koçluğunuzu bir üst seviyeye taşıyın. 
                Ücretsiz hesap oluşturun ve farkı görün.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <button className="btn btn-primary btn-lg group">
                    Ücretsiz Hesap Oluştur
                    <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link href="/contact">
                  <button className="btn btn-outline btn-lg">
                    İletişime Geç
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-2xl font-bold mb-4">Hedefly</h3>
                <p className="text-gray-400 mb-4 max-w-md">
                  Eduly Eğitim Teknolojileri tarafından geliştirilmiş, 
                  modern öğrenci koçluğu platformu.
                </p>
                <div className="text-sm text-gray-400">
                  <p>Email: iletisim@edulyedu.com</p>
                  <p>Website: edulyedu.com</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#features" className="hover:text-white transition-colors">Özellikler</a></li>
                  <li><a href="#about" className="hover:text-white transition-colors">Hakkımızda</a></li>
                  <li><a href="/login" className="hover:text-white transition-colors">Giriş Yap</a></li>
                  <li><a href="/register" className="hover:text-white transition-colors">Kayıt Ol</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Destek</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="/contact" className="hover:text-white transition-colors">İletişim</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Yardım Merkezi</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Kullanım Şartları</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>&copy; 2024 Eduly Eğitim Teknolojileri. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

