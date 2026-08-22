import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { BottomNavigation } from './components/common/BottomNavigation';
import { SplashModal } from './components/common/SplashModal';
import { OnboardingModal } from './components/common/OnboardingModal';
import { ToastContainer } from './components/common/ToastContainer';
import { ProtectedRoute } from './routes/ProtectedRoutes';

// Auth Pages
import { CustomerLogin } from './pages/auth/CustomerLogin';
import { CustomerRegister } from './pages/auth/CustomerRegister';
import { OtpVerification } from './pages/auth/OtpVerification';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { EmployeeLogin } from './pages/auth/EmployeeLogin';
import { AdminLogin } from './pages/auth/AdminLogin';

// Customer Pages
import { CustomerHome } from './pages/customer/CustomerHome';
import { ServicesPage } from './pages/customer/ServicesPage';
import { ServiceDetailPage } from './pages/customer/ServiceDetailPage';
import { BookingFlowPage } from './pages/customer/BookingFlowPage';
import { MyBookingsPage } from './pages/customer/MyBookingsPage';
import { OffersPage } from './pages/customer/OffersPage';
import { ProfilePage } from './pages/customer/ProfilePage';
import { MyVehiclesPage } from './pages/customer/MyVehiclesPage';
import { SavedAddressesPage } from './pages/customer/SavedAddressesPage';
import { MembershipPage } from './pages/customer/MembershipPage';
import { ReferAndEarnPage } from './pages/customer/ReferAndEarnPage';
import { HelpSupportPage } from './pages/customer/HelpSupportPage';
import { NotificationsPage } from './pages/customer/NotificationsPage';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { EmployeeProfile } from './pages/employee/EmployeeProfile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminEmployeesPage } from './pages/admin/AdminEmployeesPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminOffersPage } from './pages/admin/AdminOffersPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

function AppContent() {
  const { showSplash, setShowSplash, showOnboarding, setShowOnboarding } = useAuth();

  if (showSplash) {
    return (
      <SplashModal
        onComplete={() => {
          setShowSplash(false);
          setShowOnboarding(true);
        }}
      />
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingModal
        onFinish={() => setShowOnboarding(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/register" element={<CustomerRegister />} />
          <Route path="/verify-otp" element={<OtpVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/employee/login" element={<EmployeeLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Customer Main Routes */}
          <Route path="/" element={<CustomerHome />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/service/:id" element={<ServiceDetailPage />} />
          <Route path="/book" element={<BookingFlowPage />} />
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-vehicles" element={<MyVehiclesPage />} />
          <Route path="/saved-addresses" element={<SavedAddressesPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/refer-earn" element={<ReferAndEarnPage />} />
          <Route path="/help" element={<HelpSupportPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Protected Employee Routes */}
          <Route element={<ProtectedRoute allowedRoles={['employee', 'admin']} />}>
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/employee/profile" element={<EmployeeProfile />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/customers" element={<AdminCustomersPage />} />
            <Route path="/admin/employees" element={<AdminEmployeesPage />} />
            <Route path="/admin/services" element={<AdminServicesPage />} />
            <Route path="/admin/offers" element={<AdminOffersPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <BottomNavigation />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AppContent />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
