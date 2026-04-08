import axios from 'axios';

const API_BASE_URL = "http://localhost:5000/api";

// Axios instance with auth token
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== AUTH ENDPOINTS ====================

export async function registerUser(email, password, name, role = 'citizen', phone = '') {
  try {
    const res = await api.post('/auth/register', {
      email,
      password,
      name,
      role,
      phone,
    });
    
    // For citizen registration, it returns { otpSent, email }
    return res.data;
  } catch (err) {
    console.error('Register error:', err);
    return { error: err.response?.data?.error || err.message };
  }
}

export async function loginUser(email, password, role = 'citizen') {
  try {
    const res = await api.post('/auth/login', {
      email,
      password,
      role,
    });
    
    // For citizen login, it returns { otpSent, email }
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    
    return res.data;
  } catch (err) {
    console.error('Login error:', err);
    return { error: err.response?.data?.error || err.message };
  }
}

export async function resendOtp(email) {
  try {
    const res = await api.post('/auth/resend-otp', { email });
    return res.data;
  } catch (err) {
    console.error('Resend OTP error:', err);
    return { error: err.response?.data?.error || err.message };
  }
}

export async function verifyOtp(email, otp) {
  try {
    const res = await api.post('/auth/verify-otp', { email, otp });
    
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    
    return res.data;
  } catch (err) {
    console.error('Verify OTP error:', err);
    return { error: err.response?.data?.error || err.message };
  }
}

export async function logoutUser() {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

export async function getCurrentUser() {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (err) {
    console.error('Get current user error:', err);
    return null;
  }
}

export async function updateUserProfile(name, phone) {
  try {
    const res = await api.patch('/auth/me', { name, phone });
    return res.data;
  } catch (err) {
    console.error('Update profile error:', err);
    return { error: err.response?.data?.error || err.message };
  }
}

export function getStoredUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function getStoredToken() {
  return localStorage.getItem('token');
}

export function isAuthenticated() {
  return !!getStoredToken();
}

// ==================== REPORT ENDPOINTS ====================

export async function createReport(formData) {
  try {
    const res = await api.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!res.data) {
      return { error: "Failed to create report" };
    }
    
    return res.data;
  } catch (err) {
    console.error("Error creating report", err);
    return { error: err.response?.data?.error || err.message || "Network error" };
  }
}

export async function fetchReports() {
  try {
    const res = await api.get('/reports');
    
    // Backend returns array directly
    return { success: true, reports: Array.isArray(res.data) ? res.data : [] };
  } catch (err) {
    console.error("Error fetching reports", err);
    return { success: false, error: err.message, reports: [] };
  }
}

export async function fetchMyReports() {
  try {
    const res = await api.get('/reports/user/my-reports');
    
    // Backend returns array directly for user's reports
    return { success: true, reports: Array.isArray(res.data) ? res.data : [] };
  } catch (err) {
    console.error("Error fetching your reports", err);
    return { success: false, error: err.message, reports: [] };
  }
}

export async function fetchReportById(id) {
  try {
    const res = await api.get(`/reports/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching report", err);
    return { error: err.response?.data?.error || err.message };
  }
}

export async function updateReportStatus(id, status) {
  try {
    const res = await api.patch(`/reports/${id}`, { status });
    return res.data;
  } catch (err) {
    console.error("Error updating report", err);
    return { error: err.response?.data?.error || err.message };
  }
}

export async function assignReport(id, assignedDepartment) {
  try {
    const res = await api.patch(`/reports/assign/${id}`, { assignedDepartment });
    return res.data;
  } catch (err) {
    console.error("Error assigning report", err);
    return { error: err.response?.data?.error || err.message };
  }
}

export async function fetchAssignedReports() {
  try {
    const res = await api.get('/reports/assigned/me');
    return { success: true, reports: Array.isArray(res.data) ? res.data : [] };
  } catch (err) {
    console.error("Error fetching assigned reports", err);
    return { success: false, error: err.message, reports: [] };
  }
}

export async function authorityUpdateReport(id, status, remarks) {
  try {
    const res = await api.patch(`/reports/authority-update/${id}`, { status, remarks });
    return res.data;
  } catch (err) {
    console.error("Error authority updating report", err);
    return { error: err.response?.data?.error || err.message };
  }
}

export async function fetchNotifications() {
  try {
    const res = await api.get('/reports/notifications/me');
    return res.data;
  } catch (err) {
    console.error("Error fetching notifications", err);
    return [];
  }
}
