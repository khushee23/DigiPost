import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../components/layout/PublicLayout';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { TrackParcelPage } from '../pages/public/TrackParcelPage';
import { ServicesPage } from '../pages/public/ServicesPage';
import { HowItWorksPage } from '../pages/public/HowItWorksPage';
import { UnauthorizedPage } from '../pages/public/UnauthorizedPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';

// Customer Pages
import { CustomerDashboard } from '../pages/customer/CustomerDashboard';
import { BookParcelPage } from '../pages/customer/BookParcelPage';
import { MyParcelsPage } from '../pages/customer/MyParcelsPage';
import { ParcelDetailsPage } from '../pages/customer/ParcelDetailsPage';
import { CustomerComplaintsPage } from '../pages/customer/CustomerComplaintsPage';
import { CustomerFeedbackPage } from '../pages/customer/CustomerFeedbackPage';
import { CustomerNotificationsPage } from '../pages/customer/CustomerNotificationsPage';
import { CustomerProfilePage } from '../pages/customer/CustomerProfilePage';

// Employee Pages
import { EmployeeDashboard } from '../pages/employee/EmployeeDashboard';
import { AssignedDeliveriesPage } from '../pages/employee/AssignedDeliveriesPage';
import { DeliveryDetailsPage } from '../pages/employee/DeliveryDetailsPage';
import { UpdateDeliveryStatusPage } from '../pages/employee/UpdateDeliveryStatusPage';
import { DeliveryHistoryPage } from '../pages/employee/DeliveryHistoryPage';
import { EmployeeNotificationsPage } from '../pages/employee/EmployeeNotificationsPage';
import { EmployeeProfilePage } from '../pages/employee/EmployeeProfilePage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { CustomerManagementPage } from '../pages/admin/CustomerManagementPage';
import { EmployeeManagementPage } from '../pages/admin/EmployeeManagementPage';
import { ParcelManagementPage } from '../pages/admin/ParcelManagementPage';
import { DeliveryAssignmentPage } from '../pages/admin/DeliveryAssignmentPage';
import { DeliveryMonitoringPage } from '../pages/admin/DeliveryMonitoringPage';
import { ComplaintManagementPage } from '../pages/admin/ComplaintManagementPage';
import { ReportsAnalyticsPage } from '../pages/admin/ReportsAnalyticsPage';
import { AdminProfilePage } from '../pages/admin/AdminProfilePage';

import { useAuth } from '../context/AuthContext';

// Dynamic Role-based Dashboard Redirector
const RoleDashboardRedirect = () => {
  const { user } = useAuth();
  const effectiveUser = user || (() => {
    try {
      const stored = localStorage.getItem('poas_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  if (!effectiveUser) {
    return <Navigate to="/login" replace />;
  }

  const role = (effectiveUser.role || 'customer').toString().toLowerCase();
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'employee') return <Navigate to="/employee/dashboard" replace />;
  return <Navigate to="/customer/dashboard" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Universal Dashboard Dynamic Redirect */}
      <Route path="/dashboard" element={<RoleDashboardRedirect />} />

      {/* Public Pages with PublicLayout (Navbar & Footer) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/track" element={<TrackParcelPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      {/* Customer Experience (Protected: role = 'customer') */}
      <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/book" element={<BookParcelPage />} />
          <Route path="/customer/parcels" element={<MyParcelsPage />} />
          <Route path="/customer/parcels/:trackingId" element={<ParcelDetailsPage />} />
          <Route path="/customer/track" element={<TrackParcelPage />} />
          <Route path="/customer/complaints" element={<CustomerComplaintsPage />} />
          <Route path="/customer/feedback" element={<CustomerFeedbackPage />} />
          <Route path="/customer/notifications" element={<CustomerNotificationsPage />} />
          <Route path="/customer/profile" element={<CustomerProfilePage />} />
        </Route>
      </Route>

      {/* Employee Experience (Protected: role = 'employee') */}
      <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/deliveries" element={<AssignedDeliveriesPage />} />
          <Route path="/employee/deliveries/:deliveryId" element={<DeliveryDetailsPage />} />
          <Route path="/employee/status-update" element={<UpdateDeliveryStatusPage />} />
          <Route path="/employee/history" element={<DeliveryHistoryPage />} />
          <Route path="/employee/notifications" element={<EmployeeNotificationsPage />} />
          <Route path="/employee/profile" element={<EmployeeProfilePage />} />
        </Route>
      </Route>

      {/* Admin Experience (Protected: role = 'admin') */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/customers" element={<CustomerManagementPage />} />
          <Route path="/admin/employees" element={<EmployeeManagementPage />} />
          <Route path="/admin/parcels" element={<ParcelManagementPage />} />
          <Route path="/admin/assignment" element={<DeliveryAssignmentPage />} />
          <Route path="/admin/deliveries" element={<DeliveryMonitoringPage />} />
          <Route path="/admin/complaints" element={<ComplaintManagementPage />} />
          <Route path="/admin/reports" element={<ReportsAnalyticsPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
        </Route>
      </Route>

      {/* 404 Not Found Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
