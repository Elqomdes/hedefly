// API Constants
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

// Assignment Types
export const ASSIGNMENT_TYPES = {
  INDIVIDUAL: 'individual',
  CLASS: 'class'
};

// Exam Types
export const EXAM_TYPES = {
  QUIZ: 'quiz',
  EXAM: 'exam',
  PRACTICE: 'practice'
};

// Plan Types
export const PLAN_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

// Contact Status
export const CONTACT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Task Priority
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// Subjects
export const SUBJECTS = [
  'Matematik',
  'Fizik',
  'Kimya',
  'Biyoloji',
  'Türkçe',
  'Edebiyat',
  'Tarih',
  'Coğrafya',
  'Felsefe',
  'İngilizce',
  'Almanca',
  'Fransızca',
  'Bilgisayar',
  'Müzik',
  'Resim',
  'Beden Eğitimi',
  'Diğer'
];

// Grades
export const GRADES = ['9', '10', '11', '12'];

// Colors
export const COLORS = [
  { name: 'Mavi', value: '#3B82F6' },
  { name: 'Yeşil', value: '#10B981' },
  { name: 'Mor', value: '#8B5CF6' },
  { name: 'Turuncu', value: '#F59E0B' },
  { name: 'Kırmızı', value: '#EF4444' },
  { name: 'Pembe', value: '#EC4899' },
  { name: 'İndigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' }
];

// File Types
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['jpg', 'jpeg', 'png', 'gif'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'txt'],
  ALL: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt']
};

// File Size Limits
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  DEFAULT: 10 * 1024 * 1024 // 10MB
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Time Constants
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000
};

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
  VERY_SLOW: 0.8
};

// Breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Toast Duration
export const TOAST_DURATION = {
  SHORT: 3000,
  NORMAL: 4000,
  LONG: 6000
};

// Chart Colors
export const CHART_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
  '#14B8A6', '#F43F5E', '#8B5A2B', '#6B7280', '#1F2937'
];

// Status Colors
export const STATUS_COLORS = {
  SUCCESS: '#10B981',
  ERROR: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
  PENDING: '#6B7280',
  ACTIVE: '#3B82F6',
  INACTIVE: '#9CA3AF'
};

// Status Text
export const STATUS_TEXT = {
  PENDING: 'Bekliyor',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  ACTIVE: 'Aktif',
  INACTIVE: 'Pasif',
  COMPLETED: 'Tamamlandı',
  IN_PROGRESS: 'Devam Ediyor',
  OVERDUE: 'Süresi Geçti'
};

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Bu alan zorunludur',
  EMAIL_INVALID: 'Geçerli bir email adresi girin',
  PHONE_INVALID: 'Geçerli bir telefon numarası girin',
  PASSWORD_MIN_LENGTH: 'Şifre en az 6 karakter olmalıdır',
  PASSWORD_MISMATCH: 'Şifreler eşleşmiyor',
  FILE_SIZE_EXCEEDED: 'Dosya boyutu çok büyük',
  FILE_TYPE_INVALID: 'Geçersiz dosya türü',
  MIN_LENGTH: (min) => `En az ${min} karakter olmalıdır`,
  MAX_LENGTH: (max) => `En fazla ${max} karakter olmalıdır`,
  MIN_VALUE: (min) => `En az ${min} olmalıdır`,
  MAX_VALUE: (max) => `En fazla ${max} olmalıdır`
};

// API Error Messages
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ağ hatası. İnternet bağlantınızı kontrol edin.',
  SERVER_ERROR: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
  UNAUTHORIZED: 'Yetkisiz erişim. Lütfen giriş yapın.',
  FORBIDDEN: 'Bu işlem için yetkiniz yok.',
  NOT_FOUND: 'Aranan kaynak bulunamadı.',
  VALIDATION_ERROR: 'Girilen bilgilerde hata var.',
  CONFLICT: 'Bu işlem çakışma yaratıyor.',
  TOO_MANY_REQUESTS: 'Çok fazla istek gönderildi. Lütfen bekleyin.'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'hedefly_token',
  USER: 'hedefly_user',
  THEME: 'hedefly_theme',
  LANGUAGE: 'hedefly_language',
  SIDEBAR_STATE: 'hedefly_sidebar_state',
  FILTERS: 'hedefly_filters'
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CONTACT: '/contact',
  TEACHER_DASHBOARD: '/teacher/dashboard',
  TEACHER_STUDENTS: '/teacher/students',
  TEACHER_CLASSES: '/teacher/classes',
  TEACHER_ASSIGNMENTS: '/teacher/assignments',
  TEACHER_EXAMS: '/teacher/exams',
  TEACHER_ANALYTICS: '/teacher/analytics',
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_ASSIGNMENTS: '/student/assignments',
  STUDENT_EXAMS: '/student/exams',
  STUDENT_PLANS: '/student/plans',
  ADMIN_DASHBOARD: '/admin/dashboard'
};

// Default Values
export const DEFAULTS = {
  PAGE_SIZE: 10,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 4000,
  ANIMATION_DURATION: 300,
  SIDEBAR_WIDTH: 320,
  HEADER_HEIGHT: 64
};

