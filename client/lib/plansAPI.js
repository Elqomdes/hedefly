import api from './api';

export const plansAPI = {
  // Get teacher's plans
  getMyPlans: (params) => api.get('/plans/my-plans', { params }),

  // Get student's plans
  getStudentPlans: (params) => api.get('/plans/student-plans', { params }),

  // Get plan templates
  getTemplates: (params) => api.get('/plans/templates', { params }),

  // Get single plan
  getPlan: (id) => api.get(`/plans/${id}`),

  // Create new plan
  create: (data) => api.post('/plans/create', data),

  // Update plan
  update: (id, data) => api.put(`/plans/${id}`, data),

  // Update topic completion
  updateTopic: (planId, subjectIndex, topicIndex, data) => 
    api.put(`/plans/${planId}/topics/${subjectIndex}/${topicIndex}`, data),

  // Update goal completion
  updateGoal: (planId, goalIndex, data) => 
    api.put(`/plans/${planId}/goals/${goalIndex}`, data),

  // Delete plan
  delete: (id) => api.delete(`/plans/${id}`),

  // Duplicate plan as template
  duplicate: (id, data) => api.post(`/plans/${id}/duplicate`, data),

  // Get students for plan creation
  getStudents: () => api.get('/students/my-students')
};

