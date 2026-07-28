import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/auth/LoginPage';

// Resident Portal Layout & Pages
import UserLayout from '../pages/user/UserLayout';
import UserDashboard from '../pages/user/UserDashboard';
import BookAppointment from '../pages/user/BookAppointment';
import AppointmentConfirmation from '../pages/user/AppointmentConfirmation';
import VerifyResidency from '../pages/user/VerifyResidency';
import MedicalRecords from '../pages/user/MedicalRecords';

// Staff & Admin Portal Layout & Pages
import AdminLayout from '../pages/admin/AdminLayout';
import StaffDashboard from '../pages/admin/StaffDashboard';
import InventoryManagement from '../pages/admin/InventoryManagement';
import PatientManagement from '../pages/admin/PatientManagement';

// Route Guards
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* 2. Resident Portal Routes (Strictly guarded for 'resident' role) */}
      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={['resident']}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/user/dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="book-appointment" element={<BookAppointment />} />
        <Route path="appointment-confirmation" element={<AppointmentConfirmation />} />
        <Route path="verify-residency" element={<VerifyResidency />} />
        <Route path="medical-records" element={<MedicalRecords />} />
      </Route>

      {/* Publicly accessible routes for guests / pre-login intent */}
      <Route path="/book-appointment" element={<BookAppointment />} />
      <Route path="/appointment-confirmation" element={<AppointmentConfirmation />} />
      <Route path="/verify-residency" element={<VerifyResidency />} />

      {/* 3. Healthcare Staff & Admin Portal Routes (Guarded for 'staff' and 'admin' roles) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="inventory" element={<InventoryManagement />} />
        <Route path="patients" element={<PatientManagement />} />
      </Route>

      {/* Legacy direct staff route backward compatibility */}
      <Route path="/staff/dashboard" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
