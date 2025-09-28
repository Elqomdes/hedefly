import api from './api';

export const goalsAPI = {
  // Get teacher's goals
  getMyGoals: (params) => api.get('/goals/my-goals', { params }),

  // Get student's goals
  getStudentGoals: (params) => api.get('/goals/student-goals', { params }),

  // Get single goal
  getGoal: (id) => api.get(`/goals/${id}`),

  // Create new goal
  create: (data) => api.post('/goals/create', data),

  // Update goal
  update: (id, data) => api.put(`/goals/${id}`, data),

  // Update milestone completion
  updateMilestone: (goalId, milestoneIndex, data) => 
    api.put(`/goals/${goalId}/milestones/${milestoneIndex}`, data),

  // Update metric value
  updateMetric: (goalId, metricIndex, data) => 
    api.put(`/goals/${goalId}/metrics/${metricIndex}`, data),

  // Add note to goal
  addNote: (goalId, data) => api.post(`/goals/${goalId}/notes`, data),

  // Share goal with other teachers
  share: (goalId, data) => api.post(`/goals/${goalId}/share`, data),

  // Delete goal
  delete: (id) => api.delete(`/goals/${id}`),

  // Get students for goal creation
  getStudents: () => api.get('/students/my-students')
};

