import api from './api';

export const uploadAPI = {
  // Upload single file
  uploadSingle: (formData) => api.post('/upload/single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),

  // Upload multiple files
  uploadMultiple: (formData) => api.post('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),

  // Upload assignment files
  uploadAssignment: (formData) => api.post('/upload/assignment', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),

  // Upload profile picture
  uploadProfilePicture: (formData) => api.post('/upload/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),

  // Upload exam files
  uploadExam: (formData) => api.post('/upload/exam', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),

  // Delete file
  deleteFile: (filename, subdir) => api.delete(`/upload/${filename}?subdir=${subdir}`),

  // Get file info
  getFileInfo: (filename, subdir) => api.get(`/upload/info/${filename}?subdir=${subdir}`),

  // List files
  listFiles: (params) => api.get('/upload/list', { params })
};

