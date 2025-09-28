import api from './api';

export const passwordResetAPI = {
  forgotPassword: (email) => api.post('/password-reset/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/password-reset/reset-password', { token, password }),
  verifyResetToken: (token) => api.get(`/password-reset/verify-reset-token/${token}`),
};

