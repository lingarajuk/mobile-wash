import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  MOCK_CUSTOMER_USER,
  MOCK_EMPLOYEE_USER,
  MOCK_ADMIN_USER,
  INITIAL_VEHICLES,
  INITIAL_ADDRESSES,
  INITIAL_BOOKINGS,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';
import {
  vehicleService,
  addressService,
  bookingService,
  notificationService,
  authService
} from '../services/api';

const AuthContext = createContext(null);

const DEFAULT_CREDENTIALS = {
  customer: { identifier: 'rahul.sharma@example.com', password: 'customer123', role: 'customer' },
  employee: { identifier: 'venky@aquago.com', password: 'employee123', role: 'employee' },
  admin: { identifier: 'admin@aquago.com', password: 'admin123', role: 'admin' }
};

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(() => localStorage.getItem('aquago_user_role') || 'customer');
  const [user, setUser] = useState(MOCK_CUSTOMER_USER);
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // User persistent state
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState(INITIAL_VEHICLES[0]);
  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
  const [selectedAddress, setSelectedAddress] = useState(INITIAL_ADDRESSES[0]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Active Draft for Multi-Step Booking
  const [bookingDraft, setBookingDraft] = useState({
    vehicle: INITIAL_VEHICLES[0],
    service: null,
    address: INITIAL_ADDRESSES[0],
    date: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 AM – 10:00 AM',
    addons: [],
    couponCode: '',
    discount: 0,
    paymentMethod: 'UPI'
  });

  const refreshUserData = useCallback(async (currentRole = role) => {
    try {
      if (currentRole === 'customer') {
        const [vList, aList, bList, nList] = await Promise.allSettled([
          vehicleService.getVehicles(),
          addressService.getAddresses(),
          bookingService.getBookings('all'),
          notificationService.getNotifications()
        ]);

        if (vList.status === 'fulfilled' && vList.value?.length) {
          setVehicles(vList.value);
          setSelectedVehicle(vList.value[0]);
          setBookingDraft(prev => ({ ...prev, vehicle: vList.value[0] }));
        }
        if (aList.status === 'fulfilled' && aList.value?.length) {
          setAddresses(aList.value);
          setSelectedAddress(aList.value[0]);
          setBookingDraft(prev => ({ ...prev, address: aList.value[0] }));
        }
        if (bList.status === 'fulfilled' && Array.isArray(bList.value)) {
          setBookings(bList.value);
        }
        if (nList.status === 'fulfilled' && Array.isArray(nList.value)) {
          setNotifications(nList.value);
        }
      }
    } catch (err) {
      console.warn('Error refreshing user data:', err);
    }
  }, [role]);

  // Authenticate session on init or switch
  useEffect(() => {
    let active = true;
    const initAuth = async () => {
      const currentToken = localStorage.getItem('aquago_jwt_token');
      if (!currentToken || currentToken.startsWith('mock-')) {
        // Auto authenticate default role seed account
        try {
          const creds = DEFAULT_CREDENTIALS[role] || DEFAULT_CREDENTIALS.customer;
          const res = await authService.login(creds);
          if (active && res.user) {
            setUser(res.user);
          }
        } catch (e) {
          console.warn('Auto auth initialization error:', e);
        }
      }
      if (active) {
        refreshUserData(role);
      }
    };
    initAuth();
    return () => { active = false; };
  }, [role, refreshUserData]);

  const switchRole = async (newRole) => {
    setRole(newRole);
    localStorage.setItem('aquago_user_role', newRole);
    try {
      const creds = DEFAULT_CREDENTIALS[newRole];
      if (creds) {
        const res = await authService.login(creds);
        if (res.user) setUser(res.user);
      }
    } catch (e) {
      if (newRole === 'customer') setUser(MOCK_CUSTOMER_USER);
      else if (newRole === 'employee') setUser(MOCK_EMPLOYEE_USER);
      else if (newRole === 'admin') setUser(MOCK_ADMIN_USER);
    }
    refreshUserData(newRole);
  };

  const login = (roleType, userData, token = null) => {
    setRole(roleType);
    localStorage.setItem('aquago_user_role', roleType);
    if (token) {
      localStorage.setItem('aquago_jwt_token', token);
    }
    setUser(userData);
    refreshUserData(roleType);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aquago_jwt_token');
    localStorage.removeItem('aquago_user_role');
  };

  const addVehicle = async (newVeh) => {
    try {
      const v = await vehicleService.addVehicle(newVeh);
      setVehicles(prev => [v, ...prev.filter(x => x.id !== v.id)]);
      setSelectedVehicle(v);
      setBookingDraft(prev => ({ ...prev, vehicle: v }));
      return v;
    } catch (e) {
      const fallbackV = { id: `veh-${Date.now()}`, ...newVeh };
      setVehicles(prev => [...prev, fallbackV]);
      return fallbackV;
    }
  };

  const removeVehicle = async (id) => {
    try {
      await vehicleService.deleteVehicle(id);
    } catch (e) {}
    setVehicles(prev => prev.filter(v => v.id !== id));
    if (selectedVehicle?.id === id) {
      const remaining = vehicles.filter(v => v.id !== id);
      setSelectedVehicle(remaining[0] || null);
    }
  };

  const addAddress = async (newAddr) => {
    try {
      const a = await addressService.addAddress(newAddr);
      setAddresses(prev => [a, ...prev.filter(x => x.id !== a.id)]);
      setSelectedAddress(a);
      setBookingDraft(prev => ({ ...prev, address: a }));
      return a;
    } catch (e) {
      const fallbackA = { id: `addr-${Date.now()}`, ...newAddr };
      setAddresses(prev => [...prev, fallbackA]);
      return fallbackA;
    }
  };

  const removeAddress = async (id) => {
    try {
      await addressService.deleteAddress(id);
    } catch (e) {}
    setAddresses(prev => prev.filter(a => a.id !== id));
    if (selectedAddress?.id === id) {
      const remaining = addresses.filter(a => a.id !== id);
      setSelectedAddress(remaining[0] || null);
    }
  };

  const addBooking = async (newBookingData) => {
    // 1. Send real booking request to FastAPI backend
    const realB = await bookingService.createBooking(newBookingData);

    // 2. Prepend newly created MySQL booking to local state
    setBookings(prev => [realB, ...prev.filter(b => b.id !== realB.id)]);

    // 3. Add notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: 'Booking Placed! 🚗',
      message: `Your booking #${realB.bookingNumber || realB.id} for ${realB.service?.name} is placed and pending admin approval.`,
      time: 'Just now',
      read: false,
      type: 'booking'
    };
    setNotifications(prev => [newNotif, ...prev]);

    return realB;
  };

  const updateBookingStatus = (id, newStatus, step = null) => {
    bookingService.updateBookingStatus(id, newStatus, step).catch(() => {});

    setBookings(prev => prev.map(b => {
      if (b.id === id) {
        return {
          ...b,
          status: newStatus,
          progressStep: step !== null ? step : b.progressStep
        };
      }
      return b;
    }));
  };

  const markNotifAsRead = (id) => {
    notificationService.markAsRead(id).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotifsAsRead = () => {
    notificationService.markAllAsRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        switchRole,
        user,
        setUser,
        login,
        logout,
        showSplash,
        setShowSplash,
        showOnboarding,
        setShowOnboarding,
        vehicles,
        addVehicle,
        removeVehicle,
        selectedVehicle,
        setSelectedVehicle,
        addresses,
        addAddress,
        removeAddress,
        selectedAddress,
        setSelectedAddress,
        bookings,
        setBookings,
        addBooking,
        updateBookingStatus,
        bookingDraft,
        setBookingDraft,
        notifications,
        markNotifAsRead,
        markAllNotifsAsRead,
        unreadNotifCount,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
