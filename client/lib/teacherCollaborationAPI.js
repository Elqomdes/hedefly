import api from './api';

export const teacherCollaborationAPI = {
  // Get teacher's collaborations
  getMyCollaborations: () => api.get('/teacher-collaboration/my-collaborations'),

  // Send collaboration request
  sendRequest: (data) => api.post('/teacher-collaboration/send-request', data),

  // Accept collaboration request
  acceptRequest: (collaborationId) => api.post(`/teacher-collaboration/accept-request/${collaborationId}`),

  // Reject collaboration request
  rejectRequest: (collaborationId) => api.post(`/teacher-collaboration/reject-request/${collaborationId}`),

  // Add shared student
  addSharedStudent: (data) => api.post('/teacher-collaboration/add-shared-student', data),

  // Remove shared student
  removeSharedStudent: (collaborationId, studentId) => 
    api.delete(`/teacher-collaboration/remove-shared-student/${collaborationId}/${studentId}`),

  // Update permissions
  updatePermissions: (collaborationId, teacherId, permissions) => 
    api.put(`/teacher-collaboration/update-permissions/${collaborationId}/${teacherId}`, { permissions }),

  // Remove collaboration
  removeCollaboration: (collaborationId, teacherId) => 
    api.delete(`/teacher-collaboration/remove-collaboration/${collaborationId}/${teacherId}`)
};

