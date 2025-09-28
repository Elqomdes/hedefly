import { authAxios } from '../contexts/AuthContext';

// Use the same axios instance as AuthContext
const api = authAxios;

// Request interceptor
api.interceptors.request.use(
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/login';
      }
    } else if (error.response?.status === 503 || error.response?.status === 202) {
      // Database connection error
      if (typeof window !== 'undefined') {
        console.error('Veritabanı bağlantı hatası:', error.response.data);
        
        // Show user-friendly error message
        import('../utils/helpers').then(({ getDatabaseErrorMessage, shouldRetryRequest }) => {
          const message = getDatabaseErrorMessage(error);
          const shouldRetry = shouldRetryRequest(error);
          
          // Store error info for retry logic
          if (shouldRetry) {
            error.retryable = true;
            error.retryAfter = error.response?.data?.retryAfter || 5;
          }
          
          // Enhanced error object
          error.userMessage = message;
          error.isDatabaseError = true;
        }).catch(() => {
          // Fallback if helpers can't be loaded
          error.userMessage = 'Veritabanı bağlantı hatası. Lütfen daha sonra tekrar deneyin.';
          error.isDatabaseError = true;
        });
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  changePassword: (passwords) => api.put('/auth/change-password', passwords),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  updateNotificationSettings: (settings) => api.put('/auth/notification-settings', settings),
  uploadProfilePicture: (file) => api.post('/auth/upload-profile-picture', file, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Teachers API
export const teachersAPI = {
  getStudents: () => api.get('/teachers/students'),
  addStudent: (studentData) => api.post('/teachers/students', studentData),
  getCollaboratingTeachers: () => api.get('/teachers/collaborate'),
  addCollaboration: (teacherData) => api.post('/teachers/collaborate', teacherData),
  removeCollaboration: (teacherId) => api.delete(`/teachers/collaborate/${teacherId}`),
  getClasses: (params) => api.get('/teachers/classes', { params }),
  createClass: (classData) => api.post('/teachers/classes', classData),
  addStudentsToClass: (classId, studentIds) => api.post(`/teachers/classes/${classId}/students`, { studentIds }),
  getStudentAnalytics: (studentId, period) => api.get(`/teachers/students/${studentId}/analytics`, { params: { period } }),
};

// Students API
export const studentsAPI = {
  getAssignments: () => api.get('/students/assignments'),
  submitAssignment: (assignmentId, data) => api.post(`/students/assignments/${assignmentId}/submit`, data),
  getExams: () => api.get('/students/exams'),
  submitExam: (examId, answers) => api.post(`/students/exams/${examId}/submit`, { answers }),
  getClasses: () => api.get('/students/classes'),
  getPlans: (params) => api.get('/students/plans', { params }),
  updatePlanTask: (planId, taskIndex, isCompleted) => api.put(`/students/plans/${planId}/tasks/${taskIndex}`, { isCompleted }),
  getGoals: (params) => api.get('/students/goals', { params }),
  getAnalytics: (params) => api.get('/students/analytics', { params }),
  getTeachers: () => api.get('/students/teachers'),
  getDashboard: () => api.get('/students/dashboard'),
};

// Assignments API
export const assignmentsAPI = {
  create: (assignmentData) => api.post('/assignments', assignmentData),
  getAll: (params) => api.get('/assignments/all', { params }),
  getById: (id) => api.get(`/assignments/${id}`),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
  grade: (id, data) => api.put(`/assignments/${id}/grade`, data),
  downloadAttachment: (id, attachmentId) => api.get(`/assignments/${id}/download/${attachmentId}`, { responseType: 'blob' }),
};

// Exams API
export const examsAPI = {
  create: (examData) => api.post('/exams', examData),
  getAll: (params) => api.get('/exams/all', { params }),
  getById: (id) => api.get(`/exams/${id}`),
  getForStudent: (id) => api.get(`/exams/${id}/student`),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`),
  getResults: (id) => api.get(`/exams/${id}/results`),
};

// Classes API
export const classesAPI = {
  getAll: (params) => api.get('/classes', { params }),
  getById: (id) => api.get(`/classes/${id}`),
  create: (classData) => api.post('/classes', classData),
  update: (id, data) => api.put(`/classes/${id}`, data),
  addStudents: (id, studentIds) => api.post(`/classes/${id}/students`, { studentIds }),
  removeStudent: (id, studentId) => api.delete(`/classes/${id}/students/${studentId}`),
  addCollaboration: (id, teacherId) => api.post(`/classes/${id}/collaborate`, { teacherId }),
  removeCollaboration: (id, teacherId) => api.delete(`/classes/${id}/collaborate/${teacherId}`),
  delete: (id) => api.delete(`/classes/${id}`),
  getStatistics: (id) => api.get(`/classes/${id}/statistics`),
};

// Analytics API
export const analyticsAPI = {
  getStudentAnalytics: (studentId, period) => api.get(`/analytics/student/${studentId}`, { params: { period } }),
  getClassAnalytics: (classId, period) => api.get(`/analytics/class/${classId}`, { params: { period } }),
  generateStudentReport: (studentId, options) => api.post(`/analytics/student/${studentId}/report`, options),
  getAdminStats: () => api.get('/analytics/admin/stats'),
};

// Plans API
export const plansAPI = {
  getAll: (params) => api.get('/plans/my-plans', { params }),
  getStudentPlans: (params) => api.get('/plans/student-plans', { params }),
  getTemplates: (params) => api.get('/plans/templates', { params }),
  getById: (id) => api.get(`/plans/${id}`),
  create: (planData) => api.post('/plans/create', planData),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
  updateTopic: (id, subjectIndex, topicIndex, data) => api.put(`/plans/${id}/topics/${subjectIndex}/${topicIndex}`, data),
  updateGoal: (id, goalIndex, data) => api.put(`/plans/${id}/goals/${goalIndex}`, data),
  duplicate: (id, templateName) => api.post(`/plans/${id}/duplicate`, { templateName }),
};

// Goals API
export const goalsAPI = {
  getMyGoals: (params) => api.get('/goals/my-goals', { params }),
  getStudentGoals: (params) => api.get('/goals/student-goals', { params }),
  getById: (id) => api.get(`/goals/${id}`),
  create: (goalData) => api.post('/goals/create', goalData),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  updateMilestone: (id, milestoneIndex, data) => api.put(`/goals/${id}/milestones/${milestoneIndex}`, data),
  updateMetric: (id, metricIndex, data) => api.put(`/goals/${id}/metrics/${metricIndex}`, data),
  addNote: (id, data) => api.post(`/goals/${id}/notes`, data),
  share: (id, data) => api.post(`/goals/${id}/share`, data),
};

// Users API (Admin)
export const usersAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  updateStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  delete: (id) => api.delete(`/admin/users/${id}`),
};

// Contact API
export const contactAPI = {
  create: (contactData) => api.post('/contact', contactData),
  getAll: (params) => api.get('/contact', { params }),
  getById: (id) => api.get(`/contact/${id}`),
  updateStatus: (id, data) => api.put(`/contact/${id}/status`, data),
  delete: (id) => api.delete(`/contact/${id}`),
  getStats: () => api.get('/contact/stats/overview'),
};

// Assignment Evaluations API
export { assignmentEvaluationsAPI } from './assignmentEvaluationsAPI';

// Email Verification API
export { emailVerificationAPI } from './emailVerificationAPI';

// Password Reset API
export { passwordResetAPI } from './passwordResetAPI';

// Teacher Collaboration API
export { teacherCollaborationAPI } from './teacherCollaborationAPI';

// Upload API
export { uploadAPI } from './uploadAPI';

export default api;
