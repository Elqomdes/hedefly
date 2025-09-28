import api from './api';

export const examsAPI = {
  // Get teacher's exams
  getMyExams: (params) => api.get('/api/exams/my-exams', { params }),

  // Get student's exams
  getStudentExams: (params) => api.get('/api/exams/student-exams', { params }),

  // Get exam templates
  getTemplates: (params) => api.get('/api/exams/templates', { params }),

  // Get single exam
  getExam: (id) => api.get(`/api/exams/${id}`),

  // Create new exam
  create: (data) => api.post('/api/exams/create', data),

  // Update exam
  update: (id, data) => api.put(`/api/exams/${id}`, data),

  // Start exam
  start: (id) => api.post(`/api/exams/${id}/start`),

  // Submit exam answer
  submitAnswer: (id, data) => api.post(`/api/exams/${id}/submit-answer`, data),

  // Complete exam
  complete: (id) => api.post(`/api/exams/${id}/complete`),

  // Publish exam
  publish: (id) => api.put(`/api/exams/${id}/publish`),

  // Archive exam
  archive: (id) => api.put(`/api/exams/${id}/archive`),

  // Delete exam
  delete: (id) => api.delete(`/api/exams/${id}`),

  // Get students for exam assignment
  getStudents: () => api.get('/api/students/my-students'),

  // Get classes for exam assignment
  getClasses: () => api.get('/api/classes/my-classes')
};

