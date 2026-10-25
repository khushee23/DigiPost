import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Package,
  LayoutDashboard,
  PlusCircle,
  Clock,
  Search,
  MessageSquareWarning,
  Star,
  Bell,
  User,
  LogOut,
  Users,
  UserCheck,
  Send,
  Truck,
  BarChart3,
  X,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'customer';

  const customerNav = [
    { label: 'Overview', to: '/customer/dashboard', icon: LayoutDashboard },
    { label: 'Book a Parcel', to: '/customer/book', icon: PlusCircle },
    { label: 'My Parcels', to: '/customer/parcels', icon: Package },
    { label: 'Track Parcel', to: '/customer/track', icon: Search },
    { label: 'Complaints', to: '/customer/complaints', icon: MessageSquareWarning },
    { label: 'Feedback & Reviews', to: '/customer/feedback', icon: Star },
    { label: 'Notifications', to: '/customer/notifications', icon: Bell },
    { label: 'My Profile', to: '/customer/profile', icon: User },
  ];

  const employeeNav = [
    { label: 'Overview', to: '/employee/dashboard', icon: LayoutDashboard },
    { label: 'My Deliveries', to: '/employee/deliveries', icon: Truck },
    { label: 'Update Status', to: '/employee/status-update', icon: Clock },
    { label: 'Delivery History', to: '/employee/history', icon: FileText },
    { label: 'Notifications', to: '/employee/notifications', icon: Bell },
    { label: 'Courier Profile', to: '/employee/profile', icon: User },
  ];

  const adminNav = [
    { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Customer Management', to: '/admin/customers', icon: Users },
    { label: 'Employee Management', to: '/admin/employees', icon: UserCheck },
    { label: 'Parcel Management', to: '/admin/parcels', icon: Package },
    { label: 'Delivery Assignment', to: '/admin/assignment', icon: Send },
    { label: 'Delivery Monitoring', to: '/admin/deliveries', icon: Truck },
    { label: 'Complaint Management', to: '/admin/complaints', icon: MessageSquareWarning },
    { label: 'Reports & Analytics', to: '/admin/reports', icon: BarChart3 },
    { label: 'Admin Profile', to: '/admin/profile', icon: User },
  ];

  const navItems = role === 'admin' ? adminNav : role === 'employee' ? employeeNav : customerNav;

  const roleLabels = {
    admin: 'Administrator',
    employee: 'Postal Employee',
    customer: 'Customer Portal',
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1C1C1C] text-neutral-300 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-neutral-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header & Brand */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-800/80 bg-[#111111]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D71920] flex items-center justify-center text-white shadow-sm">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-white tracking-tight block leading-tight">
                  POST OFFICE
                </span>
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">
                  {roleLabels[role] || 'System'}
                </span>
              </div>
            </div>
            {/* Close mobile button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#D71920] text-white shadow-md font-semibold'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer / User & Logout */}
        <div className="p-3 border-t border-neutral-800 bg-[#171717]">
          <div className="px-3 py-2 flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                  role === 'admin'
                    ? 'bg-red-950/80 text-red-400 border border-red-800/60'
                    : role === 'employee'
                    ? 'bg-blue-950/80 text-blue-400 border border-blue-800/60'
                    : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                }`}>
                  Role: {roleLabels[role] || role}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
          >
            <LogOut className="w-4 h-4 text-neutral-500 hover:text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
