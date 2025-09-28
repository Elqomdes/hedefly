import api from './api';

export const teacherCollaborationAPI = {
  // Get teacher's collaborations
  getMyCollaborations: () => api.get('/api/teacher-collaboration/my-collaborations'),

  // Send collaboration request
  sendRequest: (data) => api.post('/api/teacher-collaboration/send-request', data),

  // Accept collaboration request
  acceptRequest: (collaborationId) => api.post(`/api/teacher-collaboration/accept-request/${collaborationId}`),

  // Reject collaboration request
  rejectRequest: (collaborationId) => api.post(`/api/teacher-collaboration/reject-request/${collaborationId}`),

  // Add shared student
  addSharedStudent: (data) => api.post('/api/teacher-collaboration/add-shared-student', data),

  // Remove shared student
  removeSharedStudent: (collaborationId, studentId) => 
    api.delete(`/api/teacher-collaboration/remove-shared-student/${collaborationId}/${studentId}`),

  // Update permissions
  updatePermissions: (collaborationId, teacherId, permissions) => 
    api.put(`/api/teacher-collaboration/update-permissions/${collaborationId}/${teacherId}`, { permissions }),

  // Remove collaboration
  removeCollaboration: (collaborationId, teacherId) => 
    api.delete(`/api/teacher-collaboration/remove-collaboration/${collaborationId}/${teacherId}`)
};

