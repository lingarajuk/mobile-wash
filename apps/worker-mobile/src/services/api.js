// Worker Mobile API Service connected to shared FastAPI Backend
import { Platform } from 'react-native';

const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api/v1',
  ios: 'http://localhost:5000/api/v1',
  default: 'http://localhost:5000/api/v1'
});

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Network request failed' }));
      throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn(`[Worker Mobile API] Error on ${endpoint}:`, error.message);
    throw error;
  }
};

export const workerApi = {
  // Auth
  login: async (identifier, password) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password, role: 'employee' })
    });
    if (res.token) setAuthToken(res.token);
    return res;
  },

  getProfile: async () => {
    return await request('/employees/profile');
  },

  updateProfile: async (profileData) => {
    return await request('/employees/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Jobs
  getJobs: async (statusTab = 'all') => {
    const params = statusTab !== 'all' ? `?statusTab=${statusTab}` : '';
    return await request(`/employees/jobs${params}`);
  },

  getJobById: async (jobId) => {
    return await request(`/employees/jobs/${jobId}`);
  },

  updateJobStatus: async (jobId, status, note = '') => {
    return await request(`/employees/jobs/${jobId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, note })
    });
  },

  // Work Updates
  addWorkUpdate: async (jobId, stage, message) => {
    return await request(`/employees/jobs/${jobId}/work-updates`, {
      method: 'POST',
      body: JSON.stringify({ stage, message })
    });
  },

  // Pre-Wash Vehicle Inspection
  saveInspection: async (jobId, inspectionData) => {
    return await request(`/employees/jobs/${jobId}/inspection`, {
      method: 'POST',
      body: JSON.stringify(inspectionData)
    });
  },

  // Photo Upload
  uploadPhoto: async (jobId, photoType, fileUrl) => {
    return await request(`/employees/jobs/${jobId}/photos`, {
      method: 'POST',
      body: JSON.stringify({ photoType, fileUrl })
    });
  },

  // Location Sharing
  broadcastLocation: async (jobId, latitude, longitude, speed = 0, heading = 0) => {
    return await request(`/employees/jobs/${jobId}/location`, {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, speed, heading })
    });
  }
};
