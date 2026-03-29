import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor — attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signup: (data) => API.post('/auth/signup', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  forgotPassword: (data) => API.post('/auth/forgot-password', data)
};

// User Management API calls (Admin only)
export const userAPI = {
  createUser: (data) => API.post('/users', data),
  getUsers: () => API.get('/users'),
  getManagers: () => API.get('/users/managers'),
  getProfile: () => API.get('/users/profile'),
  updateProfile: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    return API.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Expense API calls
export const expenseAPI = {
  createExpense: (data) => API.post('/expenses', data),
  getMyExpenses: () => API.get('/expenses/my')
};

// Upload API
export const uploadAPI = {
  uploadReceipt: (file) => {
    const formData = new FormData()
    formData.append('receipt', file)
    return API.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
};

// Approval API
export const approvalAPI = {
  getPendingApprovals: () => API.get('/approvals/pending'),
  actionApproval: (data) => API.post('/approvals/action', data)
};

// Approval Rules API
export const approvalRuleAPI = {
  getRules: () => API.get('/approval-rules'),
  createRule: (data) => API.post('/approval-rules', data),
  updateRule: (id, data) => API.put(`/approval-rules/${id}`, data),
  deleteRule: (id) => API.delete(`/approval-rules/${id}`)
};

// Analytics API
export const analyticsAPI = {
  getSummary: () => API.get('/analytics/summary'),
  getCharts: () => API.get('/analytics/charts')
};

// AI Assistant API
export const aiAPI = {
  chat: (data) => API.post('/ai/chat', data)
};

export default API;
