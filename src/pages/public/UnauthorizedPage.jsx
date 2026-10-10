import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

export const UnauthorizedPage = () => {
  const { user } = useAuth();

  const getHomePath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'employee') return '/employee/dashboard';
    return '/customer/dashboard';
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-neutral-200 shadow-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Access Denied</h1>
        <p className="text-xs text-neutral-500 mt-2 mb-6 leading-relaxed">
          You do not have the required security credentials or role authorization to access this section of the postal system.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={getHomePath()} className="w-full sm:w-auto">
            <Button variant="primary" size="sm" icon={Home} className="w-full sm:w-auto">
              Return to My Dashboard
            </Button>
          </Link>
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" icon={ArrowLeft} className="w-full sm:w-auto">
              Public Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
