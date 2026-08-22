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
  INITIAL_BUSINESS_SETTINGS
} from '../data/mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: { ...getHeaders(), ...(options.headers || {}) }
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
    return request(`/services/${id}`, { method: 'GET' });
  }
};

export const bookingService = {
  getBookings: async (statusTab = 'all') => {
    return request(`/bookings?statusTab=${statusTab}`, { method: 'GET' });
  },

  getBookingById: async (id) => {
    return request(`/bookings/${id}`, { method: 'GET' });
  },

  createBooking: async (bookingPayload) => {
    const payload = {
      serviceId: bookingPayload.serviceId || bookingPayload.service?.id,
      vehicleId: bookingPayload.vehicleId || bookingPayload.vehicle?.id,
      addressId: bookingPayload.addressId || bookingPayload.address?.id,
      date: bookingPayload.date,
      timeSlot: bookingPayload.timeSlot,
      addonIds: (bookingPayload.addons || []).map(a => (typeof a === 'string' ? a : a.id)),
      couponCode: bookingPayload.couponApplied || bookingPayload.couponCode || null,
      paymentMethod: bookingPayload.paymentMethod || 'UPI (Google Pay)'
    };
    return request('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateBookingStatus: async (id, status, progressStep = null) => {
    return request(`/employee/jobs/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, progressStep })
    });
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

  getJobs: async () => {
    return request('/employee/jobs', { method: 'GET' });
  },

  acceptJob: async (bookingId) => {
    return request(`/employee/jobs/${bookingId}/accept`, { method: 'PUT' });
  },

  updateJobStatus: async (bookingId, status, progressStep = null) => {
    return request(`/employee/jobs/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, progressStep })
    });
  }
};

export const adminService = {
  getBookings: async () => {
    return request('/admin/bookings', { method: 'GET' });
  },

  getBookingById: async (bookingId) => {
    return request(`/admin/bookings/${bookingId}`, { method: 'GET' });
  },

  acceptBooking: async (bookingId) => {
    return request(`/admin/bookings/${bookingId}/accept`, { method: 'PUT' });
  },

  assignEmployee: async (bookingId, employeeId) => {
    return request(`/admin/bookings/${bookingId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ employeeId })
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
