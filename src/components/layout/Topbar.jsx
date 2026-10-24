import React from 'react';
import { Menu, User, ShieldCheck, Truck, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { Link } from 'react-router-dom';

export const Topbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const role = user?.role || 'customer';

  const roleMeta = {
    admin: { label: 'Admin', icon: Shield, badge: 'bg-red-50 text-[#D71920] border-red-200' },
    employee: { label: 'Postal Courier', icon: Truck, badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    customer: { label: 'Customer', icon: User, badge: 'bg-neutral-100 text-neutral-700 border-neutral-200' },
  };

  const meta = roleMeta[role] || roleMeta.customer;
  const RoleIcon = meta.icon;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left side: Hamburger toggle + breadcrumb / portal title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Portal
          </span>
          <span className="text-neutral-300">/</span>
          <span className="text-sm font-semibold text-neutral-800 capitalize">
            {role} Control Center
          </span>
        </div>
      </div>

      {/* Right side: Notifications + User profile badge */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification dropdown */}
        <NotificationDropdown />

        <div className="h-6 w-px bg-neutral-200 hidden sm:block" />

        {/* User Pill */}
        <Link
          to={`/${role}/profile`}
          className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center text-xs font-bold shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-neutral-900 leading-tight truncate max-w-[120px]">
              {user?.name || 'Account'}
            </p>
            <span
              className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded border ${meta.badge}`}
            >
              {meta.label}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};
