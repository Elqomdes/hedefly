import api from './api';

export const assignmentEvaluationsAPI = {
  // Get teacher's evaluations
  getMyEvaluations: (params) => api.get('/assignment-evaluations/my-evaluations', { params }),

  // Get student's evaluations
  getStudentEvaluations: (params) => api.get('/assignment-evaluations/student-evaluations', { params }),

  // Get single evaluation
  getEvaluation: (id) => api.get(`/assignment-evaluations/${id}`),

  // Submit assignment
  submit: (data) => api.post('/assignment-evaluations/submit', data),

  // Evaluate assignment
  evaluate: (id, data) => api.put(`/assignment-evaluations/${id}/evaluate`, data),

  // Return evaluation to student
  returnEvaluation: (id) => api.put(`/assignment-evaluations/${id}/return`),

  // Add comment to evaluation
  addComment: (id, data) => api.post(`/assignment-evaluations/${id}/comments`, data),

  // Request extension
  requestExtension: (id, data) => api.post(`/assignment-evaluations/${id}/request-extension`, data),

  // Approve/Reject extension
  processExtension: (id, extensionId, data) => api.put(`/assignment-evaluations/${id}/extensions/${extensionId}`, data),

  // Delete evaluation
  delete: (id) => api.delete(`/assignment-evaluations/${id}`),

  // Get assignments for evaluation
  getAssignments: () => api.get('/assignments/my-assignments'),

  // Get students for evaluation
  getStudents: () => api.get('/students/my-students')
};

