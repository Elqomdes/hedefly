import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import StudentSidebar from './StudentSidebar';
import Header from './Header';

export default function StudentLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isAuthenticated, isStudent, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isStudent)) {
      router.push('/login');
    }
  }, [isAuthenticated, isStudent, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isStudent) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex w-full layout-container">
      <StudentSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        
        <main className="flex-1 bg-gray-50 overflow-x-hidden w-full">
          <div className="p-4 sm:p-6 lg:p-8 w-full max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
