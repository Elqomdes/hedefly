import api from './api';

export const emailVerificationAPI = {
  sendVerification: (email) => api.post('/email-verification/send-verification', { email }),
  verifyEmail: (token) => api.post('/email-verification/verify-email', { token }),
  verifyEmailToken: (token) => api.get(`/email-verification/verify-email/${token}`),
  resendVerification: (email) => api.post('/email-verification/resend-verification', { email }),
};

