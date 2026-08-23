// Customer Mobile API Service connected to shared FastAPI Backend
import { Platform } from 'react-native';

// Android Emulator connects to host via 10.0.2.2; Real devices connect via computer's LAN IP or localhost
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
    console.warn(`[Mobile API] Error on ${endpoint}:`, error.message);
    throw error;
  }
};

export const customerApi = {
  // Auth
  login: async (identifier, password) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password, role: 'customer' })
    });
    if (res.token) setAuthToken(res.token);
    return res;
  },

  register: async (userData) => {
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  getCurrentUser: async () => {
    return await request('/auth/me');
  },

  // Services
  getServices: async (vehicleType = 'all') => {
    const params = vehicleType !== 'all' ? `?vehicle_type=${vehicleType}` : '';
    return await request(`/services/${params}`);
  },

  getServiceById: async (serviceId) => {
    return await request(`/services/${serviceId}`);
  },

  // Vehicles & Addresses
  getVehicles: async () => {
    return await request('/vehicles');
  },

  getAddresses: async () => {
    return await request('/addresses');
  },

  // Bookings
  getBookings: async () => {
    return await request('/bookings');
  },

  getBookingById: async (bookingId) => {
    return await request(`/bookings/${bookingId}`);
  },

  createBooking: async (bookingData) => {
    return await request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },

  cancelBooking: async (bookingId, reason = 'Cancelled by user') => {
    return await request(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  // Reviews
  submitReview: async (bookingId, rating, comment) => {
    return await request(`/bookings/${bookingId}/review`, {
      method: 'POST',
      body: JSON.stringify({ rating, feedback: comment })
    });
  },

  // Notifications
  getNotifications: async () => {
    return await request('/notifications');
  },

  // Offers
  getOffers: async () => {
    return await request('/offers');
  }
};
