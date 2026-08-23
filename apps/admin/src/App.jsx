import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@shared/context/AuthContext';
import { ToastProvider } from '@shared/context/ToastContext';
import { AdminNavbar } from './components/AdminNavbar';
import { ToastContainer } from '@shared/components/ToastContainer';
import { Footer } from '@shared/components/Footer';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminBookingsPage } from './pages/AdminBookingsPage';
import { AdminBookingDetailPage } from './pages/AdminBookingDetailPage';
import { AdminEmployeesPage } from './pages/AdminEmployeesPage';
import { AdminCustomersPage } from './pages/AdminCustomersPage';
import { AdminServicesPage } from './pages/AdminServicesPage';
import { AdminOffersPage } from './pages/AdminOffersPage';
import { AdminPaymentsPage } from './pages/AdminPaymentsPage';
import { AdminReportsPage } from './pages/AdminReportsPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { AdminLogin } from './pages/auth/AdminLogin';

function AdminAppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-[#10213F] selection:bg-[#BFDBFE] selection:text-[#10213F] font-sans antialiased">
      <AdminNavbar />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          {/* Main Admin Routes */}
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/bookings/:bookingId" element={<AdminBookingDetailPage />} />
          <Route path="/admin/bookings/:bookingId" element={<AdminBookingDetailPage />} />

          <Route path="/employees" element={<AdminEmployeesPage />} />
          <Route path="/admin/employees" element={<AdminEmployeesPage />} />
          <Route path="/employees/:id" element={<AdminEmployeesPage />} />
          <Route path="/admin/employees/:id" element={<AdminEmployeesPage />} />

          <Route path="/customers" element={<AdminCustomersPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
          <Route path="/customers/:id" element={<AdminCustomersPage />} />
          <Route path="/admin/customers/:id" element={<AdminCustomersPage />} />

          <Route path="/services" element={<AdminServicesPage />} />
          <Route path="/admin/services" element={<AdminServicesPage />} />

          <Route path="/offers" element={<AdminOffersPage />} />
          <Route path="/admin/offers" element={<AdminOffersPage />} />

          <Route path="/payments" element={<AdminPaymentsPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />

          <Route path="/reports" element={<AdminReportsPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />

          <Route path="/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />

          {/* Admin Auth */}
          <Route path="/login" element={<AdminLogin />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AdminAppContent />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
