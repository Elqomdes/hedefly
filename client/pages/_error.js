import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { HomeIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

function Error({ statusCode }) {
  const router = useRouter();

  const handleRefresh = () => {
    router.reload();
  };

  const getErrorMessage = () => {
    switch (statusCode) {
      case 404:
        return {
          title: 'Sayfa Bulunamadı',
          description: 'Aradığınız sayfa mevcut değil veya taşınmış olabilir.',
          code: '404'
        };
      case 500:
        return {
          title: 'Sunucu Hatası',
          description: 'Sunucumuzda geçici bir sorun oluştu. Lütfen birkaç dakika sonra tekrar deneyin.',
          code: '500'
        };
      default:
        return {
          title: 'Bir Hata Oluştu',
          description: 'Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.',
          code: statusCode || 'Hata'
        };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <>
      <Head>
        <title>{errorInfo.title} - Hedefly</title>
        <meta name="description" content={errorInfo.description} />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-6 text-6xl font-extrabold text-gray-900">{errorInfo.code}</h1>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {errorInfo.title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {errorInfo.description}
            </p>
          </div>
          
          <div className="mt-8 space-y-4">
            <button
              onClick={handleRefresh}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Sayfayı Yenile
            </button>
            
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <HomeIcon className="h-4 w-4 mr-2" />
              Ana Sayfaya Dön
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Sorun devam ederse, lütfen{' '}
              <Link href="/contact" className="text-blue-600 hover:text-blue-500">
                bizimle iletişime geçin
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;

