import React from 'react';
import { Menu, User, Truck, Shield } from 'lucide-react';
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

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Portal
          </span>
          <span className="hidden sm:inline-block text-neutral-300">/</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border shadow-2xs">
            <RoleIcon className="w-3.5 h-3.5" />
            <span className="text-neutral-900 font-extrabold">{meta.label}</span>
            <span className="text-neutral-400 font-normal">Dashboard</span>
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
          <div className="text-left">
            <p className="text-xs font-semibold text-neutral-900 leading-tight truncate max-w-[120px]">
              {user?.name || 'Account'}
            </p>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${meta.badge}`}
            >
              <RoleIcon className="w-2.5 h-2.5" />
              {meta.label}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};
