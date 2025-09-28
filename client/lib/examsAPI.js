import api from './api';

export const examsAPI = {
  // Get teacher's exams
  getMyExams: (params) => api.get('/exams/my-exams', { params }),

  // Get student's exams
  getStudentExams: (params) => api.get('/exams/student-exams', { params }),

  // Get exam templates
  getTemplates: (params) => api.get('/exams/templates', { params }),

  // Get single exam
  getExam: (id) => api.get(`/exams/${id}`),

  // Create new exam
  create: (data) => api.post('/exams/create', data),

  // Update exam
  update: (id, data) => api.put(`/exams/${id}`, data),

  // Start exam
  start: (id) => api.post(`/exams/${id}/start`),

  // Submit exam answer
  submitAnswer: (id, data) => api.post(`/exams/${id}/submit-answer`, data),

  // Complete exam
  complete: (id) => api.post(`/exams/${id}/complete`),

  // Publish exam
  publish: (id) => api.put(`/exams/${id}/publish`),

  // Archive exam
  archive: (id) => api.put(`/exams/${id}/archive`),

  // Delete exam
  delete: (id) => api.delete(`/exams/${id}`),

  // Get students for exam assignment
  getStudents: () => api.get('/students/my-students'),

  // Get classes for exam assignment
  getClasses: () => api.get('/classes/my-classes')
};

