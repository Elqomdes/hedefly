import api from './api';

export const goalsAPI = {
  // Get teacher's goals
  getMyGoals: (params) => api.get('/api/goals/my-goals', { params }),

  // Get student's goals
  getStudentGoals: (params) => api.get('/api/goals/student-goals', { params }),

  // Get single goal
  getGoal: (id) => api.get(`/api/goals/${id}`),

  // Create new goal
  create: (data) => api.post('/api/goals/create', data),

  // Update goal
  update: (id, data) => api.put(`/api/goals/${id}`, data),

  // Update milestone completion
  updateMilestone: (goalId, milestoneIndex, data) => 
    api.put(`/api/goals/${goalId}/milestones/${milestoneIndex}`, data),

  // Update metric value
  updateMetric: (goalId, metricIndex, data) => 
    api.put(`/api/goals/${goalId}/metrics/${metricIndex}`, data),

  // Add note to goal
  addNote: (goalId, data) => api.post(`/api/goals/${goalId}/notes`, data),

  // Share goal with other teachers
  share: (goalId, data) => api.post(`/api/goals/${goalId}/share`, data),

  // Delete goal
  delete: (id) => api.delete(`/api/goals/${id}`),

  // Get students for goal creation
  getStudents: () => api.get('/api/students/my-students')
};

