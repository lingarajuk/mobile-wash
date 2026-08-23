// AquaGo Wash - Dedicated Service / API Layer connected to FastAPI Backend
import {
  INITIAL_SERVICES,
  INITIAL_BOOKINGS,
  INITIAL_VEHICLES,
  INITIAL_ADDRESSES,
  INITIAL_NOTIFICATIONS,
  INITIAL_OFFERS,
  INITIAL_CUSTOMERS,
  INITIAL_EMPLOYEES,
  INITIAL_COUPONS,
  ADMIN_ANALYTICS_DATA,
  INITIAL_BUSINESS_SETTINGS,
  ADD_ONS
} from '../data/mockData';

const BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const getHeaders = (isJson = true) => {
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem('aquago_jwt_token');
  if (token && !token.startsWith('mock-')) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Generic fetch wrapper
async function request(endpoint, options = {}, mockFallback = null) {
  try {
    const isFormData = options.body instanceof FormData;
    const defaultHeaders = isFormData ? getHeaders(false) : getHeaders(true);

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: { ...defaultHeaders, ...(options.headers || {}) }
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.detail || errData.message || `HTTP Error ${res.status}`;
      throw new Error(msg);
    }
    return await res.json();
  } catch (err) {
    if (mockFallback !== null) {
      console.warn(`[API] Endpoint ${endpoint} falling back:`, err.message);
      return mockFallback();
    }
    throw err;
  }
}

export const authService = {
  login: async (credentials) => {
    const payload = {
      identifier: credentials.identifier || credentials.email || credentials.phone,
      password: credentials.password,
      role: credentials.role || 'customer'
    };
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const token = res.token || res.access_token;
    if (token) {
      localStorage.setItem('aquago_jwt_token', token);
      localStorage.setItem('aquago_user_role', res.role || payload.role);
    }
    return res;
  },

  register: async (userData) => {
    const payload = {
      full_name: userData.fullName || userData.full_name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password || 'customer123',
      role: userData.role || 'customer'
    };
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const token = res.token || res.access_token;
    if (token) {
      localStorage.setItem('aquago_jwt_token', token);
      localStorage.setItem('aquago_user_role', res.role || payload.role);
    }
    return res;
  },

  verifyOtp: async (otp) => {
    return request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ otp })
    }, () => ({ success: true, message: 'OTP verified successfully' }));
  },

  forgotPassword: async (identifier) => {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier })
    }, () => ({ success: true, message: `Reset link & OTP sent to ${identifier}` }));
  },

  getProfile: async () => {
    return request('/users/me', { method: 'GET' });
  },

  updateProfile: async (data) => {
    return request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
};

export const serviceService = {
  getServices: async (category = null, search = '') => {
    const query = new URLSearchParams();
    if (category) query.append('category', category);
    if (search) query.append('search', search);
    return request(`/services?${query.toString()}`, { method: 'GET' }, () => INITIAL_SERVICES);
  },

  getServiceById: async (id) => {
    return request(`/services/${id}`, { method: 'GET' }, () => {
      return INITIAL_SERVICES.find(s => s.id === id) || INITIAL_SERVICES[0];
    });
  },

  getAddons: async () => {
    return request('/services/addons', { method: 'GET' }, () => ADD_ONS);
  }
};

export const bookingService = {
  getBookings: async (statusTab = 'all') => {
    return request(`/bookings?statusTab=${statusTab}`, { method: 'GET' }, () => INITIAL_BOOKINGS);
  },

  getBookingById: async (id) => {
    return request(`/bookings/${id}`, { method: 'GET' });
  },

  uploadPhoto: async (file, photoType = 'VEHICLE_PHOTO') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('photo_type', photoType);
    return request('/bookings/upload-photo', {
      method: 'POST',
      body: formData
    });
  },

  uploadJobPhoto: async (bookingId, file, photoType = 'BEFORE') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('photo_type', photoType);
    return request(`/bookings/${bookingId}/photos`, {
      method: 'POST',
      body: formData
    });
  },

  getBookingPhotos: async (bookingId) => {
    return request(`/bookings/${bookingId}/photos`, { method: 'GET' });
  },

  getBookingTimeline: async (bookingId) => {
    return request(`/bookings/${bookingId}/timeline`, { method: 'GET' });
  },

  createBooking: async (bookingPayload) => {
    return request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingPayload)
    });
  },

  verifyBooking: async (id) => {
    return request(`/bookings/${id}/verify`, { method: 'PUT' });
  },

  rejectBooking: async (id, reason) => {
    return request(`/bookings/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  },

  assignTechnician: async (id, employeeId) => {
    return request(`/bookings/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ employeeId })
    });
  },

  updateBookingStatus: async (id, status, progressStep = null, notes = null) => {
    return request(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, progressStep, notes })
    });
  },

  rescheduleBooking: async (id, date, timeSlot, reason = null) => {
    return request(`/bookings/${id}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({ date, timeSlot, reason })
    });
  },

  cancelBooking: async (id, reason = null) => {
    return request(`/bookings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  },

  updateLiveLocation: async (bookingId, locationData) => {
    return request(`/bookings/${bookingId}/location`, {
      method: 'POST',
      body: JSON.stringify(locationData)
    });
  },

  getLiveLocation: async (bookingId) => {
    return request(`/bookings/${bookingId}/location`, { method: 'GET' });
  },

  saveInspection: async (bookingId, inspectionData) => {
    return request(`/bookings/${bookingId}/inspection`, {
      method: 'POST',
      body: JSON.stringify(inspectionData)
    });
  },

  getInspection: async (bookingId) => {
    return request(`/bookings/${bookingId}/inspection`, { method: 'GET' });
  },

  submitReview: async (bookingId, reviewData) => {
    return request(`/bookings/${bookingId}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  },

  getReview: async (bookingId) => {
    return request(`/bookings/${bookingId}/review`, { method: 'GET' });
  }
};

export const vehicleService = {
  getVehicles: async () => {
    return request('/vehicles', { method: 'GET' }, () => INITIAL_VEHICLES);
  },

  addVehicle: async (vehicleData) => {
    const payload = {
      type: vehicleData.type || 'sedan',
      brand: vehicleData.brand,
      model: vehicleData.model,
      regNumber: vehicleData.regNumber || vehicleData.registration_number,
      color: vehicleData.color || 'White',
      isDefault: vehicleData.isDefault || false
    };
    return request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  deleteVehicle: async (id) => {
    return request(`/vehicles/${id}`, { method: 'DELETE' });
  }
};

export const addressService = {
  getAddresses: async () => {
    return request('/addresses', { method: 'GET' }, () => INITIAL_ADDRESSES);
  },

  addAddress: async (addressData) => {
    const payload = {
      label: addressData.label || 'Home',
      house: addressData.house,
      street: addressData.street || '',
      area: addressData.area,
      landmark: addressData.landmark || '',
      city: addressData.city || 'Mysuru',
      state: addressData.state || 'Karnataka',
      pincode: addressData.pincode || '570002',
      latitude: addressData.latitude || 12.3118,
      longitude: addressData.longitude || 76.6529,
      isDefault: addressData.isDefault || false
    };
    return request('/addresses', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  deleteAddress: async (id) => {
    return request(`/addresses/${id}`, { method: 'DELETE' });
  }
};

export const reviewService = {
  createReview: async (reviewData) => {
    return request(`/bookings/${reviewData.bookingId || reviewData.id}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }
};

export const notificationService = {
  getNotifications: async () => {
    return request('/notifications', { method: 'GET' }, () => INITIAL_NOTIFICATIONS);
  },

  markAsRead: async (id) => {
    return request(`/notifications/${id}/read`, { method: 'PUT' });
  },

  markAllAsRead: async () => {
    return request('/notifications/read-all', { method: 'PUT' });
  }
};

export const offerService = {
  getOffers: async () => {
    return request('/offers', { method: 'GET' }, () => INITIAL_OFFERS);
  },

  getCoupons: async () => {
    return request('/offers/coupons', { method: 'GET' }, () => INITIAL_COUPONS);
  },

  validateCoupon: async (code, amount) => {
    return request('/offers/validate', {
      method: 'POST',
      body: JSON.stringify({ code, amount })
    });
  }
};

export const employeeService = {
  getProfile: async () => {
    return request('/employee/profile', { method: 'GET' });
  },

  updateProfile: async (data) => {
    return request('/employee/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  getJobs: async (statusTab = 'all') => {
    return request(`/employee/jobs?statusTab=${statusTab}`, { method: 'GET' });
  },

  getJobById: async (bookingId) => {
    return request(`/employee/jobs/${bookingId}`, { method: 'GET' });
  },

  acceptJob: async (bookingId) => {
    return request(`/employee/jobs/${bookingId}/accept`, { method: 'PUT' });
  },

  updateJobStatus: async (bookingId, status, progressStep = null, notes = null) => {
    return request(`/employee/jobs/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, progressStep, notes })
    });
  },

  addWorkUpdate: async (bookingId, updateText, photoUrl = null) => {
    return request(`/employee/jobs/${bookingId}/work-update`, {
      method: 'POST',
      body: JSON.stringify({ updateText, photoUrl })
    });
  },

  getWorkUpdates: async (bookingId) => {
    return request(`/employee/jobs/${bookingId}/work-updates`, { method: 'GET' });
  },

  updateLocation: async (bookingId, locationData) => {
    return request(`/employee/jobs/${bookingId}/location`, {
      method: 'POST',
      body: JSON.stringify(locationData)
    });
  },

  saveInspection: async (bookingId, inspectionData) => {
    return request(`/employee/jobs/${bookingId}/inspection`, {
      method: 'POST',
      body: JSON.stringify(inspectionData)
    });
  },

  uploadJobPhoto: async (bookingId, file, photoType = 'BEFORE') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('photo_type', photoType);
    return request(`/employee/jobs/${bookingId}/photos`, {
      method: 'POST',
      body: formData
    });
  },

  getTimeline: async (bookingId) => {
    return request(`/employee/jobs/${bookingId}/timeline`, { method: 'GET' });
  },

  getHistory: async (dateFilter = 'all') => {
    return request(`/employee/history?dateFilter=${dateFilter}`, { method: 'GET' });
  },

  getReviews: async () => {
    return request('/employee/reviews', { method: 'GET' });
  },

  getStats: async () => {
    return request('/employee/stats', { method: 'GET' });
  }
};

export const adminService = {
  getBookings: async () => {
    return request('/admin/bookings', { method: 'GET' }, () => INITIAL_BOOKINGS);
  },

  getBookingById: async (bookingId) => {
    return request(`/admin/bookings/${bookingId}`, { method: 'GET' });
  },

  verifyBooking: async (bookingId) => {
    return request(`/admin/bookings/${bookingId}/verify`, { method: 'PUT' });
  },

  acceptBooking: async (bookingId) => {
    return request(`/admin/bookings/${bookingId}/verify`, { method: 'PUT' });
  },

  rejectBooking: async (bookingId, reason) => {
    return request(`/admin/bookings/${bookingId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  },

  assignEmployee: async (bookingId, employeeId) => {
    return request(`/admin/bookings/${bookingId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ employeeId })
    });
  },

  assignTechnician: async (bookingId, employeeId) => {
    return request(`/admin/bookings/${bookingId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ employeeId })
    });
  },

  rescheduleBooking: async (bookingId, date, timeSlot, reason = null) => {
    return request(`/bookings/${bookingId}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({ date, timeSlot, reason })
    });
  },

  cancelBooking: async (bookingId, reason = null) => {
    return request(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  },

  getAnalytics: async () => {
    return request('/admin/dashboard', { method: 'GET' }, () => ADMIN_ANALYTICS_DATA);
  },

  getCustomers: async () => {
    return request('/admin/customers', { method: 'GET' }, () => INITIAL_CUSTOMERS);
  },

  getEmployees: async () => {
    return request('/admin/employees', { method: 'GET' }, () => INITIAL_EMPLOYEES);
  },

  getSettings: async () => {
    return request('/admin/settings', { method: 'GET' }, () => INITIAL_BUSINESS_SETTINGS);
  },

  updateSettings: async (settings) => {
    return request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }
};
