import api from './api';

export const plansAPI = {
  // Get teacher's plans
  getMyPlans: (params) => api.get('/api/plans/my-plans', { params }),

  // Get student's plans
  getStudentPlans: (params) => api.get('/api/plans/student-plans', { params }),

  // Get plan templates
  getTemplates: (params) => api.get('/api/plans/templates', { params }),

  // Get single plan
  getPlan: (id) => api.get(`/api/plans/${id}`),

  // Create new plan
  create: (data) => api.post('/api/plans/create', data),

  // Update plan
  update: (id, data) => api.put(`/api/plans/${id}`, data),

  // Update topic completion
  updateTopic: (planId, subjectIndex, topicIndex, data) => 
    api.put(`/api/plans/${planId}/topics/${subjectIndex}/${topicIndex}`, data),

  // Update goal completion
  updateGoal: (planId, goalIndex, data) => 
    api.put(`/api/plans/${planId}/goals/${goalIndex}`, data),

  // Delete plan
  delete: (id) => api.delete(`/api/plans/${id}`),

  // Duplicate plan as template
  duplicate: (id, data) => api.post(`/api/plans/${id}/duplicate`, data),

  // Get students for plan creation
  getStudents: () => api.get('/api/students/my-students')
};

