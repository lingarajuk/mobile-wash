import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from '@shared/context/AuthContext';
import { ToastProvider } from '@shared/context/ToastContext';
import { WorkerNavbar } from './components/WorkerNavbar';
import { ToastContainer } from '@shared/components/ToastContainer';
import { Footer } from '@shared/components/Footer';

// Worker Pages
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { EmployeeJobDetailPage } from './pages/EmployeeJobDetailPage';
import { EmployeeProfile } from './pages/EmployeeProfile';
import { EmployeeLogin } from './pages/auth/EmployeeLogin';
import { ShieldAlert, Briefcase, Home } from 'lucide-react';
import { Button } from '@shared/components/Button';

// 403 Forbidden Component
const UnauthorizedWorkerAccess = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
    <div className="w-16 h-16 rounded-3xl bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] flex items-center justify-center shadow-xs">
      <ShieldAlert className="w-8 h-8" />
    </div>
    <span className="text-[11px] font-mono uppercase font-bold text-[#EF4444] bg-[#FEF2F2] px-3 py-1 rounded-full border border-[#FECACA]">
      403 Forbidden Access
    </span>
    <h2 className="text-2xl font-black text-[#10213F]">Worker Web Application</h2>
    <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
      You are inside the Technician & Worker Portal. Customer and Administrator pages cannot be accessed from this application.
    </p>
    <div className="pt-2">
      <Link to="/jobs">
        <Button variant="primary" icon={Briefcase}>
          Back to Assigned Jobs
        </Button>
      </Link>
    </div>
  </div>
);

function WorkerAppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-[#10213F] selection:bg-[#BFDBFE] selection:text-[#10213F] font-sans antialiased">
      <WorkerNavbar />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          {/* Main Worker Routes */}
          <Route path="/" element={<EmployeeDashboard />} />
          <Route path="/jobs" element={<EmployeeDashboard />} />
          <Route path="/jobs/:bookingId" element={<EmployeeJobDetailPage />} />
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/employee/jobs" element={<EmployeeDashboard />} />
          <Route path="/employee/jobs/:bookingId" element={<EmployeeJobDetailPage />} />
          <Route path="/employee/profile" element={<EmployeeProfile />} />
          <Route path="/profile" element={<EmployeeProfile />} />
          <Route path="/history" element={<EmployeeProfile />} />
          <Route path="/reviews" element={<EmployeeProfile />} />

          {/* Worker Auth Route */}
          <Route path="/login" element={<EmployeeLogin />} />

          {/* Security Interceptor: Block Admin routes */}
          <Route path="/admin/*" element={<UnauthorizedWorkerAccess />} />

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
          <WorkerAppContent />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
