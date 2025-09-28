import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import axios from 'axios';

// Set default base URL for all axios requests
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Export axios instance for use in other files
export const authAxios = axios;

// Set default timeout
axios.defaults.timeout = 10000;

// Set default headers
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Set up request interceptor for token
axios.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? 
      (localStorage.getItem('token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]) : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const router = useRouter();

  // Configure axios defaults
  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setToken(token);
    }
  }, []);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
          const response = await axios.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          Cookies.remove('token');
          setToken(null);
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Login attempt for:', email);
      axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await axios.post('/auth/login', { email, password });
      
      if (response.data.success && response.data.token) {
        const { token: newToken, user: userData } = response.data;
        
        Cookies.set('token', newToken, { expires: 7 });
        setToken(newToken);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        console.log('AuthContext: Login successful for:', email);
        return { success: true, user: userData };
      } else {
        console.error('AuthContext: Login failed:', response.data.message);
        return { success: false, error: response.data.message || 'Giriş başarısız' };
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Giriş yapılırken bir hata oluştu';
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const register = async (userData) => {
    try {
      axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await axios.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;
      
      Cookies.set('token', newToken, { expires: 7 });
      setToken(newToken);
      setUser(newUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Kayıt olurken bir hata oluştu' 
      };
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    router.push('/');
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      await axios.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Şifre değiştirilirken bir hata oluştu' 
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    isAuthenticated: !!user,
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
