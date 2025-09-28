import api from './api';

export const uploadAPI = {
  // Upload single file
  uploadSingle: (formData) => api.post('/api/upload/single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),

  // Upload multiple files
  uploadMultiple: (formData) => api.post('/api/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),

  // Upload assignment files
  uploadAssignment: (formData) => api.post('/api/upload/assignment', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),

  // Upload profile picture
  uploadProfilePicture: (formData) => api.post('/api/upload/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),

  // Upload exam files
  uploadExam: (formData) => api.post('/api/upload/exam', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),

  // Delete file
  deleteFile: (filename, subdir) => api.delete(`/api/upload/${filename}?subdir=${subdir}`),

  // Get file info
  getFileInfo: (filename, subdir) => api.get(`/api/upload/info/${filename}?subdir=${subdir}`),

  // List files
  listFiles: (params) => api.get('/api/upload/list', { params })
};

