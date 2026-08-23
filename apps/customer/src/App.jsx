import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from '@shared/context/AuthContext';
import { ToastProvider } from '@shared/context/ToastContext';
import { CustomerNavbar } from './components/CustomerNavbar';
import { BottomNavigation } from '@shared/components/BottomNavigation';
import { SplashModal } from '@shared/components/SplashModal';
import { OnboardingModal } from '@shared/components/OnboardingModal';
import { ToastContainer } from '@shared/components/ToastContainer';
import { Footer } from '@shared/components/Footer';

// Customer Pages
import { CustomerHome } from './pages/CustomerHome';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { BookingFlowPage } from './pages/BookingFlowPage';
import { BookingSuccessPage } from './pages/BookingSuccessPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { CustomerBookingTrackingPage } from './pages/CustomerBookingTrackingPage';
import { OffersPage } from './pages/OffersPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyVehiclesPage } from './pages/MyVehiclesPage';
import { SavedAddressesPage } from './pages/SavedAddressesPage';
import { MembershipPage } from './pages/MembershipPage';
import { ReferAndEarnPage } from './pages/ReferAndEarnPage';
import { HelpSupportPage } from './pages/HelpSupportPage';
import { NotificationsPage } from './pages/NotificationsPage';

// Auth Pages
import { CustomerLogin } from './pages/auth/CustomerLogin';
import { CustomerRegister } from './pages/auth/CustomerRegister';
import { OtpVerification } from './pages/auth/OtpVerification';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@shared/components/Button';

// 403 Forbidden Component for unauthorized paths
const UnauthorizedCustomerAccess = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
    <div className="w-16 h-16 rounded-3xl bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] flex items-center justify-center shadow-xs">
      <ShieldAlert className="w-8 h-8" />
    </div>
    <span className="text-[11px] font-mono uppercase font-bold text-[#EF4444] bg-[#FEF2F2] px-3 py-1 rounded-full border border-[#FECACA]">
      403 Forbidden Access
    </span>
    <h2 className="text-2xl font-black text-[#10213F]">Customer Web Application</h2>
    <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
      You are currently inside the Customer Portal. Worker and Admin dashboards are hosted on dedicated portals and cannot be accessed from the customer application.
    </p>
    <div className="pt-2">
      <Link to="/">
        <Button variant="primary" icon={Home}>
          Back to Customer Home
        </Button>
      </Link>
    </div>
  </div>
);

function CustomerAppContent() {
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
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-[#10213F] selection:bg-[#BFDBFE] selection:text-[#10213F] font-sans antialiased">
      <CustomerNavbar />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          {/* Main Customer Routes */}
          <Route path="/" element={<CustomerHome />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/service/:id" element={<ServiceDetailPage />} />
          <Route path="/booking/:serviceId" element={<BookingFlowPage />} />
          <Route path="/booking" element={<BookingFlowPage />} />
          <Route path="/book/:serviceId" element={<BookingFlowPage />} />
          <Route path="/book" element={<BookingFlowPage />} />
          <Route path="/booking/success/:bookingId" element={<BookingSuccessPage />} />
          
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/my-bookings/:bookingId" element={<CustomerBookingTrackingPage />} />
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route path="/bookings/:bookingId" element={<CustomerBookingTrackingPage />} />

          <Route path="/offers" element={<OffersPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-vehicles" element={<MyVehiclesPage />} />
          <Route path="/saved-addresses" element={<SavedAddressesPage />} />
          <Route path="/refer-earn" element={<ReferAndEarnPage />} />
          <Route path="/help" element={<HelpSupportPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/register" element={<CustomerRegister />} />
          <Route path="/verify-otp" element={<OtpVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Security Interceptors: Block Admin & Worker routes */}
          <Route path="/admin/*" element={<UnauthorizedCustomerAccess />} />
          <Route path="/employee/*" element={<UnauthorizedCustomerAccess />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <BottomNavigation />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <CustomerAppContent />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
