import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Read fallback user from localStorage to eliminate state-propagation delay during navigate()
  const effectiveUser = user || (() => {
    try {
      const stored = localStorage.getItem('poas_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const effectiveToken = localStorage.getItem('poas_auth_token');
  const isAuthed = isAuthenticated || (!!effectiveUser && !!effectiveToken);

  if (isLoading && !effectiveUser) {
    return <LoadingSpinner fullPage message="Verifying security credentials..." />;
  }

  if (!isAuthed || !effectiveUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = (effectiveUser.role || '').toString().toLowerCase();
  const normalizedAllowed = allowedRoles.map((r) => r.toString().toLowerCase());

  if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(role) && role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
