import axios from 'axios';
import { Platform } from 'react-native';
import Storage from './storage';

const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8000/api/v1',
  ios: 'http://127.0.0.1:8000/api/v1',
  default: 'http://127.0.0.1:8000/api/v1',
});

export const IMAGE_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8000/',
  ios: 'http://127.0.0.1:8000/',
  default: 'http://127.0.0.1:8000/',
});

export const getJobPhotoUrl = (photoUrl) => {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('http')) return photoUrl;
  return IMAGE_BASE_URL + photoUrl;
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await Storage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await Storage.removeItem('auth_token');
      await Storage.removeItem('user_data');
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/user'),
  updateProfile: (data) => api.put('/user/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Jobs
export const jobsAPI = {
  list: () => api.get('/jobs'),
  create: (data) => api.post('/jobs', data),
  get: (id) => api.get(`/jobs/${id}`),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  complete: (id) => api.put(`/jobs/${id}/complete`),
  cancel: (id) => api.put(`/jobs/${id}/cancel`),
};

// Bids
export const bidsAPI = {
  submit: (jobId, data) => api.post(`/jobs/${jobId}/bids`, data),
  myBids: () => api.get('/my-bids'),
  accept: (bidId) => api.put(`/bids/${bidId}/accept`),
  reject: (bidId) => api.put(`/bids/${bidId}/reject`),
};

// Chats
export const chatsAPI = {
  list: () => api.get('/chats'),
  get: (id) => api.get(`/chats/${id}`),
  sendMessage: (id, message) => api.post(`/chats/${id}/messages`, { message }),
};

// Notifications
export const notificationsAPI = {
  list: () => api.get('/notifications'),
};

// Reviews
export const reviewsAPI = {
  check: (jobId) => api.get(`/jobs/${jobId}/review/check`),
  submit: (jobId, data) => api.post(`/jobs/${jobId}/review`, data),
};

// Admin
export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  clients: () => api.get('/admin/clients'),
  bricoleurs: () => api.get('/admin/bricoleurs'),
  userDetails: (id) => api.get(`/admin/users/${id}`),
  verifyBricoleur: (id) => api.put(`/admin/bricoleurs/${id}/verify`),
  rejectBricoleur: (id) => api.put(`/admin/bricoleurs/${id}/reject`),
  toggleSuspend: (id) => api.put(`/admin/users/${id}/toggle-suspend`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  disputes: () => api.get('/admin/disputes'),
  resolveDispute: (id, data) => api.put(`/admin/disputes/${id}/resolve`, data),
  jobs: () => api.get('/admin/jobs'),
};

export default api;
